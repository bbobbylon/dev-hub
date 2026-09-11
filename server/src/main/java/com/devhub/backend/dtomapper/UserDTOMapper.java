package com.devhub.backend.dtomapper;

import com.devhub.backend.dto.UserDTO;
import com.devhub.backend.model.User;
import org.springframework.beans.BeanUtils;

/**
 * Maps a {@link User} to a {@link UserDTO}.
 * <p>
 * {@code BeanUtils.copyProperties} copies only the matching property names; because {@code UserDTO}
 * has no {@code password} property, the hash is dropped automatically.
 */
public final class UserDTOMapper {

    private UserDTOMapper() {
    }

    public static UserDTO fromUser(User user) {
        UserDTO dto = new UserDTO();
        BeanUtils.copyProperties(user, dto);
        return dto;
    }
}
