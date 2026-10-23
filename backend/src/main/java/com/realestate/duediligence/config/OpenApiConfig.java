package com.realestate.duediligence.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures the generated API documentation: project info, plus a
 * JWT bearer scheme so the Swagger UI "Authorize" button can attach a
 * token to protected endpoints.
 */
@Configuration
public class OpenApiConfig {

	private static final String SECURITY_SCHEME_NAME = "bearerAuth";

	@Bean
	public OpenAPI realEstateOpenApi() {
		return new OpenAPI()
				.info(new Info()
						.title("Real Estate Due Diligence Agent API")
						.version("1.0")
						.description("Backend API for property search, due-diligence aggregation, "
								+ "risk assessment, report generation, notifications and auditing."))
				.addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
				.components(new Components().addSecuritySchemes(SECURITY_SCHEME_NAME,
						new SecurityScheme()
								.name(SECURITY_SCHEME_NAME)
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")));
	}
}