package com.interntrack.api.application;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApplicationRepository
        extends JpaRepository<ApplicationEntity, Long>, JpaSpecificationExecutor<ApplicationEntity> {
    Page<ApplicationEntity> findAllByUser_IdOrderByIdDesc(Long userId, Pageable pageable);

    Optional<ApplicationEntity> findByIdAndUser_Id(Long id, Long userId);

    long countByUser_Id(Long userId);

    long countByUser_IdAndStatus(Long userId, ApplicationStatus status);

    @Query("""
            select application
            from ApplicationEntity application
            where application.user.id = :userId
              and (application.followUpDate >= :today or application.interviewDate >= :todayStart)
            """)
    List<ApplicationEntity> findApplicationsWithUpcomingReminders(
            @Param("userId") Long userId,
            @Param("today") java.time.LocalDate today,
            @Param("todayStart") java.time.LocalDateTime todayStart);
}
