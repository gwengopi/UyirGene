package com.uyirgene.course;

import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {
    private final CertificateRepository certRepo;

    @Value("${app.certificate.folder:uploads/certificates}")
    private String certFolder;

    public Certificate generateCertificate(User user, Course course) {
        Certificate existing = certRepo.findByUserAndCourse(user, course).orElse(null);
        if (existing != null) return existing;

        Certificate c = new Certificate();
        c.setUser(user);
        c.setCourse(course);
        c.setIssuedAt(LocalDateTime.now());
        c.setCertificateId(UUID.randomUUID().toString());

        try {
            Path dir = Path.of(certFolder);
            Files.createDirectories(dir);
            String fileName = c.getCertificateId() + ".pdf";
            Path filePath = dir.resolve(fileName);
            createPdfCertificate(user.getName(), course.getTitle(), filePath.toFile());
            c.setFilePath(filePath.toString());
            certRepo.save(c);
            return c;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to generate certificate", ex);
        }
    }

    private void createPdfCertificate(String userName, String courseTitle, File file) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 26);
                cs.newLineAtOffset(100, 600);
                cs.showText("Certificate of Completion");
                cs.endText();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 16);
                cs.newLineAtOffset(100, 550);
                cs.showText("This certifies that " + userName + " has completed the course: " + courseTitle);
                cs.endText();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_OBLIQUE, 12);
                cs.newLineAtOffset(100, 500);
                cs.showText("Issued: " + LocalDateTime.now().toLocalDate().toString());
                cs.endText();
            }
            doc.save(file);
        }
    }
}