package com.interntrack.api.application;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.interntrack.api.user.UserEntity;
import com.interntrack.api.user.UserRepository;
import java.util.List;
import java.util.Optional;
import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {
    @Mock
    private ApplicationRepository applications;

    @Mock
    private UserRepository users;

    @InjectMocks
    private ApplicationService applicationService;

    @Test
    void listOnlyQueriesForTheAuthenticatedUsersRecords() {
        when(applications.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 50), 0));

        ApplicationPageResponse response = applicationService.list(42L, null, null, null, 0, 50);

        assertEquals(List.of(), response.content());
        ArgumentCaptor<Specification<ApplicationEntity>> specification =
                ArgumentCaptor.forClass(Specification.class);
        verify(applications).findAll(specification.capture(), eq(PageRequest.of(
                0, 50, Sort.by(Sort.Direction.DESC, "id"))));
        org.junit.jupiter.api.Assertions.assertNotNull(specification.getValue());
    }

    @Test
    void listPassesSearchAndFiltersToRepositorySpecification() {
        when(applications.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 50), 0));

        applicationService.list(42L, "zoho", ApplicationStatus.INTERVIEW, "LinkedIn", 0, 50);

        ArgumentCaptor<Specification<ApplicationEntity>> specification =
                ArgumentCaptor.forClass(Specification.class);
        verify(applications).findAll(specification.capture(), any(Pageable.class));
        org.junit.jupiter.api.Assertions.assertNotNull(specification.getValue());
    }

    @Test
    void updateCannotFindARecordOwnedByAnotherUser() {
        when(applications.findByIdAndUser_Id(8L, 42L)).thenReturn(Optional.empty());
        ApplicationRequest request = new ApplicationRequest(
                "Company", "Intern", null, null, ApplicationStatus.SAVED,
                null, null, null, null);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> applicationService.update(42L, 8L, request));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(applications).findByIdAndUser_Id(8L, 42L);
    }

    @Test
    void getCannotReadARecordOwnedByAnotherUser() {
        when(applications.findByIdAndUser_Id(8L, 42L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> applicationService.get(42L, 8L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(applications).findByIdAndUser_Id(8L, 42L);
    }

    @Test
    void deleteCannotRemoveARecordOwnedByAnotherUser() {
        when(applications.findByIdAndUser_Id(8L, 42L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> applicationService.delete(42L, 8L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(applications).findByIdAndUser_Id(8L, 42L);
    }

    @Test
    void createAssociatesApplicationWithAuthenticatedUserId() {
        UserEntity user = new UserEntity("Owner", "owner@example.com", "password-hash");
        when(users.getReferenceById(42L)).thenReturn(user);
        ApplicationRequest request = new ApplicationRequest(
                "Company", "Intern", null, null, ApplicationStatus.SAVED,
                null, null, null, null);
        when(applications.save(org.mockito.ArgumentMatchers.any(ApplicationEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        applicationService.create(42L, request);

        verify(users).getReferenceById(42L);
        verify(applications).save(org.mockito.ArgumentMatchers.any(ApplicationEntity.class));
    }

    @Test
    void nonSavedApplicationRequiresAnApplicationDate() {
        ApplicationRequest request = new ApplicationRequest(
                "Company", "Intern", null, null, ApplicationStatus.APPLIED,
                null, null, null, null);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> applicationService.create(42L, request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void listRejectsOutOfRangePagination() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> applicationService.list(42L, null, null, null, 0, 101));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }
}
