package com.interntrack.api.application;

import org.springframework.data.jpa.domain.Specification;

public final class ApplicationSpecifications {
    private ApplicationSpecifications() {
    }

    public static Specification<ApplicationEntity> belongsToUser(Long userId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("user").get("id"), userId);
    }

    public static Specification<ApplicationEntity> matchesQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        String pattern = "%" + escapeLike(query.trim().toLowerCase(java.util.Locale.ROOT)) + "%";
        return (root, criteriaQuery, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("companyName")), pattern, '\\'),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("jobTitle")), pattern, '\\'));
    }

    public static Specification<ApplicationEntity> hasStatus(ApplicationStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<ApplicationEntity> hasSource(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("source")),
                        source.trim().toLowerCase(java.util.Locale.ROOT));
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
