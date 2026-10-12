package com.interntrack.api.dashboard;

import com.interntrack.api.application.ApplicationResponse;
import com.interntrack.api.application.ApplicationStatus;
import java.util.List;
import java.util.Map;

public record DashboardResponse(
        long total,
        Map<ApplicationStatus, Long> countsByStatus,
        List<ApplicationResponse> recent) {
}
