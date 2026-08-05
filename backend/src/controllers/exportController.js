/**
 * @module ExportController
 * @description Controller xuất dữ liệu kết quả khảo sát ra bảng tính Excel (.xlsx) và xuất báo cáo minh chứng đã duyệt ra tệp PDF có hỗ trợ Font tiếng Việt (Unicode).
 * 
 * @function exportSurveyExcel
 * @description Trích xuất toàn bộ kết quả trả lời của một đợt khảo sát ra file Excel.
 * @param {Object} req - Request chứa `req.params.id` (ID khảo sát).
 * @param {Object} res - Response stream file Excel (`.xlsx`).
 * 
 * @function exportParticipationsPDF
 * @description Xuất danh sách các báo cáo minh chứng ngoại khóa đã được duyệt (`status = 'Approved'`) ra file PDF.
 * @param {Object} req - Request object.
 * @param {Object} res - Response stream file PDF (`.pdf`).
 * 
 * @implementation
 * - `exportSurveyExcel`: Sử dụng `ExcelJS` tạo danh sách cột tương ứng với các câu hỏi và điền câu trả lời của từng tài khoản.
 * - `exportParticipationsPDF`: Sử dụng `pdfkit` đăng ký font Roboto (hỗ trợ tiếng Việt Unicode) và ghi nội dung chi tiết bài nộp.
 * 
 * @relations
 * - Routes: `GET /api/export/surveys/:id/excel` và `GET /api/export/participations/pdf` trong `exportRoutes.js`.
 * - Guard: `authenticate`, `authorize('Admin', 'Staff')`.
 * - Frontend: `exportService.js` gọi từ `SurveyAnalytics.jsx` và `ParticipationReview.jsx`.
 */
const path = require('path');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Survey, SurveyResponse, SurveyAnswer, Question, User, Participation, ParticipationFile } = require('../models');
const logger = require('../utils/logger');

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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Survey Results');

    const headers = ['#', 'Full Name', 'Username', 'ID', 'Role', 'Submitted At',
      ...survey.questions.map((q, i) => `Q${i + 1}: ${q.question_text.substring(0, 50)}`)];
    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a7f4b' } };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

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

    const fontRegularPath = path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf');
    const fontBoldPath = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');
    const fontItalicPath = path.join(__dirname, '../assets/fonts/Roboto-Italic.ttf');

    doc.registerFont('Roboto', fontRegularPath);
    doc.registerFont('Roboto-Bold', fontBoldPath);
    doc.registerFont('Roboto-Italic', fontItalicPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="approved_participations.pdf"');
    doc.pipe(res);

    doc.font('Roboto-Bold').fontSize(18).fillColor('#1a7f4b').text('EcoSurvey — Báo cáo hoạt động đã duyệt', { align: 'center' });
    doc.font('Roboto').fontSize(10).fillColor('#666').text(`Xuất bản: ${new Date().toLocaleString('vi-VN')}`, { align: 'center' });
    doc.moveDown(1.5);

    participations.forEach((p, idx) => {
      doc.font('Roboto-Bold').fontSize(12).fillColor('#1a7f4b').text(`${idx + 1}. ${p.event_name}`);
      doc.font('Roboto').fontSize(9).fillColor('#333')
        .text(`Người nộp: ${p.user?.full_name || ''} (${p.user?.username || ''}) — ${p.user?.role || ''}`)
        .text(`Địa điểm: ${p.location || ''}  |  Số người tham gia: ${p.participant_count || 0}`)
        .text(`Ngày nộp: ${p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : ''}`)
        .text(`Người duyệt: ${p.reviewer?.full_name || 'Admin'}  |  Ngày duyệt: ${p.reviewed_at ? new Date(p.reviewed_at).toLocaleDateString('vi-VN') : '—'}`)
        .moveDown(0.5)
        .text(p.description || '', { indent: 20 });
      if (p.ai_summary) {
        doc.font('Roboto-Italic').fillColor('#555').text(`Tóm tắt AI: ${p.ai_summary}`, { indent: 20 });
      }
      doc.moveDown(1).strokeColor('#ccc').moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(0.5);
    });

    doc.end();
  } catch (err) {
    logger.error('exportParticipationsPDF error:', err);
    res.status(500).json({ message: 'Failed to export participations.' });
  }
};
