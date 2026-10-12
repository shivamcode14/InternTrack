package com.interntrack.api.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.cors.CorsConfiguration;

class SecurityConfigTest {
    @Test
    void unauthenticatedRequestsReceiveJson401WithBearerChallenge() throws ServletException, IOException {
        SecurityConfig config = new SecurityConfig();
        MockHttpServletResponse response = new MockHttpServletResponse();

        config.apiAuthenticationEntryPoint(new ObjectMapper().findAndRegisterModules())
                .commence(new MockHttpServletRequest(), response, new BadCredentialsException("Missing token."));

        assertEquals(401, response.getStatus());
        assertEquals("Bearer", response.getHeader("WWW-Authenticate"));
        assertTrue(response.getContentType().contains("application/json"));
        assertTrue(response.getContentAsString().contains("Authentication required."));
    }

    @Test
    void corsAllowsTheViteDevelopmentOrigin() {
        CorsConfiguration cors = new SecurityConfig()
                .corsConfigurationSource("http://localhost:5173")
                .getCorsConfiguration(new MockHttpServletRequest("GET", "/api/applications"));

        assertTrue(cors.getAllowedOrigins().contains("http://localhost:5173"));
        assertTrue(cors.getAllowedMethods().contains("GET"));
        assertTrue(cors.getAllowedHeaders().contains("Authorization"));
    }
}
