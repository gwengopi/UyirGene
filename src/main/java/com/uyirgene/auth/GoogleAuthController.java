package com.uyirgene.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.uyirgene.security.JwtService;
import com.uyirgene.user.User;
import com.uyirgene.user.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;

    @Value("${google.client-id:}")
    private String googleClientId;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            String email;
            String name;
            String pictureUrl;

            if (request.getCredential() != null && !request.getCredential().isEmpty()) {
                // ID Token flow (GoogleLogin component)
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(), GsonFactory.getDefaultInstance())
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();

                GoogleIdToken idToken = verifier.verify(request.getCredential());
                if (idToken == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid Google token"));
                }

                GoogleIdToken.Payload payload = idToken.getPayload();
                email = payload.getEmail();
                name = (String) payload.get("name");
                pictureUrl = (String) payload.get("picture");

            } else if (request.getAccessToken() != null && !request.getAccessToken().isEmpty()) {
                // Access Token flow (useGoogleLogin hook) - use Authorization header instead of query param
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setBearerAuth(request.getAccessToken());
                org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
                @SuppressWarnings("unchecked")
                Map<String, Object> userInfo = restTemplate.exchange(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        org.springframework.http.HttpMethod.GET, entity, Map.class).getBody();

                if (userInfo == null || userInfo.get("email") == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Failed to fetch Google user info"));
                }

                email = (String) userInfo.get("email");
                name = (String) userInfo.get("name");
                pictureUrl = (String) userInfo.get("picture");

            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "No Google token provided"));
            }

            User user = userService.findOrCreateGoogleUser(email, name, pictureUrl);
            String jwt = jwtService.generateToken(user);

            return ResponseEntity.ok(Map.of(
                    "token", "Bearer " + jwt,
                    "user", Map.of(
                            "id", user.getId(),
                            "email", user.getEmail(),
                            "name", user.getName() != null ? user.getName() : "",
                            "role", user.getRole().name()
                    )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Google authentication failed. Please try again."));
        }
    }

    @Data
    static class GoogleLoginRequest {
        private String credential;
        private String accessToken;
    }
}
