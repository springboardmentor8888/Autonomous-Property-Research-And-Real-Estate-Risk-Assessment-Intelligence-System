package com.duedilligenceagent.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration. The backend is currently being developed
 * against a separate frontend SPA — these are the dev-server origins
 * we expect to see during local development. Tighten the list when
 * the production frontend domain is known.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // Any localhost/127.0.0.1 port: dev servers pick 3000, 3001,
                // 3002... depending on what's already in use. Tighten to the
                // production domain when shipped.
                .allowedOriginPatterns(
                        "http://localhost:[*]",
                        "http://127.0.0.1:[*]"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
