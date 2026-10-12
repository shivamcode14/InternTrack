package com.interntrack.api.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.interntrack.api.auth.AuthDtos.AuthResponse;
import com.interntrack.api.auth.AuthDtos.LoginRequest;
import com.interntrack.api.auth.AuthDtos.RegisterRequest;
import com.interntrack.api.user.UserEntity;
import com.interntrack.api.user.UserRepository;
import java.time.Duration;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private UserRepository users;

    @Mock
    private JwtEncoder jwtEncoder;

    private AuthService authService;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(users, passwordEncoder, jwtEncoder, Duration.ofHours(24));
    }

    @Test
    void registerNormalizesEmailHashesPasswordAndUsesUserIdAsTokenSubject() {
        stubJwtEncoder();
        when(users.existsByEmail("alex@example.com")).thenReturn(false);
        when(users.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity user = invocation.getArgument(0);
            ReflectionTestUtils.setField(user, "id", 7L);
            return user;
        });

        AuthResponse response = authService.register(
                new RegisterRequest(" Alex ", "  Alex@Example.com ", "password123"));

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(users).save(captor.capture());
        UserEntity savedUser = captor.getValue();
        ArgumentCaptor<JwtEncoderParameters> jwtCaptor = ArgumentCaptor.forClass(JwtEncoderParameters.class);
        verify(jwtEncoder).encode(jwtCaptor.capture());
        assertEquals("alex@example.com", savedUser.getEmail());
        assertNotEquals("password123", savedUser.getPasswordHash());
        assertTrueBcryptHash(savedUser.getPasswordHash());
        assertEquals("7", jwtCaptor.getValue().getClaims().getSubject());
        assertEquals("alex@example.com", jwtCaptor.getValue().getClaims().getClaim("email"));
        assertEquals("signed-token", response.token());
        assertEquals(7L, response.user().id());
    }

    @Test
    void registerRejectsDuplicateEmailWithConflict() {
        when(users.existsByEmail("alex@example.com")).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.register(new RegisterRequest(
                        "Alex", "ALEX@example.com", "password123")));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(users, never()).save(any(UserEntity.class));
    }

    @Test
    void loginRejectsWrongPasswordWithGenericMessage() {
        UserEntity user = new UserEntity("Alex", "alex@example.com", passwordEncoder.encode("password123"));
        when(users.findByEmail("alex@example.com")).thenReturn(Optional.of(user));

        BadCredentialsException exception = assertThrows(
                BadCredentialsException.class,
                () -> authService.login(new LoginRequest("alex@example.com", "incorrect-password")));

        assertEquals("Invalid email or password.", exception.getMessage());
    }

    @Test
    void loginRejectsUnknownEmailWithSameGenericMessage() {
        when(users.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        BadCredentialsException exception = assertThrows(
                BadCredentialsException.class,
                () -> authService.login(new LoginRequest("unknown@example.com", "password123")));

        assertEquals("Invalid email or password.", exception.getMessage());
    }

    @Test
    void loginLooksUpEmailWithoutCaseSensitivity() {
        stubJwtEncoder();
        UserEntity user = new UserEntity("Alex", "alex@example.com", passwordEncoder.encode("password123"));
        ReflectionTestUtils.setField(user, "id", 9L);
        when(users.findByEmail("alex@example.com")).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(new LoginRequest(" ALEX@Example.com ", "password123"));

        assertEquals("signed-token", response.token());
        verify(users).findByEmail("alex@example.com");
    }

    private void assertTrueBcryptHash(String value) {
        org.junit.jupiter.api.Assertions.assertTrue(
                value.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$"),
                "Stored password should use a BCrypt hash.");
        assertFalse(value.contains("password123"));
    }

    private void stubJwtEncoder() {
        Jwt encodedJwt = Jwt.withTokenValue("signed-token")
                .header("alg", "HS256")
                .claim("sub", "7")
                .build();
        when(jwtEncoder.encode(any())).thenReturn(encodedJwt);
    }
}
