// Export controller: Exports survey results to Excel (.xlsx), approved proof reports to PDF, and Admin Dashboard statistics to PDF.
const path = require('path');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Op, fn, col } = require('sequelize');
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

exports.exportDashboardPDF = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000);

    const [
      totalUsers,
      usersByRole,
      usersByStatus,
      totalSurveys,
      surveysByStatus,
      recentResponses,
      pendingParticipations,
      chartData,
    ] = await Promise.all([
      User.count(),
      User.findAll({ attributes: ['role', [fn('COUNT', col('id')), 'count']], group: ['role'], raw: true }),
      User.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
      Survey.count(),
      Survey.findAll({ attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
      SurveyResponse.count({ where: { submitted_at: { [Op.gte]: sevenDaysAgo } } }),
      Participation.count({ where: { status: 'Pending' } }),
      SurveyResponse.findAll({
        attributes: [
          [fn('DATE', col('submitted_at')), 'date'],
          [fn('COUNT', col('id')), 'count'],
        ],
        where: { submitted_at: { [Op.gte]: sevenDaysAgo } },
        group: [fn('DATE', col('submitted_at'))],
        order: [[fn('DATE', col('submitted_at')), 'ASC']],
        raw: true,
      }),
    ]);

    const doc = new PDFDocument({ margin: 50 });

    const fontRegularPath = path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf');
    const fontBoldPath = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');
    const fontItalicPath = path.join(__dirname, '../assets/fonts/Roboto-Italic.ttf');

    doc.registerFont('Roboto', fontRegularPath);
    doc.registerFont('Roboto-Bold', fontBoldPath);
    doc.registerFont('Roboto-Italic', fontItalicPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="admin_dashboard_report.pdf"');
    doc.pipe(res);

    // Title
    doc.font('Roboto-Bold').fontSize(18).fillColor('#1a7f4b').text('EcoSurvey — Báo cáo Thống kê Tổng quan Hệ thống', { align: 'center' });
    doc.font('Roboto').fontSize(10).fillColor('#666').text(`Thời gian xuất: ${new Date().toLocaleString('vi-VN')}`, { align: 'center' });
    doc.moveDown(1.5);

    const drawTable = (headers, rows, startX = 50, colWidths = [300, 195]) => {
      let currentY = doc.y;
      
      // Header row
      doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), 22).fill('#1a7f4b');
      doc.font('Roboto-Bold').fontSize(10).fillColor('#ffffff');
      
      let xOffset = startX + 5;
      headers.forEach((h, i) => {
        doc.text(h, xOffset, currentY + 6, { width: colWidths[i] - 10, align: i === 0 ? 'left' : 'center' });
        xOffset += colWidths[i];
      });
      
      currentY += 22;
      
      // Rows
      rows.forEach((row, rIdx) => {
        const bg = rIdx % 2 === 0 ? '#f4f9f5' : '#ffffff';
        doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), 20).fill(bg);
        doc.font('Roboto').fontSize(10).fillColor('#333333');
        
        let rX = startX + 5;
        row.forEach((cell, cIdx) => {
          doc.text(String(cell), rX, currentY + 5, { width: colWidths[cIdx] - 10, align: cIdx === 0 ? 'left' : 'center' });
          rX += colWidths[cIdx];
        });
        currentY += 20;
      });
      doc.y = currentY + 15;
    };

    // 1. System Overview Metrics
    doc.font('Roboto-Bold').fontSize(12).fillColor('#1a7f4b').text('1. CHỈ SỐ TỔNG QUAN HỆ THỐNG');
    doc.moveDown(0.4);

    const overviewData = [
      ['Tổng số người dùng đăng ký', `${totalUsers} người`],
      ['Tổng số bài khảo sát', `${totalSurveys} khảo sát`],
      ['Số phản hồi khảo sát 7 ngày gần nhất', `${recentResponses} lượt`],
      ['Báo cáo minh chứng hoạt động chờ duyệt', `${pendingParticipations} báo cáo`],
    ];

    drawTable(['Chỉ số hệ thống', 'Giá trị ghi nhận'], overviewData, 50, [310, 185]);

    // 2. User Statistics Table
    doc.font('Roboto-Bold').fontSize(12).fillColor('#1a7f4b').text('2. PHÂN BỔ NGƯỜI DÙNG THEO VAI TRÒ & TRẠNG THÁI');
    doc.moveDown(0.4);

    const userStatsData = [];
    usersByRole.forEach((r) => {
      const pct = totalUsers > 0 ? ((parseInt(r.count) / totalUsers) * 100).toFixed(1) : '0';
      userStatsData.push([`Vai trò: ${r.role}`, `${r.count} người`, `${pct}%`]);
    });
    usersByStatus.forEach((s) => {
      const pct = totalUsers > 0 ? ((parseInt(s.count) / totalUsers) * 100).toFixed(1) : '0';
      userStatsData.push([`Trạng thái: ${s.status}`, `${s.count} người`, `${pct}%`]);
    });

    drawTable(['Phân loại Người dùng', 'Số lượng', 'Tỷ lệ (%)'], userStatsData, 50, [230, 140, 125]);

    // 3. Survey Statistics Table
    doc.font('Roboto-Bold').fontSize(12).fillColor('#1a7f4b').text('3. PHÂN BỔ KHẢO SÁT THEO TRẠNG THÁI');
    doc.moveDown(0.4);

    const surveyStatsData = [];
    surveysByStatus.forEach((s) => {
      const pct = totalSurveys > 0 ? ((parseInt(s.count) / totalSurveys) * 100).toFixed(1) : '0';
      surveyStatsData.push([`Trạng thái: ${s.status}`, `${s.count} khảo sát`, `${pct}%`]);
    });

    drawTable(['Trạng thái Khảo sát', 'Số lượng', 'Tỷ lệ (%)'], surveyStatsData, 50, [230, 140, 125]);

    // 4. Daily Response Trend
    if (chartData && chartData.length > 0) {
      doc.font('Roboto-Bold').fontSize(12).fillColor('#1a7f4b').text('4. LƯỢT HOÀN THÀNH KHẢO SÁT 7 NGÀY GẦN NHẤT');
      doc.moveDown(0.4);

      const dailyData = chartData.map((d) => [
        new Date(d.date).toLocaleDateString('vi-VN'),
        `${d.count} lượt`,
      ]);

      drawTable(['Ngày ghi nhận', 'Số lượt phản hồi'], dailyData, 50, [310, 185]);
    }

    doc.end();
  } catch (err) {
    logger.error('exportDashboardPDF error:', err);
    res.status(500).json({ message: 'Failed to export admin dashboard PDF.' });
  }
};

