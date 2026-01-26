package com.uyirgene.course;

import com.google.zxing.WriterException;
import com.uyirgene.course.dto.TemplateConfigDto;
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
import java.io.ByteArrayInputStream;
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
    private final CertificateTemplateService templateService;
    private final MailService mailService;

    @Value("${app.certificate.folder:uploads/certificates}")
    private String certFolder;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

    /**
     * Generate a certificate (defaults to COMPLETION type)
     */
    public Certificate generateCertificate(User user, Course course) {
        return generateCertificateWithType(user, course, Certificate.CertificateType.COMPLETION, null, null);
    }

    /**
     * Generate a certificate with specific type and marks (uses course trainer name)
     */
    public Certificate generateCertificateWithType(User user, Course course, Certificate.CertificateType type, Double marks) {
        return generateCertificateWithType(user, course, type, marks, null);
    }

    /**
     * Generate a certificate with specific type, marks, and trainer name
     * @param trainerName - if null, uses course trainer name
     */
    public Certificate generateCertificateWithType(User user, Course course, Certificate.CertificateType type, Double marks, String trainerName) {
        Optional<Certificate> existing = certRepo.findByUserAndCourse(user, course);
        if (existing.isPresent()) {
            // If existing certificate is of different type, regenerate
            Certificate existingCert = existing.get();
            if (existingCert.getType() == type) {
                return existingCert;
            }
            // Delete existing and create new with different type
            certRepo.delete(existingCert);
        }

        // Use provided trainer name or fallback to course trainer
        String effectiveTrainerName = (trainerName != null && !trainerName.isBlank())
                ? trainerName
                : course.getTrainerName();

        Certificate certificate = Certificate.builder()
                .user(user)
                .course(course)
                .issuedAt(LocalDateTime.now())
                .certificateId(generateUniqueCertificateId())
                .type(type)
                .marks(marks)
                .trainerName(effectiveTrainerName)
                .build();

        try {
            Path dir = Path.of(certFolder);
            Files.createDirectories(dir);

            String fileName = certificate.getCertificateId() + ".pdf";
            Path filePath = dir.resolve(fileName);

            // Look up template for this course and type
            Optional<CertificateTemplate> templateOpt = templateService.findTemplateForCertificate(course, type);
            CertificateTemplate template = templateOpt.orElse(null);

            // Debug logging
            if (template != null) {
                log.info("Found template: id={}, name={}, hasTemplateFile={}, templateFileSize={}",
                    template.getId(),
                    template.getName(),
                    template.getTemplateFile() != null,
                    template.getTemplateFile() != null ? template.getTemplateFile().length : 0);
            } else {
                log.info("No template found for course {} and type {}", course.getId(), type);
            }

            // Check if template has a PDF file
            if (template != null && template.getTemplateFile() != null && template.getTemplateFile().length > 0) {
                log.info("Using PDF template for certificate generation");
                // Use PDF template with overlay
                createCertificateFromTemplate(
                        user.getName(),
                        course,
                        certificate.getCertificateId(),
                        certificate.getIssuedAt(),
                        type,
                        marks,
                        filePath.toString(),
                        template,
                        effectiveTrainerName
                );
            } else {
                log.info("Using dynamic certificate generation (no PDF template found or template has no PDF file)");
                // Use dynamic generation (legacy method)
                createCertificatePdfDynamic(
                        user.getName(),
                        course,
                        certificate.getCertificateId(),
                        certificate.getIssuedAt(),
                        type,
                        marks,
                        filePath.toString(),
                        template,
                        effectiveTrainerName
                );
            }

            certificate.setFilePath(filePath.toString());
            Certificate saved = certRepo.save(certificate);

            // Send certificate ready email notification
            try {
                mailService.sendCertificateReady(user, course, saved);
            } catch (Exception emailEx) {
                log.warn("Failed to send certificate ready email, but certificate was generated successfully", emailEx);
            }

            return saved;
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

    /**
     * Create certificate from PDF template with text overlay
     */
    private void createCertificateFromTemplate(String userName, Course course,
                                                String certificateId, LocalDateTime issuedAt,
                                                Certificate.CertificateType type, Double marks,
                                                String filePath, CertificateTemplate template,
                                                String trainerName) throws IOException, WriterException {

        log.info("Creating certificate from PDF template: {}", template.getName());

        // Load the PDF template (PDFBox 2.x uses PDDocument.load())
        PDDocument document = PDDocument.load(new ByteArrayInputStream(template.getTemplateFile()));

        try {
            // Get the first page (or only page) of the template
            PDPage page = document.getPage(0);
            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            // Parse template configuration
            TemplateConfigDto config = TemplateConfigDto.fromJson(template.getTemplateConfig());

            // Create content stream to overlay text (APPEND mode)
            PDPageContentStream contentStream = new PDPageContentStream(
                    document, page, PDPageContentStream.AppendMode.APPEND, true, true);

            // Get fonts (PDFBox 2.x uses static constants)
            PDType1Font fontBold = PDType1Font.HELVETICA_BOLD;
            PDType1Font fontRegular = PDType1Font.HELVETICA;
            PDType1Font fontItalic = PDType1Font.HELVETICA_OBLIQUE;

            // Draw "This is to certify that" text
            if (config.getCertifyText().isVisible()) {
                TemplateConfigDto.TextElement elem = config.getCertifyText();
                String text = elem.getText() != null ? elem.getText() : "This is to certify that";
                drawText(contentStream, text, elem, fontRegular, pageWidth);
            }

            // Draw student name
            if (config.getStudentName().isVisible()) {
                drawText(contentStream, userName, config.getStudentName(), fontBold, pageWidth);
            }

            // Draw "has successfully completed" text
            if (config.getCompletedText().isVisible()) {
                String text = type == Certificate.CertificateType.COMPLETION
                        ? "has successfully completed the course"
                        : "has participated in the course";
                drawText(contentStream, text, config.getCompletedText(), fontRegular, pageWidth);
            }

            // Draw course title
            if (config.getCourseTitle().isVisible()) {
                drawText(contentStream, course.getTitle(), config.getCourseTitle(), fontBold, pageWidth);
            }

            // Draw course code
            if (config.getCourseCode() != null && config.getCourseCode().isVisible() && course.getCourseCode() != null) {
                drawText(contentStream, "Course ID: " + course.getCourseCode(), config.getCourseCode(), fontRegular, pageWidth);
            }

            // Draw trainer name (use provided trainerName, not course.getTrainerName())
            if (config.getTrainerName() != null && config.getTrainerName().isVisible() && trainerName != null) {
                drawText(contentStream, "Trainer: " + trainerName, config.getTrainerName(), fontRegular, pageWidth);
            }

            // Draw short description
            if (config.getShortDescription() != null && config.getShortDescription().isVisible() && course.getShortDescription() != null) {
                drawText(contentStream, course.getShortDescription(), config.getShortDescription(), fontRegular, pageWidth);
            }

            // Draw marks if available
            if (marks != null && config.getMarks().isVisible()) {
                String marksText = String.format("Score: %.1f%%", marks);
                drawText(contentStream, marksText, config.getMarks(), fontRegular, pageWidth);
            }

            // Draw issue date
            if (config.getIssueDate().isVisible()) {
                String dateText = "Issued on: " + issuedAt.format(DATE_FORMATTER);
                drawText(contentStream, dateText, config.getIssueDate(), fontItalic, pageWidth);
            }

            // Draw certificate ID
            if (config.getCertificateId().isVisible()) {
                String idText = "Certificate ID: " + certificateId;
                drawText(contentStream, idText, config.getCertificateId(), fontRegular, pageWidth);
            }

            // Draw QR code
            if (config.getQrCode().isVisible()) {
                TemplateConfigDto.QRCodeElement qrElem = config.getQrCode();
                String verificationUrl = baseUrl + "/certificate/" + certificateId;
                BufferedImage qrImage = QRCodeGenerator.generateQRCodeImage(verificationUrl, 150, 150);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(qrImage, "PNG", baos);
                byte[] qrBytes = baos.toByteArray();
                PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, qrBytes, "qr");

                contentStream.drawImage(pdImage, qrElem.getX(), qrElem.getY(), qrElem.getSize(), qrElem.getSize());
            }

            // Draw "Scan to verify" text
            if (config.getScanText().isVisible()) {
                drawText(contentStream, "Scan to verify", config.getScanText(), fontRegular, pageWidth);
            }

            // Close content stream
            contentStream.close();

            // Save the document
            document.save(filePath);
            log.info("Certificate PDF created from template successfully: {} (type: {})", filePath, type);

        } finally {
            document.close();
        }
    }

    /**
     * Draw text on the PDF at the specified position
     */
    private void drawText(PDPageContentStream contentStream, String text,
                          TemplateConfigDto.TextElement elem, PDType1Font font,
                          float pageWidth) throws IOException {
        float[] color = TemplateConfigDto.parseColor(elem.getFontColor());

        contentStream.beginText();
        contentStream.setFont(font, elem.getFontSize());
        contentStream.setNonStrokingColor(color[0], color[1], color[2]);

        float x = elem.getX();
        if (elem.isCentered()) {
            float textWidth = font.getStringWidth(text) / 1000 * elem.getFontSize();
            x = (pageWidth - textWidth) / 2;
        }

        contentStream.newLineAtOffset(x, elem.getY());
        contentStream.showText(text);
        contentStream.endText();
    }

    /**
     * Create certificate PDF dynamically (legacy method for backward compatibility)
     */
    private void createCertificatePdfDynamic(String userName, Course course,
                                              String certificateId, LocalDateTime issuedAt,
                                              Certificate.CertificateType type, Double marks,
                                              String filePath, CertificateTemplate template,
                                              String trainerName) throws IOException, WriterException {

        PDDocument document = new PDDocument();

        try {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            PDPageContentStream contentStream = new PDPageContentStream(document, page);

            // Get fonts (PDFBox 2.x uses static constants)
            PDType1Font fontBold = PDType1Font.HELVETICA_BOLD;
            PDType1Font fontRegular = PDType1Font.HELVETICA;
            PDType1Font fontItalic = PDType1Font.HELVETICA_OBLIQUE;

            // Draw background image if template has one
            if (template != null && template.getBackgroundImage() != null && template.getBackgroundImage().length > 0) {
                PDImageXObject bgImage = PDImageXObject.createFromByteArray(document, template.getBackgroundImage(), "background");
                contentStream.drawImage(bgImage, 0, 0, pageWidth, pageHeight);
            }

            // Different colors for different certificate types
            float borderR, borderG, borderB;
            if (type == Certificate.CertificateType.COMPLETION) {
                borderR = 0.16f; borderG = 0.50f; borderB = 0.73f; // Blue
            } else {
                borderR = 0.60f; borderG = 0.40f; borderB = 0.20f; // Bronze/Brown for participation
            }

            // Draw border only if no background image
            boolean hasBackgroundImage = template != null && template.getBackgroundImage() != null && template.getBackgroundImage().length > 0;
            if (!hasBackgroundImage) {
                contentStream.setStrokingColor(borderR, borderG, borderB);
                contentStream.setLineWidth(3);
                contentStream.addRect(30, 30, pageWidth - 60, pageHeight - 60);
                contentStream.stroke();

                // Inner border
                contentStream.setStrokingColor(0.74f, 0.76f, 0.78f); // Gray
                contentStream.setLineWidth(1);
                contentStream.addRect(40, 40, pageWidth - 80, pageHeight - 80);
                contentStream.stroke();
            }

            float centerX = pageWidth / 2;
            float y = pageHeight - 120;

            // Title: UyirGene
            String title = "UyirGene";
            float titleWidth = fontBold.getStringWidth(title) / 1000 * 36;
            contentStream.beginText();
            contentStream.setFont(fontBold, 36);
            contentStream.setNonStrokingColor(borderR, borderG, borderB);
            contentStream.newLineAtOffset(centerX - titleWidth / 2, y);
            contentStream.showText(title);
            contentStream.endText();

            // Certificate Type Title - use template header if available
            y -= 60;
            String certTitle;
            if (template != null && template.getHeaderText() != null && !template.getHeaderText().isEmpty()) {
                certTitle = template.getHeaderText();
            } else {
                certTitle = type == Certificate.CertificateType.COMPLETION
                        ? "CERTIFICATE OF COMPLETION"
                        : "CERTIFICATE OF PARTICIPATION";
            }
            float certTitleWidth = fontBold.getStringWidth(certTitle) / 1000 * 24;
            contentStream.beginText();
            contentStream.setFont(fontBold, 24);
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
            float certifyWidth = fontRegular.getStringWidth(certifyText) / 1000 * 14;
            contentStream.beginText();
            contentStream.setFont(fontRegular, 14);
            contentStream.setNonStrokingColor(0.39f, 0.39f, 0.39f);
            contentStream.newLineAtOffset(centerX - certifyWidth / 2, y);
            contentStream.showText(certifyText);
            contentStream.endText();

            // Student Name
            y -= 40;
            float nameWidth = fontBold.getStringWidth(userName) / 1000 * 24;
            contentStream.beginText();
            contentStream.setFont(fontBold, 24);
            contentStream.setNonStrokingColor(borderR, borderG, borderB);
            contentStream.newLineAtOffset(centerX - nameWidth / 2, y);
            contentStream.showText(userName);
            contentStream.endText();

            // Certificate type specific text
            y -= 40;
            String completedText = type == Certificate.CertificateType.COMPLETION
                    ? "has successfully completed the course"
                    : "has participated in the course";
            float completedWidth = fontRegular.getStringWidth(completedText) / 1000 * 14;
            contentStream.beginText();
            contentStream.setFont(fontRegular, 14);
            contentStream.setNonStrokingColor(0.39f, 0.39f, 0.39f);
            contentStream.newLineAtOffset(centerX - completedWidth / 2, y);
            contentStream.showText(completedText);
            contentStream.endText();

            // Course Title
            y -= 40;
            String courseTitle = course.getTitle();
            float courseTitleWidth = fontBold.getStringWidth(courseTitle) / 1000 * 20;
            contentStream.beginText();
            contentStream.setFont(fontBold, 20);
            contentStream.setNonStrokingColor(0.17f, 0.24f, 0.31f);
            contentStream.newLineAtOffset(centerX - courseTitleWidth / 2, y);
            contentStream.showText(courseTitle);
            contentStream.endText();

            // Course Code (if available)
            if (course.getCourseCode() != null && !course.getCourseCode().isEmpty()) {
                y -= 25;
                String codeText = "Course ID: " + course.getCourseCode();
                float codeWidth = fontRegular.getStringWidth(codeText) / 1000 * 10;
                contentStream.beginText();
                contentStream.setFont(fontRegular, 10);
                contentStream.setNonStrokingColor(0.59f, 0.59f, 0.59f);
                contentStream.newLineAtOffset(centerX - codeWidth / 2, y);
                contentStream.showText(codeText);
                contentStream.endText();
            }

            // Trainer Name (use provided trainerName, not course.getTrainerName())
            if (trainerName != null && !trainerName.isEmpty()) {
                y -= 25;
                String trainerText = "Trainer: " + trainerName;
                float trainerWidth = fontRegular.getStringWidth(trainerText) / 1000 * 12;
                contentStream.beginText();
                contentStream.setFont(fontRegular, 12);
                contentStream.setNonStrokingColor(0.39f, 0.39f, 0.39f);
                contentStream.newLineAtOffset(centerX - trainerWidth / 2, y);
                contentStream.showText(trainerText);
                contentStream.endText();
            }

            // Short Description (if available)
            if (course.getShortDescription() != null && !course.getShortDescription().isEmpty()) {
                y -= 20;
                String descText = course.getShortDescription();
                // Truncate if too long for certificate
                if (descText.length() > 80) {
                    descText = descText.substring(0, 77) + "...";
                }
                float descWidth = fontItalic.getStringWidth(descText) / 1000 * 10;
                contentStream.beginText();
                contentStream.setFont(fontItalic, 10);
                contentStream.setNonStrokingColor(0.39f, 0.39f, 0.39f);
                contentStream.newLineAtOffset(centerX - descWidth / 2, y);
                contentStream.showText(descText);
                contentStream.endText();
            }

            // Show marks if available
            if (marks != null) {
                y -= 35;
                String marksText = String.format("Score: %.1f%%", marks);
                float marksWidth = fontRegular.getStringWidth(marksText) / 1000 * 12;
                contentStream.beginText();
                contentStream.setFont(fontRegular, 12);
                contentStream.setNonStrokingColor(0.39f, 0.39f, 0.39f);
                contentStream.newLineAtOffset(centerX - marksWidth / 2, y);
                contentStream.showText(marksText);
                contentStream.endText();
            }

            // Issued date
            y -= 40;
            String dateText = "Issued on: " + issuedAt.format(DATE_FORMATTER);
            float dateWidth = fontItalic.getStringWidth(dateText) / 1000 * 12;
            contentStream.beginText();
            contentStream.setFont(fontItalic, 12);
            contentStream.setNonStrokingColor(0.39f, 0.39f, 0.39f);
            contentStream.newLineAtOffset(centerX - dateWidth / 2, y);
            contentStream.showText(dateText);
            contentStream.endText();

            // Certificate ID
            y -= 25;
            String idText = "Certificate ID: " + certificateId;
            float idWidth = fontRegular.getStringWidth(idText) / 1000 * 10;
            contentStream.beginText();
            contentStream.setFont(fontRegular, 10);
            contentStream.setNonStrokingColor(0.59f, 0.59f, 0.59f);
            contentStream.newLineAtOffset(centerX - idWidth / 2, y);
            contentStream.showText(idText);
            contentStream.endText();

            // Generate and add QR code
            y -= 90;
            String verificationUrl = baseUrl + "/certificate/" + certificateId;
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
            float scanWidth = fontRegular.getStringWidth(scanText) / 1000 * 8;
            contentStream.beginText();
            contentStream.setFont(fontRegular, 8);
            contentStream.setNonStrokingColor(0.59f, 0.59f, 0.59f);
            contentStream.newLineAtOffset(centerX - scanWidth / 2, y);
            contentStream.showText(scanText);
            contentStream.endText();

            // Close the content stream
            contentStream.close();

            // Save the document
            document.save(filePath);
            log.info("Certificate PDF created dynamically: {} (type: {})", filePath, type);

        } finally {
            document.close();
        }
    }
}
