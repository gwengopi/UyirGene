package com.uyirgene.course;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service for encrypting and decrypting video URLs.
 * Uses AES-GCM encryption to prevent URL disclosure.
 */
@Service
@Slf4j
public class VideoUrlEncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int GCM_IV_LENGTH = 12;

    @Value("${app.video.encryption-key:UyirGene2024SecretKey123456789}")
    private String encryptionKey;

    /**
     * Encrypt a video URL
     *
     * @param plainUrl The original video URL
     * @return Base64 encoded encrypted URL
     */
    public String encryptUrl(String plainUrl) {
        if (plainUrl == null || plainUrl.isEmpty()) {
            return null;
        }

        try {
            byte[] keyBytes = normalizeKey(encryptionKey);
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");

            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec);

            byte[] encrypted = cipher.doFinal(plainUrl.getBytes(StandardCharsets.UTF_8));

            // Combine IV and encrypted data
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

            return Base64.getUrlEncoder().withoutPadding().encodeToString(combined);
        } catch (Exception e) {
            log.error("Failed to encrypt video URL", e);
            throw new RuntimeException("Failed to encrypt video URL", e);
        }
    }

    /**
     * Decrypt an encrypted video URL
     *
     * @param encryptedUrl Base64 encoded encrypted URL
     * @return The original video URL
     */
    public String decryptUrl(String encryptedUrl) {
        if (encryptedUrl == null || encryptedUrl.isEmpty()) {
            return null;
        }

        try {
            byte[] keyBytes = normalizeKey(encryptionKey);
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");

            byte[] combined = Base64.getUrlDecoder().decode(encryptedUrl);

            // Extract IV and encrypted data
            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] encrypted = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            System.arraycopy(combined, iv.length, encrypted, 0, encrypted.length);

            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);

            byte[] decrypted = cipher.doFinal(encrypted);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to decrypt video URL", e);
            throw new RuntimeException("Failed to decrypt video URL", e);
        }
    }

    /**
     * Normalize the key to exactly 32 bytes (256-bit) for AES-256
     */
    private byte[] normalizeKey(String key) {
        byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
        byte[] normalizedKey = new byte[32];

        if (keyBytes.length >= 32) {
            System.arraycopy(keyBytes, 0, normalizedKey, 0, 32);
        } else {
            System.arraycopy(keyBytes, 0, normalizedKey, 0, keyBytes.length);
            // Pad with zeros if key is shorter
        }

        return normalizedKey;
    }
}
