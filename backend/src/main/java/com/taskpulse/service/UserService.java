package com.taskpulse.service;

import com.taskpulse.dto.RegisterUserRequest;
import com.taskpulse.model.Role;
import com.taskpulse.model.User;
import com.taskpulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User registerUser(RegisterUserRequest request) {
        String cleanEmail = request.getEmail().toLowerCase().trim();
        
        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User with email '" + cleanEmail + "' already exists.");
        }

        String avatarUrl = request.getAvatarUrl();
        if (avatarUrl == null || avatarUrl.isBlank()) {
            // Generates clean SVG initial avatar
            avatarUrl = "https://api.dicebear.com/7.x/initials/svg?seed=" 
                    + java.net.URLEncoder.encode(request.getFullName().trim(), java.nio.charset.StandardCharsets.UTF_8);
        }

        String department = request.getDepartment();
        if (department == null || department.isBlank()) {
            department = request.getRole() == Role.MANAGER ? "Management" 
                       : request.getRole() == Role.MENTOR ? "Technical Lead" 
                       : "Engineering";
        }

        User user = new User(
                request.getFullName().trim(),
                cleanEmail,
                request.getRole(),
                department,
                avatarUrl
        );

        return userRepository.save(user);
    }
}
