package com.devhub.backend.form;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Login request body. Validated by {@code @Valid} in the controller; failures are mapped to a
 * clean 400 by {@code GlobalExceptionHandler}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginForm {
    @NotEmpty(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;

    @NotEmpty(message = "Password cannot be empty")
    private String password;
}
