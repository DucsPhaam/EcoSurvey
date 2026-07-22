'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM surveys');
    if (results[0].count === 0) {
      const sqlToRun = `INSERT INTO \`surveys\` VALUES
(1, 'Khảo sát Nhận thức Bảo vệ Môi trường 2025',
    'Khảo sát nhằm đánh giá mức độ nhận thức của sinh viên về các vấn đề môi trường hiện nay, bao gồm biến đổi khí hậu, ô nhiễm nhựa và tiết kiệm năng lượng.',
    'Student', '2026-07-07 19:15:15', '2026-08-12 19:15:15', 'Published', 1, '2026-07-07 19:15:15', '2026-07-07 19:15:15'),
(2, 'Khảo sát Hoạt động Xanh trong Khuôn viên Trường',
    'Khảo sát dành cho toàn thể cán bộ, giảng viên và sinh viên về mức độ tham gia các hoạt động xanh, sử dụng túi vải, phân loại rác tại nguồn.',
    'All', '2026-07-07 19:15:15', '2026-07-27 19:15:15', 'Published', 1, '2026-07-07 19:15:15', '2026-07-07 19:15:15'),
(3, 'Khảo sát Nội bộ - Tiết kiệm Điện tại Văn phòng',
    'Khảo sát dành riêng cho cán bộ nhân viên về thói quen sử dụng điện và đề xuất cải tiến.',
    'Staff', '2026-07-14 19:15:15', '2026-08-17 19:15:15', 'Draft', 1, '2026-07-07 19:15:15', '2026-07-07 19:15:15'),
(4, 'Khảo sát Thói quen sử dụng giấy tại Văn phòng',
    'Đánh giá việc in ấn và sử dụng giấy nháp của cán bộ nhân viên để lên phương án số hóa.',
    'Staff', '2026-05-14 20:17:35', '2026-06-13 20:17:35', 'Closed', 1, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
(5, 'Khảo sát Giao thông Xanh đến Trường',
    'Bạn di chuyển đến trường bằng phương tiện gì? Hãy chia sẻ để trường bố trí thêm trạm xe đạp/xe buýt.',
    'All', '2026-07-07 20:17:35', '2026-07-23 20:17:35', 'Published', 1, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
(6, 'Khảo sát Căng tin & Chất lượng Bữa ăn',
    'Lấy ý kiến phản hồi về chất lượng đồ ăn và vấn đề sử dụng đồ nhựa tại căng tin.',
    'All', '2026-07-07 20:17:35', '2026-07-28 20:17:35', 'Published', 1, '2026-07-07 20:17:35', '2026-07-07 20:17:35');

-- ─────────────────────────────────────────────────────────────
-- questions
-- ─────────────────────────────────────────────────────────────
INSERT INTO \`questions\` VALUES
(1,  1, 'Bạn hiểu biết về vấn đề biến đổi khí hậu ở mức nào?',                               'Single_Choice',   '["Rất hiểu biết","Hiểu biết cơ bản","Biết một chút","Chưa hiểu nhiều"]', 1, 1, '2026-07-07 19:15:15'),
(2,  1, 'Bạn thường thực hiện những hành động nào để bảo vệ môi trường?',                     'Multiple_Choice', '["Phân loại rác tại nhà","Sử dụng túi vải thay túi nhựa","Tiết kiệm điện nước","Sử dụng phương tiện công cộng","Hạn chế dùng đồ nhựa một lần","Trồng cây xanh"]', 2, 1, '2026-07-07 19:15:15'),
(3,  1, 'Theo bạn, vấn đề môi trường nào đáng lo ngại nhất hiện nay tại Việt Nam?',           'Single_Choice',   '["Ô nhiễm không khí","Ô nhiễm nguồn nước","Rác thải nhựa","Phá rừng","Biến đổi khí hậu"]', 3, 1, '2026-07-07 19:15:15'),
(4,  1, 'Bạn đã từng tham gia hoạt động tình nguyện bảo vệ môi trường chưa?',                 'Single_Choice',   '["Có, nhiều lần","Có, một vài lần","Chưa nhưng có kế hoạch","Chưa và không có kế hoạch"]', 4, 1, '2026-07-07 19:15:15'),
(5,  1, 'Theo bạn, nhà trường có thể làm gì để nâng cao ý thức bảo vệ môi trường trong sinh viên? (Nêu ý kiến cá nhân)', 'Text', NULL, 5, 0, '2026-07-07 19:15:15'),
(6,  2, 'Bạn có sử dụng túi vải/hộp cơm cá nhân thay thế đồ nhựa dùng một lần không?',       'Single_Choice',   '["Luôn luôn","Thường xuyên","Thỉnh thoảng","Hiếm khi","Không bao giờ"]', 1, 1, '2026-07-07 19:15:15'),
(7,  2, 'Bạn có thực hiện phân loại rác tại nguồn không?',                                    'Single_Choice',   '["Có, thường xuyên","Thỉnh thoảng","Chưa biết cách phân loại","Không"]', 2, 1, '2026-07-07 19:15:15'),
(8,  2, 'Bạn đã tham gia những hoạt động xanh nào trong khuôn viên trường?',                  'Multiple_Choice', '["Ngày hội Môi trường","Chiến dịch Nhặt rác","Trồng cây xanh","Cuộc thi tìm hiểu môi trường","Chưa tham gia hoạt động nào"]', 3, 1, '2026-07-07 19:15:15'),
(9,  2, 'Ý kiến của bạn về các hoạt động xanh của nhà trường?',                               'Text',            NULL, 4, 0, '2026-07-07 19:15:15'),
(10, 4, 'Trung bình một tuần bạn in bao nhiêu trang giấy?',                                   'Single_Choice',   '["Dưới 50 trang","50 - 100 trang","100 - 500 trang","Trên 500 trang"]', 1, 1, '2026-07-07 20:17:35'),
(11, 4, 'Bạn có thói quen sử dụng lại giấy in một mặt không?',                                'Single_Choice',   '["Luôn luôn","Thỉnh thoảng","Không bao giờ"]', 2, 1, '2026-07-07 20:17:35'),
(12, 4, 'Góp ý để giảm thiểu lượng giấy in tại phòng ban của bạn:',                           'Text',            NULL, 3, 0, '2026-07-07 20:17:35'),
(13, 5, 'Phương tiện di chuyển chính của bạn đến trường là gì?',                               'Single_Choice',   '["Xe máy cá nhân","Xe buýt","Xe đạp / Xe đạp điện","Đi bộ","Ô tô cá nhân","Xe công nghệ (Grab, Be...)"]', 1, 1, '2026-07-07 20:17:35'),
(14, 5, 'Quãng đường từ nhà đến trường của bạn dài khoảng bao nhiêu km?',                     'Single_Choice',   '["Dưới 2km","2 - 5km","5 - 10km","Trên 10km"]', 2, 1, '2026-07-07 20:17:35'),
(15, 5, 'Nếu trường cung cấp trạm sạc xe điện miễn phí, bạn có định chuyển sang dùng xe điện không?', 'Single_Choice', '["Chắc chắn có","Sẽ cân nhắc","Không có ý định đổi"]', 3, 1, '2026-07-07 20:17:35'),
(16, 6, 'Bạn đánh giá thế nào về chất lượng đồ ăn tại căng tin?',                             'Single_Choice',   '["Rất ngon","Khá ngon","Bình thường","Tệ"]', 1, 1, '2026-07-07 20:17:35'),
(17, 6, 'Theo bạn, căng tin đã hạn chế việc sử dụng đồ nhựa dùng một lần tốt chưa?',         'Single_Choice',   '["Rất tốt","Đã có cải thiện nhưng chưa nhiều","Chưa tốt, vẫn dùng rất nhiều đồ nhựa"]', 2, 1, '2026-07-07 20:17:35'),
(18, 6, 'Bạn mong muốn căng tin thay đổi điều gì nhất để thân thiện với môi trường hơn?',    'Multiple_Choice', '["Không dùng hộp xốp","Sử dụng ống hút giấy/gạo","Khuyến khích mang hộp đựng cá nhân","Bán đồ ăn chay"]', 3, 1, '2026-07-07 20:17:35'),
(19, 6, 'Góp ý thêm của bạn:',                                                                 'Text',            NULL, 4, 0, '2026-07-07 20:17:35');

-- ─────────────────────────────────────────────────────────────
-- survey_responses
-- ─────────────────────────────────────────────────────────────
INSERT INTO \`survey_responses\` VALUES
(1,  1, 2,  '2026-07-13 10:17:35', NULL),
(2,  4, 5,  '2026-06-03 20:17:35', NULL),
(3,  5, 5,  '2026-07-13 14:17:35', NULL),
(4,  1, 7,  '2026-07-11 15:17:35', NULL),
(5,  6, 7,  '2026-07-12 10:17:35', NULL),
(6,  1, 8,  '2026-07-08 20:17:35', NULL),
(7,  2, 8,  '2026-07-09 14:17:35', NULL),
(8,  5, 8,  '2026-07-13 08:17:35', NULL),
(9,  4, 13, '2026-05-29 20:17:35', NULL),
(10, 5, 13, '2026-07-12 14:17:35', NULL),
(11, 6, 13, '2026-07-13 09:17:35', NULL),
(12, 1, 14, '2026-07-07 20:17:35', NULL),
(13, 5, 14, '2026-07-10 15:17:35', NULL),
(14, 6, 14, '2026-07-12 20:17:35', NULL);

-- ─────────────────────────────────────────────────────────────
-- survey_answers
-- ─────────────────────────────────────────────────────────────
INSERT INTO \`survey_answers\` VALUES
(1,  1,  1,  'Hiểu biết cơ bản'),
(2,  1,  2,  '["Phân loại rác tại nhà","Tiết kiệm điện nước"]'),
(3,  1,  3,  'Rác thải nhựa'),
(4,  1,  4,  'Có, một vài lần'),
(5,  1,  5,  'Trường nên tổ chức thêm các cuộc thi tái chế.'),
(6,  2,  10, '50 - 100 trang'),
(7,  2,  11, 'Luôn luôn'),
(8,  2,  12, 'Sử dụng e-Office để trình ký văn bản thay vì ký giấy.'),
(9,  3,  13, 'Xe buýt'),
(10, 3,  14, '5 - 10km'),
(11, 3,  15, 'Sẽ cân nhắc'),
(12, 4,  1,  'Rất hiểu biết'),
(13, 4,  2,  '["Sử dụng phương tiện công cộng","Sử dụng túi vải thay túi nhựa"]'),
(14, 4,  3,  'Ô nhiễm không khí'),
(15, 4,  4,  'Chưa nhưng có kế hoạch'),
(16, 4,  5,  'Trường nên đưa bộ môn Giáo dục Môi trường vào bắt buộc.'),
(17, 5,  16, 'Bình thường'),
(18, 5,  17, 'Chưa tốt, vẫn dùng rất nhiều đồ nhựa'),
(19, 5,  18, '["Không dùng hộp xốp","Sử dụng ống hút giấy/gạo"]'),
(20, 5,  19, 'Hộp xốp được phát quá nhiều mỗi khi mua mang đi.'),
(21, 6,  1,  'Biết một chút'),
(22, 6,  2,  '["Hạn chế dùng đồ nhựa một lần"]'),
(23, 6,  3,  'Rác thải nhựa'),
(24, 6,  4,  'Chưa và không có kế hoạch'),
(25, 8,  13, 'Xe máy cá nhân'),
(26, 8,  14, '5 - 10km'),
(27, 8,  15, 'Không có ý định đổi'),
(28, 10, 13, 'Ô tô cá nhân'),
(29, 10, 14, 'Trên 10km'),
(30, 10, 15, 'Sẽ cân nhắc'),
(31, 11, 16, 'Khá ngon'),
(32, 11, 17, 'Đã có cải thiện nhưng chưa nhiều'),
(33, 11, 18, '["Khuyến khích mang hộp đựng cá nhân"]'),
(34, 11, 19, 'Nên có khu vực rửa khay/hộp riêng cho sinh viên và cán bộ mang hộp cá nhân.'),
(35, 12, 1,  'Rất hiểu biết'),
(36, 12, 2,  '["Phân loại rác tại nhà","Tiết kiệm điện nước","Trồng cây xanh"]'),
(37, 12, 3,  'Biến đổi khí hậu'),
(38, 12, 4,  'Có, nhiều lần'),
(39, 12, 5,  'Cần có chế tài nghiêm ngặt hơn.'),
(40, 13, 13, 'Đi bộ'),
(41, 13, 14, 'Dưới 2km'),
(42, 13, 15, 'Chắc chắn có'),
(43, 14, 16, 'Rất ngon'),
(44, 14, 17, 'Rất tốt'),
(45, 14, 18, '["Bán đồ ăn chay"]'),
(46, 14, 19, 'Thực đơn món chay rất tuyệt vời.');

-- ─────────────────────────────────────────────────────────────
-- participations
-- ─────────────────────────────────────────────────────────────
INSERT INTO \`participations\` VALUES
(1, 2, 'Chiến dịch dọn rác bãi biển',      'Bãi biển Đồ Sơn',  50,  'Tham gia nhặt rác nhựa dọc bờ biển cùng CLB Môi Trường trong 3 tiếng.',       'Approved', NULL, NULL,             1, '2026-07-12 20:17:35', '2026-07-11 20:17:35', '2026-07-13 10:17:35'),
(2, 2, 'Tọa đàm lối sống Zero Waste',       'Hội trường A',     200, 'Nghe diễn giả chia sẻ về lối sống không rác thải.',                           'Pending',  NULL, NULL,             NULL, NULL,                '2026-07-13 09:17:35', '2026-07-13 10:17:35'),
(3, 5, 'Trồng cây đầu xuân',                'Khuôn viên trường',30,  'Trồng 50 cây xanh quanh khu vực nhà xe cán bộ.',                              'Approved', NULL, NULL,             1, '2026-07-03 20:17:35', '2026-07-02 20:17:35', '2026-07-07 20:17:35'),
(4, 2, 'Thu gom pin cũ',                    'Sảnh nhà C',       0,   'Gửi ảnh nộp pin cũ nhưng ảnh mờ, không rõ ràng.',                             'Rejected', NULL, 'Hình ảnh minh chứng quá mờ, không xác định được nội dung. Vui lòng chụp lại.', 1, '2026-07-13 08:17:35', '2026-07-12 17:17:35', '2026-07-13 10:17:35');

-- ─────────────────────────────────────────────────────────────
-- participation_files
-- ─────────────────────────────────────────────────────────────
INSERT INTO \`participation_files\` VALUES
(1, 1, '/uploads/don_rac_1.jpg',      'don_rac_1.jpg',       'image/jpeg', 1024000, '2026-07-11 20:17:35'),
(2, 1, '/uploads/don_rac_2.jpg',      'don_rac_2.jpg',       'image/jpeg', 2048000, '2026-07-11 20:17:35'),
(3, 2, '/uploads/toadam_checkin.png', 'toadam_checkin.png',  'image/png',  512000,  '2026-07-13 09:17:35'),
(4, 3, '/uploads/trong_cay.jpg',      'trong_cay.jpg',       'image/jpeg', 3072000, '2026-07-02 20:17:35'),
(5, 4, '/uploads/pin_cu_mo.jpg',      'pin_cu_mo.jpg',       'image/jpeg', 150000,  '2026-07-12 17:17:35');

-- ─────────────────────────────────────────────────────────────
-- point_logs
-- ─────────────────────────────────────────────────────────────
INSERT INTO \`point_logs\` VALUES
(1,  2,  'Survey_Completion', 10, 1,  'survey_responses', 'Hoàn thành Khảo sát Nhận thức Bảo vệ Môi trường 2025', '2026-07-13 10:17:35'),
(2,  2,  'Event_Report',      50, 1,  'participations',   'Duyệt báo cáo: Chiến dịch dọn rác bãi biển',           '2026-07-12 20:17:35'),
(3,  2,  'Bonus',             20, NULL, NULL,              'Thưởng thành viên tích cực tháng trước',               '2026-07-11 15:17:35'),
(4,  5,  'Survey_Completion', 10, 2,  'survey_responses', 'Hoàn thành Khảo sát Thói quen sử dụng giấy',           '2026-06-03 20:17:35'),
(5,  5,  'Event_Report',      50, 3,  'participations',   'Duyệt báo cáo: Trồng cây đầu xuân',                    '2026-07-03 20:17:35'),
(6,  5,  'Survey_Completion', 10, 3,  'survey_responses', 'Hoàn thành Khảo sát Giao thông Xanh',                  '2026-07-13 14:17:35'),
(7,  7,  'Survey_Completion', 10, 4,  'survey_responses', 'Hoàn thành Khảo sát 1',                                '2026-07-11 15:17:35'),
(8,  7,  'Survey_Completion', 10, 5,  'survey_responses', 'Hoàn thành Khảo sát 6',                                '2026-07-12 10:17:35'),
(9,  8,  'Survey_Completion', 10, 6,  'survey_responses', 'Hoàn thành Khảo sát 1',                                '2026-07-08 20:17:35'),
(10, 8,  'Survey_Completion', 10, 7,  'survey_responses', 'Hoàn thành Khảo sát 2',                                '2026-07-09 14:17:35'),
(11, 8,  'Survey_Completion', 10, 8,  'survey_responses', 'Hoàn thành Khảo sát 5',                                '2026-07-13 08:17:35'),
(12, 13, 'Survey_Completion', 10, 9,  'survey_responses', 'Hoàn thành Khảo sát 4',                                '2026-05-29 20:17:35'),
(13, 13, 'Survey_Completion', 10, 10, 'survey_responses', 'Hoàn thành Khảo sát 5',                                '2026-07-12 14:17:35'),
(14, 13, 'Survey_Completion', 10, 11, 'survey_responses', 'Hoàn thành Khảo sát 6',                                '2026-07-13 09:17:35'),
(15, 14, 'Survey_Completion', 10, 12, 'survey_responses', 'Hoàn thành Khảo sát 1',                                '2026-07-07 20:17:35'),
(16, 14, 'Survey_Completion', 10, 13, 'survey_responses', 'Hoàn thành Khảo sát 5',                                '2026-07-10 15:17:35'),
(17, 14, 'Survey_Completion', 10, 14, 'survey_responses', 'Hoàn thành Khảo sát 6',                                '2026-07-12 20:17:35');

-- ─────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────
`;
      const statements = sqlToRun.split(';');
      for (const statement of statements) {
        if (statement.trim()) {
           await queryInterface.sequelize.query(statement.trim());
        }
      }
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('survey_answers', null, {});
    await queryInterface.bulkDelete('survey_responses', null, {});
    await queryInterface.bulkDelete('questions', null, {});
    await queryInterface.bulkDelete('surveys', null, {});
    await queryInterface.bulkDelete('participation_files', null, {});
    await queryInterface.bulkDelete('participations', null, {});
    await queryInterface.bulkDelete('point_logs', null, {});
  }
};
