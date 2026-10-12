package com.interntrack.api.config;

import com.fasterxml.jackson.databind.cfg.CoercionAction;
import com.fasterxml.jackson.databind.cfg.CoercionInputShape;
import com.fasterxml.jackson.databind.type.LogicalType;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {
    @Bean
    Jackson2ObjectMapperBuilderCustomizer emptyDateStringsAsNull() {
        return builder -> builder.postConfigurer(objectMapper ->
                objectMapper.coercionConfigFor(LogicalType.DateTime)
                        .setCoercion(CoercionInputShape.EmptyString, CoercionAction.AsNull));
    }
}
