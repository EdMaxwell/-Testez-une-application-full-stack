package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "openclassrooms-test-secret");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 86400000);
    }

    @Test
    void generateJwtToken_returnsToken() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L).username("user@test.com").firstName("John").lastName("Doe")
                .password("encoded").admin(false).build();
        when(authentication.getPrincipal()).thenReturn(userDetails);

        String token = jwtUtils.generateJwtToken(authentication);

        assertThat(token).isNotBlank();
    }

    @Test
    void getUserNameFromJwtToken_returnsUsername() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L).username("user@test.com").firstName("John").lastName("Doe")
                .password("encoded").admin(false).build();
        when(authentication.getPrincipal()).thenReturn(userDetails);

        String token = jwtUtils.generateJwtToken(authentication);
        String username = jwtUtils.getUserNameFromJwtToken(token);

        assertThat(username).isEqualTo("user@test.com");
    }

    @Test
    void validateJwtToken_returnsTrue_forValidToken() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L).username("user@test.com").firstName("John").lastName("Doe")
                .password("encoded").admin(false).build();
        when(authentication.getPrincipal()).thenReturn(userDetails);

        String token = jwtUtils.generateJwtToken(authentication);

        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
    }

    @Test
    void validateJwtToken_returnsFalse_forInvalidSignature() {
        String badToken = Jwts.builder()
                .setSubject("user@test.com")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(SignatureAlgorithm.HS512, "wrongsecret")
                .compact();

        assertThat(jwtUtils.validateJwtToken(badToken)).isFalse();
    }

    @Test
    void validateJwtToken_returnsFalse_forMalformedToken() {
        assertThat(jwtUtils.validateJwtToken("not.a.valid.jwt")).isFalse();
    }

    @Test
    void validateJwtToken_returnsFalse_forExpiredToken() {
        String expiredToken = Jwts.builder()
                .setSubject("user@test.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 200000))
                .setExpiration(new Date(System.currentTimeMillis() - 100000))
                .signWith(SignatureAlgorithm.HS512, "openclassrooms-test-secret")
                .compact();

        assertThat(jwtUtils.validateJwtToken(expiredToken)).isFalse();
    }

    @Test
    void validateJwtToken_returnsFalse_forEmptyToken() {
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
    }
}
