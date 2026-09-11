package com.devhub.backend.model;

import com.devhub.backend.dto.UserDTO;
import com.devhub.backend.dtomapper.UserDTOMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

import static java.util.Arrays.stream;
import static java.util.stream.Collectors.toList;

/**
 * Spring Security {@link UserDetails} adapter for {@link User}.
 * <p>
 * Built by {@code UserRepoImpl#loadUserByUsername} during login so the
 * {@code DaoAuthenticationProvider} can verify the password and read authorities. Authorities are
 * the comma-separated {@code permissions} string split into one {@link SimpleGrantedAuthority} each
 * (whitespace trimmed, so DB formatting need not be perfect).
 */
@RequiredArgsConstructor
public class UserPrincipal implements UserDetails {

    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return stream(user.getPermissions().split(","))
                .map(p -> new SimpleGrantedAuthority(p.trim()))
                .collect(toList());
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.isNotLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }

    /**
     * @return a password-free DTO view of the wrapped user
     */
    public UserDTO toDTO() {
        return UserDTOMapper.fromUser(user);
    }
}
