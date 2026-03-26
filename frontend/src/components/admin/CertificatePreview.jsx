import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker — use ?url import so Vite includes the worker
// file in the production build with the correct resolved path
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// A4 PDF dimensions in points
const PDF_WIDTH = 595;
const PDF_HEIGHT = 842;

// Sample data for preview
const SAMPLE_DATA = {
  studentName: 'John Doe',
  courseTitle: 'Advanced Web Development',
  courseCode: 'AWD-101',
  trainerName: 'Dr. Jane Smith',
  issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }),
  certificateId: 'CERT-ABCD1234',
  marks: '92.5%',
  trainingDuration: '3 Months',
};

// Google Fonts URL for all supported preview fonts
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@300;400;700' +
  '&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700' +
  '&family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700' +
  '&family=Raleway:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700' +
  '&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700' +
  '&family=Cinzel:wght@400;700' +
  '&family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700' +
  '&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700' +
  '&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap';

// Map fontFamily config values to CSS font-family
const FONT_FAMILY_MAP = {
  // Built-in PDF fonts
  helvetica: 'Helvetica, Arial, sans-serif',
  times: '"Times New Roman", Times, serif',
  courier: '"Courier New", Courier, monospace',
  // Google Fonts
  anton: "'Anton', sans-serif",
  oswald: "'Oswald', sans-serif",
  montserrat: "'Montserrat', sans-serif",
  lato: "'Lato', sans-serif",
  raleway: "'Raleway', sans-serif",
  playfair: "'Playfair Display', serif",
  cinzel: "'Cinzel', serif",
  garamond: "'EB Garamond', serif",
  merriweather: "'Merriweather', serif",
  roboto: "'Roboto', sans-serif",
};

/**
 * CertificatePreview - renders a live preview of the certificate template.
 *
 * Props:
 *  - templateConfig: the text position/style config object
 *  - backgroundPreview: data URL or remote URL for background image
 *  - certificateType: 'COMPLETION' or 'PARTICIPATION'
 *  - templatePdfData: ArrayBuffer of template PDF (new upload or fetched from server)
 */
