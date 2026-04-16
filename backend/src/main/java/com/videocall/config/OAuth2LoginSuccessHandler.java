package com.videocall.config;

import com.videocall.entity.User;
import com.videocall.repository.UserRepository;
import com.videocall.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauthUser = oauthToken.getPrincipal();
        String provider = oauthToken.getAuthorizedClientRegistrationId();
        String providerId = extractProviderId(oauthUser);
        String email = extractEmail(oauthUser);
        String name = extractName(oauthUser, provider, providerId);

        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> createUser(provider, providerId, email, name));

        String token = jwtUtil.generateToken(user.getUsername());
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
        response.sendRedirect(frontendBaseUrl + "/auth?token=" + encodedToken);
    }

    private User createUser(String provider, String providerId, String email, String name) {
        User user = new User();
        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setEmail(email);
        user.setName(name);
        user.setUsername(createUsername(provider, providerId, email));
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setSubscriptionPlan(User.SubscriptionPlan.FREE);
        return userRepository.save(user);
    }

    private String createUsername(String provider, String providerId, String email) {
        if (email != null && !email.isBlank()) {
            String sanitized = email.split("@")[0].replaceAll("[^a-zA-Z0-9_-]", "_");
            String candidate = sanitized + "_" + provider;
            if (!userRepository.existsByUsername(candidate)) {
                return candidate;
            }
        }
        return provider + "_" + providerId;
    }

    private String extractProviderId(OAuth2User oauthUser) {
        Object sub = oauthUser.getAttribute("sub");
        if (sub != null) {
            return sub.toString();
        }
        Object id = oauthUser.getAttribute("id");
        return id != null ? id.toString() : UUID.randomUUID().toString();
    }

    private String extractEmail(OAuth2User oauthUser) {
        Object email = oauthUser.getAttribute("email");
        return email != null ? email.toString() : null;
    }

    private String extractName(OAuth2User oauthUser, String provider, String providerId) {
        Object name = oauthUser.getAttribute("name");
        if (name != null) {
            return name.toString();
        }
        Object login = oauthUser.getAttribute("login");
        if (login != null) {
            return login.toString();
        }
        return provider + " user " + providerId;
    }
}
