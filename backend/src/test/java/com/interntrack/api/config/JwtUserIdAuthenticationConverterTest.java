package com.interntrack.api.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;

class JwtUserIdAuthenticationConverterTest {
    private final JwtUserIdAuthenticationConverter converter = new JwtUserIdAuthenticationConverter();

    @Test
    void convertsVerifiedTokenSubjectToNumericPrincipal() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "HS256")
                .claim("sub", "42")
                .build();

        AbstractAuthenticationToken authentication = converter.convert(jwt);

        assertEquals(42L, authentication.getPrincipal());
    }

    @Test
    void rejectsNonNumericTokenSubject() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "HS256")
                .claim("sub", "alex@example.com")
                .build();

        assertThrows(JwtException.class, () -> converter.convert(jwt));
    }
}
