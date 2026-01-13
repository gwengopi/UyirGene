package com.uyirgene.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.imageio.ImageIO;

/**
 * Utility class for generating QR codes.
 * Uses ZXing library for QR code generation.
 */
public final class QRCodeGenerator {

    private QRCodeGenerator() {
        // Utility class - prevent instantiation
    }

    /**
     * Generates a QR code as a BufferedImage.
     *
     * @param content The content to encode in the QR code
     * @param width   The width of the QR code in pixels
     * @param height  The height of the QR code in pixels
     * @return BufferedImage containing the QR code
     * @throws WriterException if QR code generation fails
     */
    public static BufferedImage generateQRCodeImage(String content, int width, int height) throws WriterException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 1);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }

    /**
     * Generates a QR code as a byte array (PNG format).
     *
     * @param content The content to encode in the QR code
     * @param width   The width of the QR code in pixels
     * @param height  The height of the QR code in pixels
     * @return byte array containing the QR code in PNG format
     * @throws WriterException if QR code generation fails
     * @throws IOException     if image conversion fails
     */
    public static byte[] generateQRCodeBytes(String content, int width, int height) throws WriterException, IOException {
        BufferedImage image = generateQRCodeImage(content, width, height);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        return baos.toByteArray();
    }
}
