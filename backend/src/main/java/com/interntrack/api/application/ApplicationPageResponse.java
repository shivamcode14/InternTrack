package com.interntrack.api.application;

import java.util.List;
import org.springframework.data.domain.Page;

public record ApplicationPageResponse(
        List<ApplicationResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last) {
    public static ApplicationPageResponse from(Page<ApplicationResponse> page) {
        return new ApplicationPageResponse(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
