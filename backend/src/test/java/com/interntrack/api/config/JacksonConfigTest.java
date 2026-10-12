package com.interntrack.api.config;

import static org.junit.jupiter.api.Assertions.assertNull;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

class JacksonConfigTest {
    @Test
    void emptyDateStringsDeserializeAsNull() throws Exception {
        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder();
        Jackson2ObjectMapperBuilderCustomizer customizer = new JacksonConfig().emptyDateStringsAsNull();
        customizer.customize(builder);
        ObjectMapper objectMapper = builder.findModulesViaServiceLoader(true).build();

        DateRequest request = objectMapper.readValue(
                "{\"date\":\"\",\"dateTime\":\"\"}", DateRequest.class);

        assertNull(request.date());
        assertNull(request.dateTime());
    }

    private record DateRequest(LocalDate date, LocalDateTime dateTime) {
    }
}
