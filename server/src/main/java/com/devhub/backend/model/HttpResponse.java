package com.devhub.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * Standard response envelope returned by every endpoint, so clients get a consistent shape.
 * <p>
 * {@code @JsonInclude(NON_DEFAULT)} omits null/empty/zero fields from the JSON, keeping payloads
 * lean. The {@code data} map typically holds the requested entities (e.g. {@code {"user": …}}).
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class HttpResponse {
    /** ISO timestamp of when the response was generated. */
    private String timeStamp;
    /** Numeric HTTP status code (e.g. 200, 401). */
    private int statusCode;
    /** Spring's HttpStatus enum value. */
    private HttpStatus status;
    /** Brief reason phrase for the status. */
    private String reason;
    /** User-facing message. */
    private String message;
    /** Developer-facing technical detail (optional). */
    private String devMessage;
    /** Response payload (entities, lists, tokens). */
    private Map<?, ?> data;
    /** Request path, set on error responses. */
    private String path;
}
