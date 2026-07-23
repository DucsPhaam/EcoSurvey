-- =====================================================================
-- EcoSurvey — Test Data Seed Script
-- Chạy SAU init.sql để thêm dữ liệu test phong phú hơn
-- Sử dụng: SOURCE test_data.sql;
-- =====================================================================

USE `ecosurvey`;

-- ─────────────────────────────────────────────────────────────────
-- THÊM NHIỀU USERS HƠN (16-30)
-- Password: Admin@123
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `users` (`id`, `full_name`, `username`, `email`, `password_hash`, `role`, `status`, `student_staff_id`, `class_name`, `department`, `joined_date`, `ui_theme`, `created_at`, `updated_at`) VALUES
(16, 'Trần Minh Đức',      'tm_duc',      'duc.tm@student.ecosurvey.edu.vn',    '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023010', 'IT3',  'Khoa CNTT',               '2023-09-07', 'light', '2026-07-10 08:00:00', '2026-07-10 08:00:00'),
(17, 'Nguyễn Hoài Linh',   'nh_linh',     'linh.nh@student.ecosurvey.edu.vn',   '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023011', 'KT1',  'Khoa Kinh tế',            '2023-09-08', 'light', '2026-07-10 08:30:00', '2026-07-10 08:30:00'),
(18, 'Lê Phương Mai',      'lp_mai',      'mai.lp@student.ecosurvey.edu.vn',   '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023012', 'MT2',  'Khoa Môi trường',         '2023-09-09', 'light', '2026-07-10 09:00:00', '2026-07-10 09:00:00'),
(19, 'Võ Anh Tuấn',        'va_tuan',     'tuan.va@student.ecosurvey.edu.vn',   '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023013', 'NN1',  'Khoa Ngoại ngữ',          '2023-09-10', 'light', '2026-07-10 09:30:00', '2026-07-10 09:30:00'),
(20, 'Trịnh Thị Hương',    'tt_huong',    'huong.tt@student.ecosurvey.edu.vn',   '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023014', 'KT2',  'Khoa Kinh tế',            '2023-09-11', 'light', '2026-07-10 10:00:00', '2026-07-10 10:00:00'),
(21, 'Bùi Đình Nam',        'bd_nam',      'nam.bd@student.ecosurvey.edu.vn',    '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Pending',  'SV2023015', 'IT1',  'Khoa CNTT',               '2023-09-12', 'light', '2026-07-10 10:30:00', '2026-07-10 10:30:00'),
(22, 'Đào Thu Phương',     'dt_phuong',   'phuong.dt@student.ecosurvey.edu.vn', '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023016', 'MT1',  'Khoa Môi trường',         '2023-09-13', 'light', '2026-07-10 11:00:00', '2026-07-10 11:00:00'),
(23, 'Hoàng Gia Bảo',      'hg_bao',      'bao.hg@student.ecosurvey.edu.vn',     '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023017', 'IT2',  'Khoa CNTT',               '2023-09-14', 'light', '2026-07-10 11:30:00', '2026-07-10 11:30:00'),
(24, 'Phan Thị Lan',       'pt_lan',      'lan.pt@student.ecosurvey.edu.vn',     '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023018', 'NN2',  'Khoa Ngoại ngữ',          '2023-09-15', 'light', '2026-07-10 12:00:00', '2026-07-10 12:00:00'),
(25, 'Ngô Văn Sơn',        'nv_son',      'son.nv@student.ecosurvey.edu.vn',     '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023019', 'KT3',  'Khoa Kinh tế',            '2023-09-16', 'light', '2026-07-10 12:30:00', '2026-07-10 12:30:00'),
(26, 'Trương Minh Hiếu',   'tm_hieu',     'hieu.tm@student.ecosurvey.edu.vn',    '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023020', 'IT1',  'Khoa CNTT',               '2023-09-17', 'light', '2026-07-10 13:00:00', '2026-07-10 13:00:00'),
(27, 'Lý Thanh Hà',        'lt_ha',       'ha.lt@ecosurvey.edu.vn',              '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Staff',   'Approved', 'CB006',     NULL,   'Phòng Kế hoạch',         '2020-03-01', 'light', '2026-07-10 13:30:00', '2026-07-10 13:30:00'),
(28, 'Vũ Thị Mai',         'vt_mai',      'mai.vt@ecosurvey.edu.vn',             '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Staff',   'Approved', 'CB007',     NULL,   'Phòng Hành chính',        '2019-07-15', 'light', '2026-07-10 14:00:00', '2026-07-10 14:00:00'),
(29, 'Đặng Đức Anh',       'dd_anh',      'anh.dd@student.ecosurvey.edu.vn',     '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Student', 'Approved', 'SV2023021', 'MT2',  'Khoa Môi trường',         '2023-09-18', 'light', '2026-07-10 14:30:00', '2026-07-10 14:30:00'),
(30, 'Nguyễn Thị Ngọc',   'nt_ngoc',     'ngoc.nt@ecosurvey.edu.vn',            '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a', 'Staff',   'Approved', 'CB008',     NULL,   'Khoa Môi trường',         '2021-09-01', 'light', '2026-07-10 15:00:00', '2026-07-10 15:00:00');

