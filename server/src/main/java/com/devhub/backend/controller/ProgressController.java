package com.devhub.backend.controller;

import com.devhub.backend.dto.UserDTO;
import com.devhub.backend.model.HttpResponse;
import com.devhub.backend.service.ProgressService;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static java.time.LocalDateTime.now;
import static java.util.Map.of;
import static org.springframework.http.HttpStatus.OK;

/**
 * Cross-device sync for the frontend's localStorage progress blob, under {@code /api/progress}.
 * Both routes fall under {@code SecurityConfig}'s catch-all {@code anyRequest().authenticated()} —
 * no extra authority is needed since every call is scoped to the caller's own id via
 * {@link AuthenticationPrincipal}, never a client-supplied one.
 */
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;
    private final ObjectMapper objectMapper;

    @GetMapping("")
    public ResponseEntity<HttpResponse> get(@AuthenticationPrincipal UserDTO user) {
        JsonNode progress = objectMapper.readTree(progressService.getProgress(user.getId()));
        return ResponseEntity.ok(HttpResponse.builder()
                .timeStamp(now().toString())
                .data(of("progress", progress))
                .message("Progress retrieved.")
                .status(OK)
                .statusCode(OK.value())
                .build());
    }

    @PutMapping("")
    public ResponseEntity<HttpResponse> save(@AuthenticationPrincipal UserDTO user, @RequestBody JsonNode body) {
        progressService.saveProgress(user.getId(), body.toString());
        return ResponseEntity.ok(HttpResponse.builder()
                .timeStamp(now().toString())
                .message("Progress saved.")
                .status(OK)
                .statusCode(OK.value())
                .build());
    }
}
