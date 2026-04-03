package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SessionControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Teacher teacher;
    private User participant;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        teacher = teacherRepository.save(
                Teacher.builder().firstName("Alice").lastName("Smith").build());

        participant = userRepository.save(
                User.builder().email("participant@test.com").firstName("Part")
                        .lastName("User").password(passwordEncoder.encode("pass"))
                        .admin(false).build());
    }

    @Test
    @WithMockUser
    void findAll_returnsSessionList() throws Exception {
        sessionRepository.save(Session.builder().name("Yoga Morning").date(new Date())
                .description("Morning").teacher(teacher).users(new ArrayList<>()).build());

        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser
    void findById_returnsSession_whenFound() throws Exception {
        Session session = sessionRepository.save(
                Session.builder().name("Yoga Morning").date(new Date())
                        .description("Morning").teacher(teacher).users(new ArrayList<>()).build());

        mockMvc.perform(get("/api/session/{id}", session.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga Morning"));
    }

    @Test
    @WithMockUser
    void findById_returnsNotFound_whenMissing() throws Exception {
        mockMvc.perform(get("/api/session/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void findById_returnsBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(get("/api/session/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void create_returnsCreatedSession() throws Exception {
        SessionDto dto = new SessionDto();
        dto.setName("Evening Yoga");
        dto.setDate(new Date());
        dto.setDescription("Evening yoga session");
        dto.setTeacher_id(teacher.getId());
        dto.setUsers(new ArrayList<>());

        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Evening Yoga"));
    }

    @Test
    @WithMockUser
    void update_returnsUpdatedSession() throws Exception {
        Session session = sessionRepository.save(
                Session.builder().name("Old Name").date(new Date())
                        .description("Old description").teacher(teacher).users(new ArrayList<>()).build());

        SessionDto dto = new SessionDto();
        dto.setName("New Name");
        dto.setDate(new Date());
        dto.setDescription("New description");
        dto.setTeacher_id(teacher.getId());
        dto.setUsers(new ArrayList<>());

        mockMvc.perform(put("/api/session/{id}", session.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"));
    }

    @Test
    @WithMockUser
    void update_returnsBadRequest_whenIdIsNotNumeric() throws Exception {
        SessionDto dto = new SessionDto();
        dto.setName("Name");
        dto.setDate(new Date());
        dto.setDescription("Desc");
        dto.setTeacher_id(teacher.getId());
        dto.setUsers(new ArrayList<>());

        mockMvc.perform(put("/api/session/abc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void delete_returnsOk_whenSessionExists() throws Exception {
        Session session = sessionRepository.save(
                Session.builder().name("Delete Me").date(new Date())
                        .description("To delete").teacher(teacher).users(new ArrayList<>()).build());

        mockMvc.perform(delete("/api/session/{id}", session.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void delete_returnsNotFound_whenSessionMissing() throws Exception {
        mockMvc.perform(delete("/api/session/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void delete_returnsBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(delete("/api/session/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void participate_returnsOk_whenValid() throws Exception {
        Session session = sessionRepository.save(
                Session.builder().name("Yoga").date(new Date())
                        .description("Yoga session").teacher(teacher).users(new ArrayList<>()).build());

        mockMvc.perform(post("/api/session/{id}/participate/{userId}",
                        session.getId(), participant.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void participate_returnsBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(post("/api/session/abc/participate/1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void noLongerParticipate_returnsOk_whenParticipating() throws Exception {
        Session session = sessionRepository.save(
                Session.builder().name("Yoga").date(new Date())
                        .description("Yoga session").teacher(teacher)
                        .users(new ArrayList<>()).build());
        session.getUsers().add(participant);
        session = sessionRepository.save(session);

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}",
                        session.getId(), participant.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void noLongerParticipate_returnsBadRequest_whenIdIsNotNumeric() throws Exception {
        mockMvc.perform(delete("/api/session/abc/participate/1"))
                .andExpect(status().isBadRequest());
    }
}
