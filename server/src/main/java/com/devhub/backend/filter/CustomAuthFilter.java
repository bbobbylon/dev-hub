package com.devhub.backend.filter;

import com.devhub.backend.model.HttpResponse;
import com.devhub.backend.tokenprovider.TokenProvider;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.OutputStream;
import java.util.List;

import static com.devhub.backend.constants.Constants.HTTP_METHOD_OPTIONS;
import static com.devhub.backend.constants.Constants.PUBLIC_ROUTES;
import static com.devhub.backend.constants.Constants.TOKEN_PREFIX;
import static java.time.LocalDateTime.now;
import static org.springframework.http.HttpHeaders.AUTHORIZATION;

/**
 * Per-request JWT authentication filter, registered before
 * {@code UsernamePasswordAuthenticationFilter}.
 * <p>
 * Skips OPTIONS preflights, public routes, and requests without a Bearer header. Otherwise it
 * validates the token and, when it carries authorities, installs an {@link Authentication} into the
 * SecurityContext. A token without authorities clears the context (so it can't satisfy authority
 * checks). Verification failures are written back as a JSON {@link HttpResponse} 401.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CustomAuthFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getHeader(AUTHORIZATION) == null
                || !request.getHeader(AUTHORIZATION).startsWith(TOKEN_PREFIX)
                || request.getMethod().equalsIgnoreCase(HTTP_METHOD_OPTIONS)
                || isPublicRoute(request.getRequestURI());
    }

    private static boolean isPublicRoute(String uri) {
        for (String route : PUBLIC_ROUTES) {
            if (uri.startsWith(route)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) {
        try {
            String token = getToken(request);
            Long userId = tokenProvider.getSubject(token, request);
            if (tokenProvider.isTokenValid(userId, token)) {
                List<GrantedAuthority> authorities = tokenProvider.getAuthorities(token);
                if (authorities.isEmpty()) {
                    SecurityContextHolder.clearContext();
                } else {
                    Authentication authentication = tokenProvider.getAuthentication(userId, authorities, request);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } else {
                SecurityContextHolder.clearContext();
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("JWT authentication failed: {}", e.getMessage());
            writeUnauthorized(response);
        }
    }

    private String getToken(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION);
        return header == null ? "" : header.replace(TOKEN_PREFIX, "");
    }

    private void writeUnauthorized(HttpServletResponse response) {
        try {
            HttpResponse body = HttpResponse.builder()
                    .timeStamp(now().toString())
                    .statusCode(HttpStatus.UNAUTHORIZED.value())
                    .status(HttpStatus.UNAUTHORIZED)
                    .reason("Authentication failed")
                    .message("You are not logged in. Please log in and try again.")
                    .build();
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            OutputStream out = response.getOutputStream();
            objectMapper.writeValue(out, body);
            out.flush();
        } catch (Exception ex) {
            log.error("Failed to write auth error response: {}", ex.getMessage());
        }
    }
}
