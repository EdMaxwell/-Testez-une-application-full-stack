package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser
    void findById_returnsUser_whenFound() throws Exception {
        User user = userRepository.save(User.builder()
                .email("user@test.com").firstName("John").lastName("Doe")
                .password(passwordEncoder.encode("pass")).admin(false).build());

        mockMvc.perform(get("/api/user/{id}", user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@test.com"))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    @WithMockUser
    void findById_returnsNotFound_whenUserMissing() throws Exception {
        mockMvc.perform(get("/api/user/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void findById_returnsBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(get("/api/user/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void delete_returnsOk_whenUserDeletesThemself() throws Exception {
        User user = userRepository.save(User.builder()
                .email("deleteMe@test.com").firstName("Delete").lastName("Me")
                .password(passwordEncoder.encode("pass")).admin(false).build());

        mockMvc.perform(delete("/api/user/{id}", user.getId())
                        .with(user("deleteMe@test.com").password("pass").roles("USER")))
                .andExpect(status().isOk());
    }

    @Test
    void delete_returnsUnauthorized_whenDeletingAnotherUser() throws Exception {
        User target = userRepository.save(User.builder()
                .email("target@test.com").firstName("Target").lastName("User")
                .password(passwordEncoder.encode("pass")).admin(false).build());

        mockMvc.perform(delete("/api/user/{id}", target.getId())
                        .with(user("other@test.com").password("pass").roles("USER")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void delete_returnsNotFound_whenUserMissing() throws Exception {
        mockMvc.perform(delete("/api/user/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void delete_returnsBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(delete("/api/user/abc"))
                .andExpect(status().isBadRequest());
    }
}
