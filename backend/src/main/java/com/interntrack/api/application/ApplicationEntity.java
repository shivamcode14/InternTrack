package com.interntrack.api.application;

import com.interntrack.api.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class ApplicationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false, length = 150)
    private String companyName;

    @Column(nullable = false, length = 180)
    private String jobTitle;

    @Column(length = 2048)
    private String jobUrl;

    @Column(length = 80)
    private String source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    private LocalDate applicationDate;
    private LocalDate followUpDate;
    private LocalDateTime interviewDate;

    @Column(length = 1000)
    private String notes;

    protected ApplicationEntity() {
    }

    public ApplicationEntity(UserEntity user, ApplicationRequest request) {
        this.user = user;
        update(request);
    }

    public void update(ApplicationRequest request) {
        this.companyName = request.companyName().trim();
        this.jobTitle = request.jobTitle().trim();
        this.jobUrl = blankToNull(request.jobUrl());
        this.source = blankToNull(request.source());
        this.status = request.status();
        this.applicationDate = request.applicationDate();
        this.followUpDate = request.followUpDate();
        this.interviewDate = request.interviewDate();
        this.notes = blankToNull(request.notes());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public Long getId() { return id; }
    public String getCompanyName() { return companyName; }
    public String getJobTitle() { return jobTitle; }
    public String getJobUrl() { return jobUrl; }
    public String getSource() { return source; }
    public ApplicationStatus getStatus() { return status; }
    public LocalDate getApplicationDate() { return applicationDate; }
    public LocalDate getFollowUpDate() { return followUpDate; }
    public LocalDateTime getInterviewDate() { return interviewDate; }
    public String getNotes() { return notes; }
}
