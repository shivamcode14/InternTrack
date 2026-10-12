package com.interntrack.api.application;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ApplicationResponse(
        Long id,
        String companyName,
        String jobTitle,
        String jobUrl,
        String source,
        ApplicationStatus status,
        LocalDate applicationDate,
        LocalDate followUpDate,
        LocalDateTime interviewDate,
        String notes) {
    public static ApplicationResponse from(ApplicationEntity application) {
        return new ApplicationResponse(
                application.getId(),
                application.getCompanyName(),
                application.getJobTitle(),
                application.getJobUrl(),
                application.getSource(),
                application.getStatus(),
                application.getApplicationDate(),
                application.getFollowUpDate(),
                application.getInterviewDate(),
                application.getNotes());
    }
}
