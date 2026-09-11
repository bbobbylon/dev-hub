package com.devhub.backend.controller;

import com.devhub.backend.dto.UserDTO;
import com.devhub.backend.form.LoginForm;
import com.devhub.backend.form.RegisterForm;
import com.devhub.backend.model.HttpResponse;
import com.devhub.backend.service.UserService;
import com.devhub.backend.tokenprovider.TokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static java.time.LocalDateTime.now;
import static java.util.Map.of;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

/**
 * Authentication endpoints under {@code /api/auth}: register, login (issues a JWT), and a
 * token-protected profile lookup. Every method returns the standard {@link HttpResponse} envelope.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<HttpResponse> register(@RequestBody @Valid RegisterForm form) {
        UserDTO user = userService.register(form);
        return ResponseEntity.status(CREATED).body(HttpResponse.builder()
                .timeStamp(now().toString())
                .data(of("user", user))
                .message("User created successfully.")
                .status(CREATED)
                .statusCode(CREATED.value())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<HttpResponse> login(@RequestBody @Valid LoginForm form) {
        // Throws BadCredentialsException on failure (handled globally as a generic 401).
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(form.getEmail(), form.getPassword()));
        UserDTO user = userService.getUserByEmail(form.getEmail());
        String token = tokenProvider.createAccessToken(user);
        return ResponseEntity.ok(HttpResponse.builder()
                .timeStamp(now().toString())
                .data(of("user", user, "token", token))
                .message("Login successful.")
                .status(OK)
                .statusCode(OK.value())
                .build());
    }

    @GetMapping("/profile")
    public ResponseEntity<HttpResponse> profile(@AuthenticationPrincipal UserDTO user) {
        return ResponseEntity.ok(HttpResponse.builder()
                .timeStamp(now().toString())
                .data(of("user", user))
                .message("Profile retrieved.")
                .status(OK)
                .statusCode(OK.value())
                .build());
    }
}
