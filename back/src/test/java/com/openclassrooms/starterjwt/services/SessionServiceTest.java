package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session session;
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").firstName("Jane")
                .lastName("Doe").password("encoded").admin(false).build();

        session = Session.builder()
                .id(1L)
                .name("Yoga Morning")
                .date(new Date())
                .description("Morning yoga session")
                .teacher(Teacher.builder().id(1L).firstName("Alice").lastName("Smith").build())
                .users(new ArrayList<>())
                .build();
    }

    @Test
    void create_savesAndReturnsSession() {
        when(sessionRepository.save(session)).thenReturn(session);

        Session result = sessionService.create(session);

        assertThat(result).isEqualTo(session);
        verify(sessionRepository).save(session);
    }

    @Test
    void delete_callsDeleteById() {
        doNothing().when(sessionRepository).deleteById(1L);

        sessionService.delete(1L);

        verify(sessionRepository).deleteById(1L);
    }

    @Test
    void findAll_returnsAllSessions() {
        Session session2 = Session.builder().id(2L).name("Evening Yoga").date(new Date())
                .description("Evening yoga").users(new ArrayList<>()).build();
        when(sessionRepository.findAll()).thenReturn(Arrays.asList(session, session2));

        List<Session> result = sessionService.findAll();

        assertThat(result).hasSize(2);
        verify(sessionRepository).findAll();
    }

    @Test
    void getById_returnsSession_whenFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        Session result = sessionService.getById(1L);

        assertThat(result).isEqualTo(session);
        verify(sessionRepository).findById(1L);
    }

    @Test
    void getById_returnsNull_whenNotFound() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        Session result = sessionService.getById(99L);

        assertThat(result).isNull();
        verify(sessionRepository).findById(99L);
    }

    @Test
    void update_setsIdAndSaves() {
        Session updated = Session.builder().name("Updated Yoga").date(new Date())
                .description("Updated").users(new ArrayList<>()).build();
        when(sessionRepository.save(updated)).thenReturn(updated);

        Session result = sessionService.update(5L, updated);

        assertThat(result.getId()).isEqualTo(5L);
        verify(sessionRepository).save(updated);
    }

    @Test
    void participate_addsUserToSession_whenNotAlreadyParticipating() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        sessionService.participate(1L, 1L);

        ArgumentCaptor<Session> captor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository).save(captor.capture());
        assertThat(captor.getValue().getUsers()).contains(user);
    }

    @Test
    void participate_throwsNotFoundException_whenSessionNotFound() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> sessionService.participate(99L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_throwsNotFoundException_whenUserNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.participate(1L, 99L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void participate_throwsBadRequestException_whenAlreadyParticipating() {
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> sessionService.participate(1L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_removesUserFromSession() {
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        sessionService.noLongerParticipate(1L, 1L);

        ArgumentCaptor<Session> captor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository).save(captor.capture());
        assertThat(captor.getValue().getUsers()).doesNotContain(user);
    }

    @Test
    void noLongerParticipate_throwsNotFoundException_whenSessionNotFound() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.noLongerParticipate(99L, 1L))
                .isInstanceOf(NotFoundException.class);

        verify(sessionRepository, never()).save(any());
    }

    @Test
    void noLongerParticipate_throwsBadRequestException_whenNotParticipating() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L))
                .isInstanceOf(BadRequestException.class);

        verify(sessionRepository, never()).save(any());
    }
}
