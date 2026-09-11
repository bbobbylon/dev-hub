package com.devhub.backend.service.serviceimpl;

import com.devhub.backend.dto.UserDTO;
import com.devhub.backend.dtomapper.UserDTOMapper;
import com.devhub.backend.form.RegisterForm;
import com.devhub.backend.model.User;
import com.devhub.backend.repo.UserRepo;
import com.devhub.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Default {@link UserService}. Owns the business rules — password hashing and default
 * role/permission assignment — keeping the repository focused on SQL.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private static final String DEFAULT_ROLE = "ROLE_USER";
    private static final String DEFAULT_PERMISSIONS = "READ:USER,UPDATE:USER";

    private final UserRepo userRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public UserDTO register(RegisterForm form) {
        User user = User.builder()
                .firstName(form.getFirstName())
                .lastName(form.getLastName())
                .email(form.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(form.getPassword()))
                .role(DEFAULT_ROLE)
                .permissions(DEFAULT_PERMISSIONS)
                .enabled(true)
                .notLocked(true)
                .build();
        return UserDTOMapper.fromUser(userRepo.create(user));
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        return UserDTOMapper.fromUser(userRepo.getUserByEmail(email.trim().toLowerCase()));
    }

    @Override
    public UserDTO getUserById(Long id) {
        return UserDTOMapper.fromUser(userRepo.getUserById(id));
    }
}
