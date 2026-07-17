
const { sendSuccess, sendError } = require('../utils/apiResponse');
const geminiService = require('../services/gemini.service');
const cloudinaryService = require('../services/cloudinary.service');
const pdfService = require('../services/pdf.service');

const prisma = require('../utils/prisma');

const DISEASE_SYSTEM_PROMPT = `You are an expert agricultural plant pathologist AI.
Analyze the crop leaf image and return ONLY this valid JSON:
{
  "cropName": <string: identified crop name>,
  "isHealthy": <boolean>,
  "diseaseName": <string | null: disease name if unhealthy>,
  "confidence": <number 0-1>,
  "symptoms": <string | null>,
  "causes": <string | null>,
  "treatment": <string | null: step-by-step treatment>,
  "fertilizer": <string | null: recommended fertilizer>,
  "pesticide": <string | null: recommended pesticide>,
  "organicAlt": <string | null: organic/natural alternative>,
  "prevention": <string | null: prevention measures>,
  "recoveryTime": <string | null: e.g. "2-3 weeks">
}
Be specific and practical for Indian farmers. Return ONLY the JSON.`;

const analyzeDisease = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'Please upload a crop leaf image', 400);
    }

    // Upload to Cloudinary first
    let imageUrl = '';
    try {
      const uploaded = await cloudinaryService.uploadImage(req.file.buffer, 'disease-detection');
      imageUrl = uploaded.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to base64 data URL:', err.message);
      const base64 = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    // Analyze with Gemini Vision
    let analysis;
    try {
      analysis = await geminiService.callGeminiVision(
        req.file.buffer,
        req.file.mimetype,
        DISEASE_SYSTEM_PROMPT,
        req.body.cropType ? `${req.body.cropType}_${req.file.originalname}` : req.file.originalname
      );
    } catch {
      analysis = {
        cropName: 'Unknown',
        isHealthy: false,
        diseaseName: 'Analysis Unavailable',
        confidence: 0,
        symptoms: 'Could not analyze. Please ensure image shows a clear crop leaf.',
        causes: null,
        treatment: 'Please consult a local agricultural extension officer.',
        fertilizer: null,
        pesticide: null,
        organicAlt: null,
        prevention: 'Ensure good crop hygiene and proper irrigation.',
        recoveryTime: null,
      };
    }

    // Generate PDF report
    let reportPdfUrl = null;
    try {
      reportPdfUrl = await generateDiseaseReport(analysis, imageUrl);
    } catch { /* non-critical */ }

    const record = await prisma.diseaseDetection.create({
      data: {
        userId: req.user.id,
        imageUrl,
        cropName: analysis.cropName || 'Unknown',
        isHealthy: analysis.isHealthy ?? true,
        diseaseName: analysis.diseaseName || null,
        confidence: analysis.confidence || 0,
        symptoms: analysis.symptoms || null,
        causes: analysis.causes || null,
        treatment: analysis.treatment || null,
        fertilizer: analysis.fertilizer || null,
        pesticide: analysis.pesticide || null,
        organicAlt: analysis.organicAlt || null,
        prevention: analysis.prevention || null,
        recoveryTime: analysis.recoveryTime || null,
        reportPdfUrl,
      },
    });

    return sendSuccess(res, record, 201, 'Disease analysis complete');
  } catch (err) {
    next(err);
  }
};

const generateDiseaseReport = async (analysis, imageUrl) => {
  const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const green = rgb(0.106, 0.478, 0.239);

  let y = 800;
  page.drawRectangle({ x: 0, y: 820, width: 595, height: 45, color: green });
  page.drawText('AI FARMER MARKETPLACE - DISEASE REPORT', { x: 80, y: 830, size: 16, font: boldFont, color: rgb(1,1,1) });

  y -= 30;
  page.drawText(`Crop: ${analysis.cropName}`, { x: 40, y, size: 14, font: boldFont, color: green });
  page.drawText(`Status: ${analysis.isHealthy ? '✓ HEALTHY' : '⚠ DISEASED'}`, { x: 300, y, size: 14, font: boldFont, color: analysis.isHealthy ? green : rgb(0.8, 0.2, 0.2) });

  const drawField = (label, value, yPos) => {
    if (!value) return yPos;
    page.drawText(`${label}:`, { x: 40, yPos, size: 10, font: boldFont, color: rgb(0.3,0.3,0.3) });
    // Wrap text
    const words = value.split(' ');
    let line = '';
    let ly = yPos - 14;
    for (const word of words) {
      if ((line + word).length > 80) {
        page.drawText(line, { x: 40, y: ly, size: 10, font, color: rgb(0.1,0.1,0.1) });
        line = word + ' ';
        ly -= 13;
      } else {
        line += word + ' ';
      }
    }
    if (line.trim()) page.drawText(line.trim(), { x: 40, y: ly, size: 10, font, color: rgb(0.1,0.1,0.1) });
    return ly - 10;
  };

  y -= 30;
  if (analysis.diseaseName) y = drawField('Disease', analysis.diseaseName, y);
  y = drawField('Confidence', `${(analysis.confidence * 100).toFixed(1)}%`, y);
  if (analysis.symptoms) y = drawField('Symptoms', analysis.symptoms, y);
  if (analysis.treatment) y = drawField('Treatment', analysis.treatment, y);
  if (analysis.fertilizer) y = drawField('Fertilizer', analysis.fertilizer, y);
  if (analysis.prevention) y = drawField('Prevention', analysis.prevention, y);

  page.drawText(`Report generated: ${new Date().toLocaleString('en-IN')}`, { x: 40, y: 30, size: 8, font, color: rgb(0.5,0.5,0.5) });

  const bytes = await pdfDoc.save();
  return `data:application/pdf;base64,${Buffer.from(bytes).toString('base64')}`;
};

const getDiseaseHistory = async (req, res, next) => {
  try {
    const records = await prisma.diseaseDetection.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return sendSuccess(res, records);
  } catch (err) {
    next(err);
  }
};

module.exports = { analyzeDisease, getDiseaseHistory };
