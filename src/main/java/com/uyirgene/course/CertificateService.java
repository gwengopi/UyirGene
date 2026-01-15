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
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

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

            createCertificatePdf(
                    user.getName(),
                    course.getTitle(),
                    certificate.getCertificateId(),
                    certificate.getIssuedAt(),
                    filePath.toString()
            );

            certificate.setFilePath(filePath.toString());
            return certRepo.save(certificate);
        } catch (Exception ex) {
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

    private void createCertificatePdf(String userName, String courseTitle,
                                       String certificateId, LocalDateTime issuedAt,
                                       String filePath) throws IOException, WriterException {

        PDDocument document = new PDDocument();

        try {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            PDPageContentStream contentStream = new PDPageContentStream(document, page);

            // Draw border
            contentStream.setStrokingColor(0.16f, 0.50f, 0.73f); // Blue color
            contentStream.setLineWidth(3);
            contentStream.addRect(30, 30, pageWidth - 60, pageHeight - 60);
            contentStream.stroke();

            // Inner border
            contentStream.setStrokingColor(0.74f, 0.76f, 0.78f); // Gray
            contentStream.setLineWidth(1);
            contentStream.addRect(40, 40, pageWidth - 80, pageHeight - 80);
            contentStream.stroke();

            float centerX = pageWidth / 2;
            float y = pageHeight - 120;

            // Title: UyirGene
            String title = "UyirGene";
            float titleWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(title) / 1000 * 36;
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 36);
            contentStream.setNonStrokingColor(0.16f, 0.50f, 0.73f);
            contentStream.newLineAtOffset(centerX - titleWidth / 2, y);
            contentStream.showText(title);
            contentStream.endText();

            // Certificate of Completion
            y -= 60;
            String certTitle = "CERTIFICATE OF COMPLETION";
            float certTitleWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(certTitle) / 1000 * 28;
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 28);
            contentStream.setNonStrokingColor(0.17f, 0.24f, 0.31f);
            contentStream.newLineAtOffset(centerX - certTitleWidth / 2, y);
            contentStream.showText(certTitle);
            contentStream.endText();

            // Decorative line
            y -= 25;
            contentStream.setStrokingColor(0.74f, 0.76f, 0.78f);
            contentStream.setLineWidth(2);
            contentStream.moveTo(centerX - 100, y);
            contentStream.lineTo(centerX + 100, y);
            contentStream.stroke();

            // This is to certify that
            y -= 50;
            String certifyText = "This is to certify that";
            float certifyWidth = PDType1Font.HELVETICA.getStringWidth(certifyText) / 1000 * 14;
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 14);
            contentStream.setNonStrokingColor(0.39f, 0.39f, 0.39f);
            contentStream.newLineAtOffset(centerX - certifyWidth / 2, y);
            contentStream.showText(certifyText);
            contentStream.endText();

            // Student Name
            y -= 40;
            float nameWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(userName) / 1000 * 24;
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 24);
            contentStream.setNonStrokingColor(0.16f, 0.50f, 0.73f);
            contentStream.newLineAtOffset(centerX - nameWidth / 2, y);
            contentStream.showText(userName);
            contentStream.endText();

            // has successfully completed the course
            y -= 40;
            String completedText = "has successfully completed the course";
            float completedWidth = PDType1Font.HELVETICA.getStringWidth(completedText) / 1000 * 14;
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 14);
            contentStream.setNonStrokingColor(0.39f, 0.39f, 0.39f);
            contentStream.newLineAtOffset(centerX - completedWidth / 2, y);
            contentStream.showText(completedText);
            contentStream.endText();

            // Course Title
            y -= 40;
            float courseTitleWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(courseTitle) / 1000 * 20;
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 20);
            contentStream.setNonStrokingColor(0.17f, 0.24f, 0.31f);
            contentStream.newLineAtOffset(centerX - courseTitleWidth / 2, y);
            contentStream.showText(courseTitle);
            contentStream.endText();

            // Issued date
            y -= 50;
            String dateText = "Issued on: " + issuedAt.format(DATE_FORMATTER);
            float dateWidth = PDType1Font.HELVETICA_OBLIQUE.getStringWidth(dateText) / 1000 * 12;
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_OBLIQUE, 12);
            contentStream.setNonStrokingColor(0.39f, 0.39f, 0.39f);
            contentStream.newLineAtOffset(centerX - dateWidth / 2, y);
            contentStream.showText(dateText);
            contentStream.endText();

            // Certificate ID
            y -= 25;
            String idText = "Certificate ID: " + certificateId;
            float idWidth = PDType1Font.HELVETICA.getStringWidth(idText) / 1000 * 10;
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.setNonStrokingColor(0.59f, 0.59f, 0.59f);
            contentStream.newLineAtOffset(centerX - idWidth / 2, y);
            contentStream.showText(idText);
            contentStream.endText();

            // Generate and add QR code
            y -= 100;
            String verificationUrl = baseUrl + "/api/certificates/verify/" + certificateId;
            BufferedImage qrImage = QRCodeGenerator.generateQRCodeImage(verificationUrl, 150, 150);

            // Convert BufferedImage to PDImageXObject
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            byte[] qrBytes = baos.toByteArray();
            PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, qrBytes, "qr");

            float qrSize = 70;
            contentStream.drawImage(pdImage, centerX - qrSize / 2, y, qrSize, qrSize);

            // Scan to verify text
            y -= 15;
            String scanText = "Scan to verify";
            float scanWidth = PDType1Font.HELVETICA.getStringWidth(scanText) / 1000 * 8;
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 8);
            contentStream.setNonStrokingColor(0.59f, 0.59f, 0.59f);
            contentStream.newLineAtOffset(centerX - scanWidth / 2, y);
            contentStream.showText(scanText);
            contentStream.endText();

            // Close the content stream
            contentStream.close();

            // Save the document
            document.save(filePath);
            log.info("Certificate PDF created successfully: {}", filePath);

        } finally {
            document.close();
        }
    }
}
