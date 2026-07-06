const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Survey, SurveyResponse, SurveyAnswer, Question, User, Participation, ParticipationFile } = require('../models');
const logger = require('../utils/logger');

// GET /api/export/surveys/:id/excel
exports.exportSurveyExcel = async (req, res) => {
  try {
    const survey = await Survey.findByPk(req.params.id, {
      include: [{ model: Question, as: 'questions', order: [['order_num', 'ASC']] }],
    });
    if (!survey) return res.status(404).json({ message: 'Survey not found.' });

    const responses = await SurveyResponse.findAll({
      where: { survey_id: survey.id },
      include: [
        { model: User, as: 'user', attributes: ['full_name', 'username', 'role', 'student_staff_id'] },
        { model: SurveyAnswer, as: 'answers' },
      ],
      order: [['submitted_at', 'DESC']],
    });

    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Survey Results');

    // Header row
    const headers = ['#', 'Full Name', 'Username', 'ID', 'Role', 'Submitted At',
      ...survey.questions.map((q, i) => `Q${i + 1}: ${q.question_text.substring(0, 50)}`)];
    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a7f4b' } };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Data rows
    responses.forEach((resp, idx) => {
      const row = [
        idx + 1,
        resp.user?.full_name || '',
        resp.user?.username || '',
        resp.user?.student_staff_id || '',
        resp.user?.role || '',
        new Date(resp.submitted_at).toLocaleString('en-US'),
      ];
      survey.questions.forEach((q) => {
        const ans = resp.answers?.find((a) => a.question_id === q.id);
        row.push(ans ? (ans.answer_text || '').replace(/\|\|\|/g, ', ') : '');
      });
      worksheet.addRow(row);
    });

    // Auto width
    worksheet.columns.forEach((col) => { col.width = Math.max(col.header?.length || 10, 15); });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="survey_${survey.id}_results.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    logger.error('exportSurveyExcel error:', err);
    res.status(500).json({ message: 'Failed to export survey.' });
  }
};

// GET /api/export/participations/pdf
exports.exportParticipationsPDF = async (req, res) => {
  try {
    const participations = await Participation.findAll({
      where: { status: 'Approved' },
      include: [
        { model: User, as: 'user', attributes: ['full_name', 'username', 'role', 'student_staff_id'] },
        { model: User, as: 'reviewer', attributes: ['full_name'] },
      ],
      order: [['reviewed_at', 'DESC']],
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="approved_participations.pdf"');
    doc.pipe(res);

    // Title
    doc.fontSize(18).fillColor('#1a7f4b').text('EcoSurvey — Approved Participation Reports', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(`Generated: ${new Date().toLocaleString('en-US')}`, { align: 'center' });
    doc.moveDown(1.5);

    participations.forEach((p, idx) => {
      doc.fontSize(12).fillColor('#1a7f4b').text(`${idx + 1}. ${p.event_name}`);
      doc.fontSize(9).fillColor('#333')
        .text(`Submitted by: ${p.user?.full_name} (${p.user?.username}) — ${p.user?.role}`)
        .text(`Location: ${p.location}  |  Participants: ${p.participant_count}`)
        .text(`Date submitted: ${new Date(p.created_at).toLocaleDateString('en-US')}`)
        .text(`Reviewed by: ${p.reviewer?.full_name || 'Admin'}  |  Date: ${p.reviewed_at ? new Date(p.reviewed_at).toLocaleDateString('en-US') : '—'}`)
        .moveDown(0.5)
        .text(p.description, { indent: 20 });
      if (p.ai_summary) {
        doc.fillColor('#555').text(`AI Summary: ${p.ai_summary}`, { indent: 20, italics: true });
      }
      doc.moveDown(1).strokeColor('#ccc').moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    logger.error('exportParticipationsPDF error:', err);
    res.status(500).json({ message: 'Failed to export participations.' });
  }
};