function CertificatePreview({
  templateConfig,
  backgroundPreview,
  certificateType,
  templatePdfData,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [bgImage, setBgImage] = useState(null);
  const [pdfPageImage, setPdfPageImage] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [fontsReady, setFontsReady] = useState(false);

  // Inject Google Fonts stylesheet once and wait for fonts to load
  useEffect(() => {
    const id = 'cert-preview-gfonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // Load background image when URL changes (only used when no template PDF)
  useEffect(() => {
    if (!backgroundPreview) {
      setBgImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setBgImage(img);
    img.onerror = () => setBgImage(null);
    img.src = backgroundPreview;
  }, [backgroundPreview]);

  // Render template PDF first page when data changes
  useEffect(() => {
    let cancelled = false;

    if (!templatePdfData) {
      setPdfPageImage(null);
      return;
    }

    const renderPdf = async () => {
      setPdfLoading(true);
      try {
        // Copy the data so PDF.js doesn't detach the original ArrayBuffer
        const dataCopy = new Uint8Array(templatePdfData);
        const loadingTask = pdfjsLib.getDocument({ data: dataCopy });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // Render at 2x for sharpness
        const viewport = page.getViewport({ scale: 2 });
        const offscreen = document.createElement('canvas');
        offscreen.width = viewport.width;
        offscreen.height = viewport.height;
        const ctx = offscreen.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!cancelled) {
          setPdfPageImage(offscreen);
        }
        pdf.destroy();
      } catch (err) {
        console.error('Failed to render template PDF preview:', err);
        if (!cancelled) {
          setPdfPageImage(null);
        }
      } finally {
        if (!cancelled) {
          setPdfLoading(false);
        }
      }
    };

    renderPdf();
    return () => { cancelled = true; };
  }, [templatePdfData]);

  // Responsive canvas width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setCanvasWidth(Math.min(w, 450));
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !templateConfig) return;

    const scale = canvasWidth / PDF_WIDTH;
    const canvasHeight = Math.round(PDF_HEIGHT * scale);

    // Set canvas dimensions (use devicePixelRatio for sharpness)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Clear and draw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw background: template PDF takes priority, then background image
    if (pdfPageImage) {
      ctx.drawImage(pdfPageImage, 0, 0, canvasWidth, canvasHeight);
    } else if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
    }

    // Helper: convert PDF Y (bottom-origin) to canvas Y (top-origin)
    const toCanvasY = (pdfY) => canvasHeight - (pdfY * scale);

    // Helper: draw a text element
    const drawTextElement = (key, elem, sampleText) => {
      if (!elem || !elem.visible) return;

      const fontSize = Math.max(elem.fontSize * scale, 6);
      const style = elem.fontStyle || 'normal';
      const isBold = style === 'bold' || style === 'bold-italic';
      const isItalic = style === 'italic' || style === 'bold-italic';
      const weight = isBold ? 'bold' : 'normal';
      const slant = isItalic ? 'italic' : 'normal';
      const family = FONT_FAMILY_MAP[elem.fontFamily] || FONT_FAMILY_MAP.helvetica;

      ctx.font = `${slant} ${weight} ${fontSize}px ${family}`;
      ctx.fillStyle = elem.fontColor || '#000000';
      ctx.textBaseline = 'middle';

      const text = elem.text || sampleText;
      let x = elem.x * scale;

      if (elem.centered) {
        const textWidth = ctx.measureText(text).width;
        x = (canvasWidth - textWidth) / 2;
      }

      const y = toCanvasY(elem.y);
      ctx.fillText(text, x, y);
    };

    // Determine dynamic text based on certificate type
    const isCompletion = certificateType === 'COMPLETION';
    const typeLabel = isCompletion ? 'Completion' : 'Participation';
    const completedText = isCompletion
      ? 'has successfully completed the course'
      : 'has participated in the course';

    // Draw each element in rendering order (matching backend)
    drawTextElement('certificateType', templateConfig.certificateType, typeLabel);
    drawTextElement('certifyText', templateConfig.certifyText, 'This is to certify that');
    drawTextElement('studentName', templateConfig.studentName, SAMPLE_DATA.studentName);
    drawTextElement('completedText', templateConfig.completedText, completedText);
    drawTextElement('courseTitle', templateConfig.courseTitle, SAMPLE_DATA.courseTitle);
    drawTextElement('courseCode', templateConfig.courseCode, SAMPLE_DATA.courseCode);
    drawTextElement('marks', templateConfig.marks, SAMPLE_DATA.marks);
    drawTextElement('issueDate', templateConfig.issueDate, SAMPLE_DATA.issueDate);
    drawTextElement('certificateId', templateConfig.certificateId, SAMPLE_DATA.certificateId);
    drawTextElement('trainerName', templateConfig.trainerName, SAMPLE_DATA.trainerName);

    // Draw short description (disabled by default)
    drawTextElement('shortDescription', templateConfig.shortDescription, 'A comprehensive course on modern technologies');

    // Draw training duration (disabled by default)
    drawTextElement('trainingDuration', templateConfig.trainingDuration, SAMPLE_DATA.trainingDuration);

    // Draw QR code placeholder
    const qr = templateConfig.qrCode;
    if (qr && qr.visible) {
      const qrSize = qr.size * scale;
      const qrX = qr.x * scale;
      const qrY = toCanvasY(qr.y) - qrSize;

      // Draw placeholder square
      ctx.fillStyle = '#E0E0E0';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);

      // Draw QR grid pattern
      ctx.fillStyle = '#9E9E9E';
      const cellSize = qrSize / 7;
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if ((r + c) % 2 === 0) {
            ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize, cellSize);
          }
        }
      }

      // Draw border
      ctx.strokeStyle = '#BDBDBD';
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);
    }

    // Draw scan text
    drawTextElement('scanText', templateConfig.scanText, 'Scan to verify');
  }, [templateConfig, bgImage, pdfPageImage, canvasWidth, certificateType]);

  // Redraw whenever dependencies change (including after Google Fonts load)
  useEffect(() => {
    drawPreview();
  }, [drawPreview, fontsReady]);

  return (
    <Box ref={containerRef} sx={{ width: '100%' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        Preview
        {pdfLoading && <CircularProgress size={14} />}
      </Typography>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: '#f5f5f5',
          display: 'flex',
          justifyContent: 'center',
          p: 1,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: 2,
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
        A4 (595 x 842 pt) — Sample data shown
      </Typography>
    </Box>
  );
}

export default React.memo(CertificatePreview);
