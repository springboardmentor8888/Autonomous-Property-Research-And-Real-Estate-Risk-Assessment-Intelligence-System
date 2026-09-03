package com.realestate.backend.Security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


	@Component
	public class JwtAuthenticationFilter extends OncePerRequestFilter {
		private final JwtService jwtService;
		public JwtAuthenticationFilter(JwtService jwtService) {
		    this.jwtService = jwtService;
		}
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        if (jwtService.isTokenValid(token)) {

        	String email = jwtService.extractEmail(token);
        	String role = jwtService.extractRole(token);

        	UsernamePasswordAuthenticationToken authentication =
        	        new UsernamePasswordAuthenticationToken(
        	                email,
        	                null,
        	                java.util.List.of(
        	                        new org.springframework.security.core.authority.SimpleGrantedAuthority(
        	                                "ROLE_" + role
        	                        )
        	                )
        	        );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
