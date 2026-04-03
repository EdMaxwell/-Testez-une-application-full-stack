package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.Test;

import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

class UserDetailsImplTest {

    private UserDetailsImpl buildUser(Long id) {
        return UserDetailsImpl.builder()
                .id(id)
                .username("user@test.com")
                .firstName("John")
                .lastName("Doe")
                .password("encoded")
                .admin(false)
                .build();
    }

    @Test
    void getAuthorities_returnsEmptyCollection() {
        UserDetailsImpl user = buildUser(1L);
        Collection<?> authorities = user.getAuthorities();
        assertThat(authorities).isEmpty();
    }

    @Test
    void isAccountNonExpired_returnsTrue() {
        assertThat(buildUser(1L).isAccountNonExpired()).isTrue();
    }

    @Test
    void isAccountNonLocked_returnsTrue() {
        assertThat(buildUser(1L).isAccountNonLocked()).isTrue();
    }

    @Test
    void isCredentialsNonExpired_returnsTrue() {
        assertThat(buildUser(1L).isCredentialsNonExpired()).isTrue();
    }

    @Test
    void isEnabled_returnsTrue() {
        assertThat(buildUser(1L).isEnabled()).isTrue();
    }

    @Test
    void equals_returnsTrueForSameId() {
        UserDetailsImpl u1 = buildUser(1L);
        UserDetailsImpl u2 = buildUser(1L);
        assertThat(u1).isEqualTo(u2);
    }

    @Test
    void equals_returnsFalseForDifferentId() {
        UserDetailsImpl u1 = buildUser(1L);
        UserDetailsImpl u2 = buildUser(2L);
        assertThat(u1).isNotEqualTo(u2);
    }

    @Test
    void equals_returnsTrueForSameReference() {
        UserDetailsImpl u1 = buildUser(1L);
        assertThat(u1).isEqualTo(u1);
    }

    @Test
    void equals_returnsFalseForNull() {
        UserDetailsImpl u1 = buildUser(1L);
        assertThat(u1).isNotEqualTo(null);
    }

    @Test
    void equals_returnsFalseForDifferentClass() {
        UserDetailsImpl u1 = buildUser(1L);
        assertThat(u1).isNotEqualTo("some string");
    }

    @Test
    void getPassword_returnsPassword() {
        UserDetailsImpl user = buildUser(1L);
        assertThat(user.getPassword()).isEqualTo("encoded");
    }

    @Test
    void getUsername_returnsEmail() {
        UserDetailsImpl user = buildUser(1L);
        assertThat(user.getUsername()).isEqualTo("user@test.com");
    }
}
