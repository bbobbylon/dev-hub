package com.devhub.backend.constants;

/**
 * Application-wide constants for the security layer and JWT handling.
 * <p>
 * {@link #PUBLIC_URLS} feeds the SecurityFilterChain ({@code permitAll}) while
 * {@link #PUBLIC_ROUTES} feeds {@code CustomAuthFilter}'s skip list. The two must stay in
 * lockstep: a route public in the chain but absent from the filter list would make the filter
 * try to parse a (possibly stale) Bearer header and fail before reaching the public controller.
 */
public final class Constants {

    private Constants() {
    }

    /** URL patterns the SecurityFilterChain permits without authentication. */
    public static final String[] PUBLIC_URLS = {
            "/api/auth/login/**",
            "/api/auth/register/**",
            "/actuator/**"
    };

    /** URI prefixes the JWT filter skips (matched with {@code startsWith}). */
    public static final String[] PUBLIC_ROUTES = {
            "/api/auth/login",
            "/api/auth/register",
            "/actuator"
    };

    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HTTP_METHOD_OPTIONS = "OPTIONS";

    /** JWT claim name carrying the user's authority strings. */
    public static final String AUTHORITIES = "authorities";

    /** JWT issuer/audience — rename to your application/organisation. */
    public static final String TOKEN_ISSUER = "EXAMPLE_BACKEND";
    public static final String TOKEN_AUDIENCE = "EXAMPLE_CLIENT";

    /** Access-token lifetime: 30 minutes, in milliseconds. */
    public static final long ACCESS_TOKEN_EXPIRE_TIME = 1_800_000;

    public static final String TOKEN_UNVERIFIABLE = "Invalid JWT secret key";
}
