package com.devhub.backend.service;

import com.devhub.backend.dto.UserDTO;
import com.devhub.backend.form.RegisterForm;

/**
 * Business operations for users. Returns {@link UserDTO} (never the password-bearing entity).
 */
public interface UserService {

    UserDTO register(RegisterForm form);

    UserDTO getUserByEmail(String email);

    UserDTO getUserById(Long id);
}
