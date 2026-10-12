package com.interntrack.api.application;

import com.interntrack.api.user.UserEntity;
import com.interntrack.api.user.UserRepository;
import java.net.URI;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ApplicationService {
    private final ApplicationRepository applications;
    private final UserRepository users;

    public ApplicationService(ApplicationRepository applications, UserRepository users) {
        this.applications = applications;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public ApplicationPageResponse list(
            Long userId, String query, ApplicationStatus status, String source, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Page must be non-negative and size must be between 1 and 100.");
        }
        Specification<ApplicationEntity> specification = Specification
                .where(ApplicationSpecifications.belongsToUser(userId))
                .and(ApplicationSpecifications.matchesQuery(query))
                .and(ApplicationSpecifications.hasStatus(status))
                .and(ApplicationSpecifications.hasSource(source));
        Page<ApplicationResponse> results = applications.findAll(
                        specification, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))
                .map(ApplicationResponse::from);
        return ApplicationPageResponse.from(results);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse get(Long userId, Long id) {
        return ApplicationResponse.from(findOwnedApplication(userId, id));
    }

    @Transactional
    public ApplicationResponse create(Long userId, ApplicationRequest request) {
        validateRequest(request);
        UserEntity user = users.getReferenceById(userId);
        return ApplicationResponse.from(applications.save(new ApplicationEntity(user, request)));
    }

    @Transactional
    public ApplicationResponse update(Long userId, Long id, ApplicationRequest request) {
        validateRequest(request);
        ApplicationEntity application = findOwnedApplication(userId, id);
        application.update(request);
        return ApplicationResponse.from(application);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        applications.delete(findOwnedApplication(userId, id));
    }

    private ApplicationEntity findOwnedApplication(Long userId, Long id) {
        return applications.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
    }

    private void validateRequest(ApplicationRequest request) {
        if (request.status() != ApplicationStatus.SAVED && request.applicationDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Application date is required unless the status is Saved.");
        }
        if (request.jobUrl() != null && !request.jobUrl().isBlank()) {
            try {
                URI uri = URI.create(request.jobUrl().trim());
                String scheme = uri.getScheme();
                if (!uri.isAbsolute() || uri.getHost() == null
                        || !("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))) {
                    throw new IllegalArgumentException("URL must be absolute HTTP or HTTPS.");
                }
            } catch (IllegalArgumentException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid http:// or https:// job link.");
            }
        }
    }
}
