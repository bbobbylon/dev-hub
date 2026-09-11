package com.devhub.backend.tokenprovider;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.devhub.backend.dto.UserDTO;
import com.devhub.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

import static com.auth0.jwt.algorithms.Algorithm.HMAC512;
import static com.devhub.backend.constants.Constants.ACCESS_TOKEN_EXPIRE_TIME;
import static com.devhub.backend.constants.Constants.AUTHORITIES;
import static com.devhub.backend.constants.Constants.TOKEN_AUDIENCE;
import static com.devhub.backend.constants.Constants.TOKEN_ISSUER;
import static com.devhub.backend.constants.Constants.TOKEN_UNVERIFIABLE;
import static java.lang.System.currentTimeMillis;
import static java.util.Arrays.stream;
import static java.util.stream.Collectors.toList;

/**
 * Issues and verifies HMAC512-signed JWT access tokens.
 * <p>
 * The token's subject is the user id; the {@code authorities} claim carries the permission strings.
 * {@link #getAuthentication} rebuilds a Spring {@link Authentication} (with a {@link UserDTO}
 * principal) from a validated token, which is what {@code CustomAuthFilter} installs into the
 * SecurityContext.
 */
@Component
@RequiredArgsConstructor
public class TokenProvider {

    private final UserService userService;

    @Value("${jwt.secret}")
    private String secret;

    /**
     * @return a signed access token for the given user (subject = id, authorities claim, 30-min TTL)
     */
    public String createAccessToken(UserDTO user) {
        return JWT.create()
                .withIssuer(TOKEN_ISSUER)
                .withAudience(TOKEN_AUDIENCE)
                .withIssuedAt(new Date())
                .withSubject(String.valueOf(user.getId()))
                .withArrayClaim(AUTHORITIES, authoritiesOf(user))
                .withExpiresAt(new Date(currentTimeMillis() + ACCESS_TOKEN_EXPIRE_TIME))
                .sign(HMAC512(secret.getBytes()));
    }

    private String[] authoritiesOf(UserDTO user) {
        return stream(user.getPermissions().split(","))
                .map(String::trim)
                .toArray(String[]::new);
    }

    /**
     * Verifies the token and returns its subject (the user id).
     *
     * @throws JWTVerificationException if the signature/issuer/expiry checks fail
     */
    public Long getSubject(String token, HttpServletRequest request) {
        try {
            return Long.valueOf(verifier().verify(token).getSubject());
        } catch (JWTVerificationException e) {
            // Stash detail server-side for logging; never expose it to the client.
            request.setAttribute("jwtError", e.getMessage());
            throw e;
        }
    }

    /**
     * @return the authorities embedded in the token, or an empty list if the claim is absent
     */
    public List<GrantedAuthority> getAuthorities(String token) {
        Claim claim = verifier().verify(token).getClaim(AUTHORITIES);
        String[] arr = (claim == null || claim.isNull()) ? new String[0] : claim.asArray(String.class);
        if (arr == null) {
            arr = new String[0];
        }
        return stream(arr).map(SimpleGrantedAuthority::new).collect(toList());
    }

    /**
     * @return true when the user id is present and the token is structurally valid and unexpired
     */
    public boolean isTokenValid(Long userId, String token) {
        if (userId == null) {
            return false;
        }
        DecodedJWT decoded = verifier().verify(token);
        return decoded.getExpiresAt().after(new Date());
    }

    /**
     * Builds an authenticated token for the SecurityContext, using the loaded {@link UserDTO} as
     * principal and stamping request details (IP, etc.) onto it.
     */
    public Authentication getAuthentication(Long userId, List<GrantedAuthority> authorities, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userService.getUserById(userId), null, authorities);
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        return authToken;
    }

    private JWTVerifier verifier() {
        try {
            Algorithm algorithm = HMAC512(secret);
            return JWT.require(algorithm).withIssuer(TOKEN_ISSUER).build();
        } catch (JWTVerificationException e) {
            throw new JWTVerificationException(TOKEN_UNVERIFIABLE);
        }
    }
}
