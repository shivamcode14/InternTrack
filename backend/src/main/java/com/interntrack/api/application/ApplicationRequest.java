package com.interntrack.api.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ApplicationRequest(
        @NotBlank @Size(max = 150) String companyName,
        @NotBlank @Size(max = 180) String jobTitle,
        @Size(max = 2048) String jobUrl,
        @Size(max = 80) String source,
        @NotNull ApplicationStatus status,
        LocalDate applicationDate,
        LocalDate followUpDate,
        LocalDateTime interviewDate,
        @Size(max = 1000) String notes) {
}
