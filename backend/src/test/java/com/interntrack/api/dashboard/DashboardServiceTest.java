package com.interntrack.api.dashboard;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.interntrack.api.application.ApplicationEntity;
import com.interntrack.api.application.ApplicationRepository;
import com.interntrack.api.application.ApplicationRequest;
import com.interntrack.api.application.ApplicationStatus;
import com.interntrack.api.user.UserEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {
    @Mock
    private ApplicationRepository applications;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void statsCountsByStatusAndReturnsFiveMostRecentForCurrentUser() {
        when(applications.countByUser_Id(17L)).thenReturn(2L);
        when(applications.countByUser_IdAndStatus(eq(17L), any(ApplicationStatus.class))).thenReturn(0L);
        when(applications.countByUser_IdAndStatus(17L, ApplicationStatus.APPLIED)).thenReturn(2L);
        when(applications.findAllByUser_IdOrderByIdDesc(eq(17L), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of()));

        DashboardResponse response = dashboardService.stats(17L);

        assertEquals(2L, response.total());
        assertEquals(2L, response.countsByStatus().get(ApplicationStatus.APPLIED));
        assertEquals(0L, response.countsByStatus().get(ApplicationStatus.OFFER));
        assertEquals(6, response.countsByStatus().size());
        assertEquals(List.of(), response.recent());
        verify(applications).findAllByUser_IdOrderByIdDesc(eq(17L), any(PageRequest.class));
    }

    @Test
    void upcomingRemindersAreSortedAndIncludeOnlyTodayOrLater() {
        LocalDate today = LocalDate.now();
        ApplicationEntity interview = application(
                "Interview Co", null, today.plusDays(1).atTime(9, 30));
        ApplicationEntity followUp = application("Follow-up Co", today.plusDays(2), null);
        ApplicationEntity past = application("Past Co", today.minusDays(1), today.minusDays(1).atTime(10, 0));
        when(applications.findApplicationsWithUpcomingReminders(
                eq(17L), eq(today), eq(today.atStartOfDay())))
                .thenReturn(List.of(followUp, past, interview));

        List<ReminderResponse> reminders = dashboardService.upcoming(17L, 8);

        assertEquals(2, reminders.size());
        assertEquals("INTERVIEW", reminders.get(0).type());
        assertEquals("FOLLOW_UP", reminders.get(1).type());
        verify(applications).findApplicationsWithUpcomingReminders(17L, today, today.atStartOfDay());
    }

    @Test
    void upcomingRemindersRespectRequestedLimit() {
        LocalDate today = LocalDate.now();
        ApplicationEntity first = application("First", today.plusDays(1), null);
        ApplicationEntity second = application("Second", today.plusDays(2), null);
        when(applications.findApplicationsWithUpcomingReminders(
                eq(17L), eq(today), eq(today.atStartOfDay())))
                .thenReturn(List.of(second, first));

        List<ReminderResponse> reminders = dashboardService.upcoming(17L, 1);

        assertEquals(1, reminders.size());
        assertEquals("First", reminders.get(0).companyName());
    }

    @Test
    void upcomingRejectsUnsupportedLimit() {
        org.springframework.web.server.ResponseStatusException exception =
                org.junit.jupiter.api.Assertions.assertThrows(
                        org.springframework.web.server.ResponseStatusException.class,
                        () -> dashboardService.upcoming(17L, 101));

        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    private ApplicationEntity application(
            String company, LocalDate followUpDate, LocalDateTime interviewDate) {
        UserEntity user = new UserEntity("Dashboard Test", "dashboard@example.com", "password-hash");
        ApplicationEntity application = new ApplicationEntity(user, new ApplicationRequest(
                company, "Intern", null, null, ApplicationStatus.SAVED,
                null, followUpDate, interviewDate, null));
        ReflectionTestUtils.setField(application, "id", 1L);
        return application;
    }
}
