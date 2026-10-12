package com.interntrack.api.dashboard;

import java.time.LocalDateTime;

public record ReminderResponse(
        String type,
        LocalDateTime date,
        Long applicationId,
        String companyName,
        String jobTitle) {
}
