package com.duedilligenceagent.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI backendOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Property Due Diligence API")
                        .description("Autonomous Property Research and Real Estate Risk Assessment Intelligence System")
                        .version("0.0.1-SNAPSHOT")
                        .contact(new Contact().name("Due Diligence Agent Team"))
                        .license(new License().name("Proprietary")));
    }
}
