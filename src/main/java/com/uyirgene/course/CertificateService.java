package com.uyirgene.course;

import com.google.zxing.WriterException;
import com.uyirgene.user.User;
import com.uyirgene.util.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {
    private final CertificateRepository certRepo;

    @Value("${app.certificate.folder:uploads/certificates}")
    private String certFolder;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.certificate.logo-path:static/images/logo.png}")
    private String logoPath;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();

    public Certificate generateCertificate(User user, Course course) {
        Optional<Certificate> existing = certRepo.findByUserAndCourse(user, course);
        if (existing.isPresent()) {
            return existing.get();
        }

        Certificate certificate = Certificate.builder()
                .user(user)
                .course(course)
                .issuedAt(LocalDateTime.now())
                .certificateId(generateUniqueCertificateId())
                .build();

        try {
            Path dir = Path.of(certFolder);
            Files.createDirectories(dir);

            String fileName = certificate.getCertificateId() + ".pdf";
            Path filePath = dir.resolve(fileName);

            createProfessionalPdfCertificate(
                    user.getName(),
                    course.getTitle(),
                    certificate.getCertificateId(),
                    certificate.getIssuedAt(),
                    filePath
            );

            certificate.setFilePath(filePath.toString());
            return certRepo.save(certificate);
        } catch (IOException | WriterException ex) {
            log.error("Failed to generate certificate for user {} and course {}", user.getId(), course.getId(), ex);
            throw new RuntimeException("Failed to generate certificate", ex);
        }
    }

    public Optional<Certificate> verifyCertificate(String certificateId) {
        return certRepo.findByCertificateId(certificateId);
    }

    private String generateUniqueCertificateId() {
        return "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void createProfessionalPdfCertificate(String userName, String courseTitle,
                                                   String certificateId, LocalDateTime issuedAt,
                                                   Path filePath) throws IOException, WriterException {
        PDDocument doc = null;
        PDPageContentStream cs = null;

        try {
            doc = new PDDocument();
            PDPage page = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
            doc.addPage(page);

            cs = new PDPageContentStream(doc, page);

            // Draw decorative border
            drawBorder(cs);

            float yPosition = PAGE_HEIGHT - 80;

            // Draw logo at the top
            yPosition = drawLogo(doc, cs, yPosition);

            // Draw title
            yPosition = drawCenteredText(cs, "CERTIFICATE OF COMPLETION", yPosition - 30,
                    PDType1Font.HELVETICA_BOLD, 28, 44, 62, 80);

            // Draw decorative line
            yPosition = drawDecorativeLine(cs, yPosition - 20);

            // Draw "This is to certify that"
            yPosition = drawCenteredText(cs, "This is to certify that", yPosition - 40,
                    PDType1Font.HELVETICA, 14, 100, 100, 100);

            // Draw student name
            yPosition = drawCenteredText(cs, userName, yPosition - 30,
                    PDType1Font.HELVETICA_BOLD, 24, 41, 128, 185);

            // Draw "has successfully completed"
            yPosition = drawCenteredText(cs, "has successfully completed the course", yPosition - 30,
                    PDType1Font.HELVETICA, 14, 100, 100, 100);

            // Draw course title
            yPosition = drawCenteredText(cs, courseTitle, yPosition - 30,
                    PDType1Font.HELVETICA_BOLD, 20, 44, 62, 80);

            // Draw issued date
            String formattedDate = issuedAt.format(DATE_FORMATTER);
            yPosition = drawCenteredText(cs, "Issued on: " + formattedDate, yPosition - 40,
                    PDType1Font.HELVETICA_OBLIQUE, 12, 100, 100, 100);

            // Draw certificate ID
            yPosition = drawCenteredText(cs, "Certificate ID: " + certificateId, yPosition - 20,
                    PDType1Font.HELVETICA, 10, 150, 150, 150);

            // Draw QR code for verification
            drawQRCode(doc, cs, certificateId, yPosition - 100);

            // Close content stream before saving
            cs.close();
            cs = null;

            // Save the document
            doc.save(filePath.toFile());
            log.info("Certificate generated successfully: {}", filePath);

        } finally {
            // Ensure content stream is closed
            if (cs != null) {
                try {
                    cs.close();
                } catch (IOException e) {
                    log.warn("Error closing content stream", e);
                }
            }
            // Ensure document is closed
            if (doc != null) {
                try {
                    doc.close();
                } catch (IOException e) {
                    log.warn("Error closing document", e);
                }
            }
        }
    }

    private void drawBorder(PDPageContentStream cs) throws IOException {
        float margin = 30;
        float borderWidth = 3;

        // Outer border - blue
        cs.setStrokingColor(41 / 255f, 128 / 255f, 185 / 255f);
        cs.setLineWidth(borderWidth);
        cs.addRect(margin, margin, PAGE_WIDTH - 2 * margin, PAGE_HEIGHT - 2 * margin);
        cs.stroke();

        // Inner border - gray
        float innerMargin = margin + 10;
        cs.setStrokingColor(189 / 255f, 195 / 255f, 199 / 255f);
        cs.setLineWidth(1);
        cs.addRect(innerMargin, innerMargin, PAGE_WIDTH - 2 * innerMargin, PAGE_HEIGHT - 2 * innerMargin);
        cs.stroke();
    }

    private float drawLogo(PDDocument doc, PDPageContentStream cs, float yPosition) throws IOException {
        try {
            ClassPathResource logoResource = new ClassPathResource(logoPath);
            if (logoResource.exists()) {
                try (InputStream is = logoResource.getInputStream()) {
                    BufferedImage logoImage = ImageIO.read(is);
                    if (logoImage != null) {
                        PDImageXObject pdImage = LosslessFactory.createFromImage(doc, logoImage);

                        float logoWidth = 100;
                        float logoHeight = logoWidth * pdImage.getHeight() / pdImage.getWidth();
                        float logoX = (PAGE_WIDTH - logoWidth) / 2;

                        cs.drawImage(pdImage, logoX, yPosition - logoHeight, logoWidth, logoHeight);
                        return yPosition - logoHeight;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not load logo from {}, proceeding without logo", logoPath);
        }

        // If logo not found, draw a placeholder text
        return drawCenteredText(cs, "UyirGene", yPosition - 40,
                PDType1Font.HELVETICA_BOLD, 32, 41, 128, 185);
    }

    private float drawCenteredText(PDPageContentStream cs, String text, float yPosition,
                                    PDType1Font font, float fontSize, int r, int g, int b) throws IOException {
        float textWidth = font.getStringWidth(text) / 1000 * fontSize;
        float xPosition = (PAGE_WIDTH - textWidth) / 2;

        cs.beginText();
        cs.setFont(font, fontSize);
        cs.setNonStrokingColor(r / 255f, g / 255f, b / 255f);
        cs.newLineAtOffset(xPosition, yPosition);
        cs.showText(text);
        cs.endText();

        return yPosition;
    }

    private float drawDecorativeLine(PDPageContentStream cs, float yPosition) throws IOException {
        float lineWidth = 200;
        float xStart = (PAGE_WIDTH - lineWidth) / 2;

        cs.setStrokingColor(189 / 255f, 195 / 255f, 199 / 255f);
        cs.setLineWidth(2);
        cs.moveTo(xStart, yPosition);
        cs.lineTo(xStart + lineWidth, yPosition);
        cs.stroke();

        return yPosition;
    }

    private void drawQRCode(PDDocument doc, PDPageContentStream cs, String certificateId, float yPosition)
            throws IOException, WriterException {
        String verificationUrl = baseUrl + "/api/certificates/verify/" + certificateId;
        BufferedImage qrImage = QRCodeGenerator.generateQRCodeImage(verificationUrl, 100, 100);

        PDImageXObject pdImage = LosslessFactory.createFromImage(doc, qrImage);

        float qrSize = 80;
        float qrX = (PAGE_WIDTH - qrSize) / 2;

        cs.drawImage(pdImage, qrX, yPosition, qrSize, qrSize);

        // Add verification text below QR code
        drawCenteredText(cs, "Scan to verify", yPosition - 15,
                PDType1Font.HELVETICA, 8, 150, 150, 150);
    }
}
