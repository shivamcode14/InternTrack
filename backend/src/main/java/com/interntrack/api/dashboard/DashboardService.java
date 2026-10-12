package com.interntrack.api.dashboard;

import com.interntrack.api.application.ApplicationEntity;
import com.interntrack.api.application.ApplicationRepository;
import com.interntrack.api.application.ApplicationResponse;
import com.interntrack.api.application.ApplicationStatus;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
    private final ApplicationRepository applications;

    public DashboardService(ApplicationRepository applications) {
        this.applications = applications;
    }

    @Transactional(readOnly = true)
    public DashboardResponse stats(Long userId) {
        Map<ApplicationStatus, Long> statusCounts = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusCounts.put(status, applications.countByUser_IdAndStatus(userId, status));
        }
        List<ApplicationResponse> recent = applications.findAllByUser_IdOrderByIdDesc(
                        userId, PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id")))
                .map(ApplicationResponse::from)
                .getContent();
        return new DashboardResponse(applications.countByUser_Id(userId), statusCounts, recent);
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> upcoming(Long userId, int limit) {
        if (limit < 1 || limit > 100) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Reminder limit must be between 1 and 100.");
        }
        LocalDate today = LocalDate.now();
        List<ReminderResponse> reminders = new ArrayList<>();
        for (ApplicationEntity application : applications.findApplicationsWithUpcomingReminders(
                userId, today, today.atStartOfDay())) {
            if (application.getFollowUpDate() != null && !application.getFollowUpDate().isBefore(today)) {
                reminders.add(new ReminderResponse(
                        "FOLLOW_UP",
                        application.getFollowUpDate().atStartOfDay(),
                        application.getId(),
                        application.getCompanyName(),
                        application.getJobTitle()));
            }
            if (application.getInterviewDate() != null
                    && !application.getInterviewDate().toLocalDate().isBefore(today)) {
                reminders.add(new ReminderResponse(
                        "INTERVIEW",
                        application.getInterviewDate(),
                        application.getId(),
                        application.getCompanyName(),
                        application.getJobTitle()));
            }
        }
        reminders.sort(java.util.Comparator.comparing(ReminderResponse::date)
                .thenComparing(ReminderResponse::applicationId)
                .thenComparing(ReminderResponse::type));
        return reminders.stream().limit(limit).toList();
    }
}