-- ─────────────────────────────────────────────────────────────────
-- THÊM SURVEY MỚI (7-10)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `surveys` (`id`, `title`, `description`, `target_role`, `start_date`, `end_date`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(7, 'Khảo sát Sử dụng Năng lượng Tái tạo',
    'Đánh giá mức độ quan tâm và sẵn sàng sử dụng năng lượng mặt trời, gió trong sinh viên và cán bộ.',
    'All', '2026-07-10 09:00:00', '2026-08-10 09:00:00', 'Published', 1, '2026-07-10 09:00:00', '2026-07-10 09:00:00'),
(8, 'Khảo sát Ý kiến về Chính sách Xanh của Trường',
    'Thu thập ý kiến về các chính sách môi trường mà trường đã và đang triển khai.',
    'All', '2026-07-10 10:00:00', '2026-08-15 10:00:00', 'Published', 1, '2026-07-10 10:00:00', '2026-07-10 10:00:00'),
(9, 'Khảo sát Rác thải Nhựa trong Sinh viên',
    'Tìm hiểu thói quen sử dụng nhựa dùng một lần của sinh viên.',
    'Student', '2026-07-10 11:00:00', '2026-08-20 11:00:00', 'Published', 1, '2026-07-10 11:00:00', '2026-07-10 11:00:00'),
(10, 'Khảo sát Tiện ích Xanh trong Khuôn viên',
    'Đánh giá nhu cầu về các tiện ích xanh như trạm sạc xe điện, vườn trên mái.',
    'All', '2026-07-10 12:00:00', '2026-08-25 12:00:00', 'Draft', 1, '2026-07-10 12:00:00', '2026-07-10 12:00:00');

-- ─────────────────────────────────────────────────────────────────
-- THÊM QUESTIONS CHO SURVEY MỚI (20-35)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `questions` VALUES
-- Survey 7: Năng lượng tái tạo
(20, 7, 'Bạn có quan tâm đến việc sử dụng năng lượng tái tạo không?', 'Single_Choice', '["Rất quan tâm","Quan tâm","Bình thường","Không quan tâm"]', 1, 1, '2026-07-10 09:00:00'),
(21, 7, 'Bạn đã bao giờ sử dụng thiết bị chạy bằng năng lượng mặt trời chưa?', 'Single_Choice', '["Thường xuyên","Đôi khi","Chưa bao giờ"]', 2, 1, '2026-07-10 09:00:00'),
(22, 7, 'Theo bạn, trường học nên đầu tư vào loại năng lượng tái tạo nào?', 'Multiple_Choice', '["Năng lượng mặt trời","Năng lượng gió","Năng lượng sinh khối","Tất cả các loại trên"]', 3, 0, '2026-07-10 09:00:00'),

-- Survey 8: Chính sách xanh
(23, 8, 'Bạn đánh giá thế nào về các chính sách xanh hiện tại của trường?', 'Single_Choice', '["Rất tốt","Tốt","Bình thường","Chưa tốt"]', 1, 1, '2026-07-10 10:00:00'),
(24, 8, 'Bạn muốn trường thêm chính sách nào?', 'Multiple_Choice', '["Cấm nhựa trong khuôn viên","Giảm giấy in","Tăng cây xanh","Xe điện miễn phí"]', 2, 1, '2026-07-10 10:00:00'),
(25, 8, 'Bạn có sẵn sàng tuân thủ chính sách cấm nhựa không?', 'Single_Choice', '["Hoàn toàn sẵn sàng","Sẵn sàng với điều kiện nhất định","Không sẵn sàng"]', 3, 1, '2026-07-10 10:00:00'),

-- Survey 9: Rác thải nhựa
(26, 9, 'Trung bình bạn sử dụng bao nhiêu túi nhựa mỗi tuần?', 'Single_Choice', '["Dưới 5 cái","5-10 cái","10-20 cái","Trên 20 cái"]', 1, 1, '2026-07-10 11:00:00'),
(27, 9, 'Bạn có mang túi vải/khay cơm khi đi mua đồ ăn không?', 'Single_Choice', '["Luôn luôn","Thỉnh thoảng","Không"]', 2, 1, '2026-07-10 11:00:00'),
(28, 9, 'Theo bạn, giải pháp nào hiệu quả nhất để giảm rác thải nhựa?', 'Text', NULL, 3, 0, '2026-07-10 11:00:00');

-- ─────────────────────────────────────────────────────────────────
-- THÊM SURVEY RESPONSES (15-35)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `survey_responses` VALUES
-- Survey 1 responses
(15, 1, 9,  '2026-07-14 10:00:00', NULL),
(16, 1, 10, '2026-07-14 11:00:00', NULL),
(17, 1, 11, '2026-07-14 12:00:00', NULL),
(18, 1, 16, '2026-07-14 13:00:00', NULL),
(19, 1, 17, '2026-07-14 14:00:00', NULL),
(20, 1, 18, '2026-07-14 15:00:00', NULL),

-- Survey 2 responses
(21, 2, 7,  '2026-07-10 10:00:00', NULL),
(22, 2, 10, '2026-07-10 11:00:00', NULL),
(23, 2, 11, '2026-07-10 12:00:00', NULL),
(24, 2, 16, '2026-07-10 13:00:00', NULL),

-- Survey 5 responses
(25, 5, 2,  '2026-07-14 16:00:00', NULL),
(26, 5, 7,  '2026-07-14 17:00:00', NULL),
(27, 5, 9,  '2026-07-15 08:00:00', NULL),
(28, 5, 10, '2026-07-15 09:00:00', NULL),
(29, 5, 11, '2026-07-15 10:00:00', NULL),
(30, 5, 16, '2026-07-15 11:00:00', NULL),
(31, 5, 17, '2026-07-15 12:00:00', NULL),

-- Survey 6 responses
(32, 6, 2,  '2026-07-14 18:00:00', NULL),
(33, 6, 8,  '2026-07-14 19:00:00', NULL),
(34, 6, 9,  '2026-07-14 20:00:00', NULL),

-- Survey 7 (new) responses
(35, 7, 7,  '2026-07-15 13:00:00', NULL),
(36, 7, 8,  '2026-07-15 14:00:00', NULL),
(37, 7, 9,  '2026-07-15 15:00:00', NULL),

-- Survey 8 (new) responses
(38, 8, 10, '2026-07-15 16:00:00', NULL),
(39, 8, 11, '2026-07-15 17:00:00', NULL),
(40, 8, 16, '2026-07-15 18:00:00', NULL);

-- ─────────────────────────────────────────────────────────────────
-- THÊM SURVEY ANSWERS CHO RESPONSES MỚI (47-80)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `survey_answers` VALUES
-- Response 15 (Survey 1 - User 9)
(47, 15, 1, 'Hiểu biết cơ bản'),
(48, 15, 2, '["Phân loại rác tại nhà","Sử dụng túi vải thay túi nhựa","Tiết kiệm điện nước"]'),
(49, 15, 3, 'Rác thải nhựa'),
(50, 15, 4, 'Có, một vài lần'),
(51, 15, 5, 'Nên có thêm thùng rác phân loại ở các tầng.'),

-- Response 16 (Survey 1 - User 10)
(52, 16, 1, 'Rất hiểu biết'),
(53, 16, 2, '["Trồng cây xanh","Tiết kiệm điện nước"]'),
(54, 16, 3, 'Biến đổi khí hậu'),
(55, 16, 4, 'Có, nhiều lần'),
(56, 16, 5, 'Tổ chức thêm các buổi dọn rác vào cuối tuần.'),

-- Response 17 (Survey 1 - User 11)
(57, 17, 1, 'Biết một chút'),
(58, 17, 2, '["Tiết kiệm điện nước"]'),
(59, 17, 3, 'Ô nhiễm không khí'),
(60, 17, 4, 'Chưa nhưng có kế hoạch'),
(61, 17, 5, 'Cần tuyên truyền nhiều hơn qua mạng xã hội.'),

-- Response 18 (Survey 1 - User 16)
(62, 18, 1, 'Hiểu biết cơ bản'),
(63, 18, 2, '["Sử dụng phương tiện công cộng"]'),
(64, 18, 3, 'Rác thải nhựa'),
(65, 18, 4, 'Có, một vài lần'),
(66, 18, 5, 'Nên phạt nặng hành vi xả rác bừa bãi.'),

-- Response 21 (Survey 2 - User 7)
(67, 21, 6, 'Thỉnh thoảng'),
(68, 21, 7, 'Thỉnh thoảng'),
(69, 21, 8, '["Chiến dịch Nhặt rác","Trồng cây xanh"]'),
(70, 21, 9, 'Các hoạt động khá bổ ích, cần tổ chức nhiều hơn.'),

-- Response 35 (Survey 7 - User 7)
(71, 35, 20, 'Rất quan tâm'),
(72, 35, 21, 'Đôi khi'),
(73, 35, 22, '["Năng lượng mặt trời","Tất cả các loại trên"]'),

-- Response 36 (Survey 7 - User 8)
(74, 36, 20, 'Quan tâm'),
(75, 36, 21, 'Chưa bao giờ'),
(76, 36, 22, '["Năng lượng mặt trời"]'),

-- Response 38 (Survey 8 - User 10)
(77, 38, 23, 'Tốt'),
(78, 38, 24, '["Cấm nhựa trong khuôn viên","Tăng cây xanh"]'),
(79, 38, 25, 'Hoàn toàn sẵn sàng'),

-- Response 39 (Survey 8 - User 11)
(80, 39, 23, 'Bình thường'),
(81, 39, 24, '["Giảm giấy in","Xe điện miễn phí"]'),
(82, 39, 25, 'Sẵn sàng với điều kiện nhất định');

-- ─────────────────────────────────────────────────────────────────
-- THÊM PARTICIPATIONS (5-15)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `participations` VALUES
(5, 7, 'Workshop Sống Xanh', 'Hội trường B', 150, 'Tham dự workshop về lối sống xanh và bền vững.', 'Approved', NULL, NULL, 1, '2026-07-05 10:00:00', '2026-07-04 10:00:00', '2026-07-06 10:00:00'),
(6, 8, 'Phát khẩu trang tái chế', 'Khu vực sảnh A', 0, 'Phát 200 khẩu trang tái chế cho sinh viên.', 'Approved', NULL, NULL, 1, '2026-07-08 14:00:00', '2026-07-07 14:00:00', '2026-07-09 10:00:00'),
(7, 9, 'Hướng dẫn phân loại rác', 'Khu vực canteen', 80, 'Hướng dẫn sinh viên cách phân loại rác tại nguồn.', 'Approved', NULL, NULL, 1, '2026-07-10 15:00:00', '2026-07-09 15:00:00', '2026-07-11 10:00:00'),
(8, 10, 'Thiết kế poster Môi trường', 'Online', 0, 'Thiết kế poster tuyên truyền bảo vệ môi trường.', 'Approved', NULL, NULL, 1, '2026-07-12 09:00:00', '2026-07-11 09:00:00', '2026-07-13 10:00:00'),
(9, 11, 'Dọn rác công viên', 'Công viên Thống Nhất', 40, 'Tham gia dọn rác tại công viên Thống Nhất.', 'Approved', NULL, NULL, 1, '2026-07-13 07:00:00', '2026-07-12 07:00:00', '2026-07-14 10:00:00'),
(10, 16, 'Tham gia ngày hội Xanh', 'Sân vận động trường', 300, 'Tham gia các trò chơi và hoạt động tại ngày hội Xanh.', 'Approved', NULL, NULL, 1, '2026-07-14 08:00:00', '2026-07-13 08:00:00', '2026-07-15 10:00:00'),
(11, 17, 'Chia sẻ lối sống Zero Waste', 'Facebook Group', 0, 'Chia sẻ bài viết về lối sống Zero Waste trên mạng xã hội.', 'Approved', NULL, NULL, 1, '2026-07-15 10:00:00', '2026-07-14 10:00:00', '2026-07-16 10:00:00'),
(12, 18, 'Trồng cây tại sân trường', 'Khuôn viên trường', 25, 'Trồng 25 cây bạch đàn quanh khuôn viên.', 'Pending', NULL, NULL, NULL, NULL, '2026-07-16 08:00:00', '2026-07-17 10:00:00'),
(13, 7, 'Thiết kế biển báo môi trường', 'Khuôn viên trường', 0, 'Thiết kế 5 biển báo nhắc nhở bảo vệ môi trường.', 'Approved', NULL, NULL, 1, '2026-07-17 14:00:00', '2026-07-16 14:00:00', '2026-07-18 10:00:00'),
(14, 8, 'Vẽ tranh về Môi trường', 'Hội trường A', 0, 'Tham gia cuộc thi vẽ tranh với chủ đề Bảo vệ Môi trường.', 'Approved', NULL, NULL, 1, '2026-07-18 09:00:00', '2026-07-17 09:00:00', '2026-07-19 10:00:00'),
(15, 9, 'Thu gom vỏ chai', 'Khu vực canteen', 60, 'Thu gom vỏ chai nhựa để tái chế.', 'Approved', NULL, NULL, 1, '2026-07-19 13:00:00', '2026-07-18 13:00:00', '2026-07-20 10:00:00');

-- ─────────────────────────────────────────────────────────────────
-- THÊM PARTICIPATION FILES (6-15)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `participation_files` VALUES
(6, 5, '/uploads/workshop_songxanh.jpg', 'workshop_songxanh.jpg', 'image/jpeg', 2048000, '2026-07-04 10:00:00'),
(7, 6, '/uploads/khautrang_taiche.jpg', 'khautrang_taiche.jpg', 'image/jpeg', 1024000, '2026-07-07 14:00:00'),
(8, 7, '/uploads/huongdan_phanloai.jpg', 'huongdan_phanloai.jpg', 'image/jpeg', 1536000, '2026-07-09 15:00:00'),
(9, 8, '/uploads/poster_moitruong.png', 'poster_moitruong.png', 'image/png', 512000, '2026-07-11 09:00:00'),
(10, 9, '/uploads/donrac_cong vien.jpg', 'donrac_cong vien.jpg', 'image/jpeg', 3072000, '2026-07-12 07:00:00'),
(11, 10, '/uploads/ngayhoixanh.jpg', 'ngayhoixanh.jpg', 'image/jpeg', 4096000, '2026-07-13 08:00:00'),
(12, 11, '/uploads/share_zerowaste.jpg', 'share_zerowaste.jpg', 'image/jpeg', 768000, '2026-07-14 10:00:00'),
(13, 13, '/uploads/bieubao_moitruong.jpg', 'bieubao_moitruong.jpg', 'image/jpeg', 1024000, '2026-07-16 14:00:00'),
(14, 14, '/uploads/tranh_moitruong.jpg', 'tranh_moitruong.jpg', 'image/jpeg', 2048000, '2026-07-17 09:00:00'),
(15, 15, '/uploads/thugom_vochai.jpg', 'thugom_vochai.jpg', 'image/jpeg', 1536000, '2026-07-18 13:00:00');

-- ─────────────────────────────────────────────────────────────────
-- THÊM POINT LOGS (18-50)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `point_logs` VALUES
-- User 7 points
(18, 7, 'Survey_Completion', 10, 21, 'survey_responses', 'Hoàn thành Survey 2', '2026-07-10 10:00:00'),
(19, 7, 'Event_Report', 50, 5, 'participations', 'Duyệt: Workshop Sống Xanh', '2026-07-06 10:00:00'),
(20, 7, 'Survey_Completion', 10, 35, 'survey_responses', 'Hoàn thành Survey 7', '2026-07-15 13:00:00'),
(21, 7, 'Event_Report', 50, 13, 'participations', 'Duyệt: Thiết kế biển báo', '2026-07-18 10:00:00'),

-- User 8 points
(22, 8, 'Survey_Completion', 10, 22, 'survey_responses', 'Hoàn thành Survey 2', '2026-07-10 11:00:00'),
(23, 8, 'Survey_Completion', 10, 36, 'survey_responses', 'Hoàn thành Survey 7', '2026-07-15 14:00:00'),
(24, 8, 'Event_Report', 50, 6, 'participations', 'Duyệt: Phát khẩu trang tái chế', '2026-07-09 10:00:00'),
(25, 8, 'Event_Report', 50, 14, 'participations', 'Duyệt: Vẽ tranh', '2026-07-19 10:00:00'),

-- User 9 points
(26, 9, 'Survey_Completion', 10, 15, 'survey_responses', 'Hoàn thành Survey 1', '2026-07-14 10:00:00'),
(27, 9, 'Survey_Completion', 10, 28, 'survey_responses', 'Hoàn thành Survey 5', '2026-07-15 08:00:00'),
(28, 9, 'Event_Report', 50, 7, 'participations', 'Duyệt: Hướng dẫn phân loại rác', '2026-07-11 10:00:00'),
(29, 9, 'Event_Report', 50, 15, 'participations', 'Duyệt: Thu gom vỏ chai', '2026-07-20 10:00:00'),

-- User 10 points
(30, 10, 'Survey_Completion', 10, 16, 'survey_responses', 'Hoàn thành Survey 1', '2026-07-14 11:00:00'),
(31, 10, 'Survey_Completion', 10, 23, 'survey_responses', 'Hoàn thành Survey 2', '2026-07-10 11:00:00'),
(32, 10, 'Survey_Completion', 10, 29, 'survey_responses', 'Hoàn thành Survey 5', '2026-07-15 09:00:00'),
(33, 10, 'Survey_Completion', 10, 38, 'survey_responses', 'Hoàn thành Survey 8', '2026-07-15 16:00:00'),
(34, 10, 'Event_Report', 50, 8, 'participations', 'Duyệt: Thiết kế poster', '2026-07-13 10:00:00'),

-- User 11 points
(35, 11, 'Survey_Completion', 10, 17, 'survey_responses', 'Hoàn thành Survey 1', '2026-07-14 12:00:00'),
(36, 11, 'Survey_Completion', 10, 24, 'survey_responses', 'Hoàn thành Survey 2', '2026-07-10 12:00:00'),
(37, 11, 'Survey_Completion', 10, 30, 'survey_responses', 'Hoàn thành Survey 5', '2026-07-15 10:00:00'),
(38, 11, 'Survey_Completion', 10, 39, 'survey_responses', 'Hoàn thành Survey 8', '2026-07-15 17:00:00'),
(39, 11, 'Event_Report', 50, 11, 'participations', 'Duyệt: Chia sẻ Zero Waste', '2026-07-16 10:00:00'),

-- User 16 points
(40, 16, 'Survey_Completion', 10, 18, 'survey_responses', 'Hoàn thành Survey 1', '2026-07-14 13:00:00'),
(41, 16, 'Survey_Completion', 10, 25, 'survey_responses', 'Hoàn thành Survey 5', '2026-07-15 11:00:00'),
(42, 16, 'Event_Report', 50, 10, 'participations', 'Duyệt: Ngày hội Xanh', '2026-07-15 10:00:00'),

-- User 17 points
(43, 17, 'Survey_Completion', 10, 19, 'survey_responses', 'Hoàn thành Survey 1', '2026-07-14 14:00:00'),
(44, 17, 'Survey_Completion', 10, 31, 'survey_responses', 'Hoàn thành Survey 5', '2026-07-15 12:00:00'),
(45, 17, 'Event_Report', 50, 9, 'participations', 'Duyệt: Dọn rác công viên', '2026-07-14 10:00:00'),

-- User 18 points
(46, 18, 'Survey_Completion', 10, 20, 'survey_responses', 'Hoàn thành Survey 1', '2026-07-14 15:00:00'),
(47, 18, 'Survey_Completion', 10, 32, 'survey_responses', 'Hoàn thành Survey 6', '2026-07-14 18:00:00'),

-- User 7 bonus
(48, 7, 'Bonus', 30, NULL, NULL, 'Thưởng tháng 7 - Top tích cực', '2026-07-20 10:00:00'),

-- User 8 bonus
(49, 8, 'Bonus', 25, NULL, NULL, 'Thưởng tháng 7 - Sáng tạo', '2026-07-20 10:00:00'),

-- User 9 bonus
(50, 9, 'Bonus', 20, NULL, NULL, 'Thưởng tháng 7 - Nhiệt huyết', '2026-07-20 10:00:00');

-- ─────────────────────────────────────────────────────────────────
-- THÊM NOTIFICATIONS (7-20)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `notifications` VALUES
(7, 7, 'Điểm thưởng mới!', 'Bạn nhận được 50 điểm từ Workshop Sống Xanh.', 0, 'user', 7, '2026-07-06 10:00:00'),
(8, 8, 'Báo cáo được duyệt', 'Báo cáo "Phát khẩu trang tái chế" đã được duyệt.', 1, 'participation', 6, '2026-07-09 10:00:00'),
(9, 9, 'Thành tích mới!', 'Bạn đã hoàn thành 5 surveys!', 0, 'user', 9, '2026-07-15 12:00:00'),
(10, 10, 'Survey mới', 'Khảo sát Sử dụng Năng lượng Tái tạo đã được mở.', 0, 'survey', 7, '2026-07-10 09:00:00'),
(11, 11, 'Báo cáo được duyệt', 'Báo cáo "Chia sẻ lối sống Zero Waste" đã được duyệt.', 1, 'participation', 11, '2026-07-16 10:00:00'),
(12, 16, 'Chào mừng!', 'Chào mừng bạn tham gia EcoSurvey!', 1, 'user', 16, '2026-07-10 08:00:00'),
(13, 16, 'Survey mới', 'Khảo sát Ý kiến về Chính sách Xanh đã được mở.', 0, 'survey', 8, '2026-07-10 10:00:00'),
(14, 17, 'Điểm thưởng', 'Bạn nhận được 25 điểm thưởng tháng 7!', 0, 'user', 17, '2026-07-20 10:00:00'),
(15, 18, 'Báo cáo đang chờ', 'Báo cáo "Trồng cây tại sân trường" đang được xem xét.', 0, 'participation', 12, '2026-07-17 10:00:00'),
(16, 7, 'Xếp hạng mới', 'Bạn đã lọt vào TOP 5 leaderboard!', 0, 'user', 7, '2026-07-20 12:00:00'),
(17, 8, 'Xếp hạng mới', 'Bạn đã lọt vào TOP 10 leaderboard!', 0, 'user', 8, '2026-07-20 12:00:00'),
(18, 9, 'Huy hiệu mới!', 'Bạn nhận được huy hiệu "Nhiệt huyết"!', 0, 'badge', 2, '2026-07-20 12:00:00'),
(19, 7, 'Thông báo hệ thống', 'Hệ thống sẽ bảo trì vào 23:00 ngày 25/07/2026.', 0, 'system', NULL, '2026-07-21 08:00:00'),
(20, 8, 'Thông báo hệ thống', 'Hệ thống sẽ bảo trì vào 23:00 ngày 25/07/2026.', 0, 'system', NULL, '2026-07-21 08:00:00');

-- ─────────────────────────────────────────────────────────────────
-- THÊM USER BADGES
-- ─────────────────────────────────────────────────────────────────
INSERT INTO `user_badges` VALUES
(1, 2, 1, '2026-07-13 10:17:35'),  -- Nguyễn Văn A: Bước đầu tiên
(2, 2, 4, '2026-07-12 20:17:35'),  -- Nguyễn Văn A: Hoạt động viên
(3, 5, 1, '2026-07-03 20:17:35'),  -- Phạm Cán Bộ: Bước đầu tiên
(4, 5, 4, '2026-07-03 20:17:35'),  -- Phạm Cán Bộ: Hoạt động viên
(5, 7, 1, '2026-07-11 15:17:35'),  -- Đinh Văn Nam: Bước đầu tiên
(6, 7, 2, '2026-07-15 13:00:00'),  -- Đinh Văn Nam: Nhiệt huyết (5 surveys)
(7, 7, 6, '2026-07-20 10:00:00'),  -- Đinh Văn Nam: 100 điểm
(8, 8, 1, '2026-07-08 20:17:35'),  -- Bùi Thị Lan: Bước đầu tiên
(9, 8, 2, '2026-07-15 14:00:00'),  -- Bùi Thị Lan: Nhiệt huyết (3 surveys)
(10, 8, 6, '2026-07-20 10:00:00'), -- Bùi Thị Lan: 100 điểm
(11, 9, 1, '2026-07-11 15:17:35'), -- Vũ Đức Hải: Bước đầu tiên
(12, 9, 2, '2026-07-15 08:00:00'), -- Vũ Đức Hải: Nhiệt huyết (2 surveys)
(13, 10, 1, '2026-07-14 11:00:00'),-- Phan Mỹ Tâm: Bước đầu tiên
(14, 10, 2, '2026-07-15 16:00:00'),-- Phan Mỹ Tâm: Nhiệt huyết (4 surveys)
(15, 10, 6, '2026-07-20 10:00:00'),-- Phan Mỹ Tâm: 100 điểm
(16, 13, 1, '2026-05-29 20:17:35'),-- Đặng Thái Sơn: Bước đầu tiên
(17, 13, 2, '2026-07-15 16:00:00'),-- Đặng Thái Sơn: Nhiệt huyết (3 surveys)
(18, 14, 1, '2026-07-07 20:17:35'),-- Trương Lệ Na: Bước đầu tiên
(19, 14, 2, '2026-07-15 12:00:00'),-- Trương Lệ Na: Nhiệt huyết (3 surveys)
(20, 14, 6, '2026-07-20 10:00:00');-- Trương Lệ Na: 100 điểm

-- =====================================================================
SELECT 'Test data inserted successfully!' AS status;
SELECT CONCAT('Total users: ', COUNT(*)) AS info FROM users;
SELECT CONCAT('Total surveys: ', COUNT(*)) AS info FROM surveys;
SELECT CONCAT('Total responses: ', COUNT(*)) AS info FROM survey_responses;
SELECT CONCAT('Total participations: ', COUNT(*)) AS info FROM participations;
SELECT CONCAT('Total point_logs: ', COUNT(*)) AS info FROM point_logs;
-- =====================================================================
