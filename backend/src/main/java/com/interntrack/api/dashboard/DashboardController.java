package com.interntrack.api.dashboard;

import java.util.List;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/stats")
    public DashboardResponse stats(@AuthenticationPrincipal Long userId) {
        return dashboardService.stats(userId);
    }

    @GetMapping("/reminders/upcoming")
    public List<ReminderResponse> upcoming(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "8") int limit) {
        return dashboardService.upcoming(userId, limit);
    }
}
