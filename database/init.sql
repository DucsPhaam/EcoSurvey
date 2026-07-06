-- ============================================================
-- EcoSurvey — Database Schema v1.0
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecosurvey CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecosurvey;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150)  NOT NULL,
  username      VARCHAR(80)   NOT NULL UNIQUE,
  email         VARCHAR(191)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('Student','Staff','Admin') NOT NULL DEFAULT 'Student',
  status        ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  student_staff_id VARCHAR(30) NULL,
  class_name    VARCHAR(100)  NULL,
  department    VARCHAR(150)  NULL,
  joined_date   DATE          NULL,
  ui_theme      ENUM('light','dark') NOT NULL DEFAULT 'light',
  avatar_url    VARCHAR(500)  NULL,
  reject_reason TEXT          NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role   (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: refresh_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  DATETIME     NOT NULL,
  revoked     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rt_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: password_resets
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  DATETIME     NOT NULL,
  used        TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: surveys
-- ============================================================
CREATE TABLE IF NOT EXISTS surveys (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  description TEXT          NULL,
  target_role ENUM('All','Student','Staff') NOT NULL DEFAULT 'All',
  start_date  DATETIME      NOT NULL,
  end_date    DATETIME      NOT NULL,
  status      ENUM('Draft','Published','Closed') NOT NULL DEFAULT 'Draft',
  created_by  INT UNSIGNED  NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_surveys_status      (status),
  INDEX idx_surveys_target_role (target_role),
  INDEX idx_surveys_end_date    (end_date)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: questions
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  survey_id     INT UNSIGNED NOT NULL,
  question_text TEXT         NOT NULL,
  question_type ENUM('Text','Single_Choice','Multiple_Choice') NOT NULL DEFAULT 'Text',
  options       JSON         NULL COMMENT 'Array of option strings for choice questions',
  order_num     INT UNSIGNED NOT NULL DEFAULT 0,
  is_required   TINYINT(1)  NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  INDEX idx_questions_survey_id (survey_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: survey_responses
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  survey_id    INT UNSIGNED NOT NULL,
  user_id      INT UNSIGNED NOT NULL,
  submitted_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  UNIQUE KEY uq_response (survey_id, user_id),
  INDEX idx_sr_survey_id (survey_id),
  INDEX idx_sr_user_id   (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: survey_answers
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_answers (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  response_id INT UNSIGNED NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  answer_text TEXT         NULL,
  FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)        ON DELETE CASCADE,
  INDEX idx_sa_response_id (response_id),
  INDEX idx_sa_question_id (question_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: participations (Effective Participation reports)
-- ============================================================
CREATE TABLE IF NOT EXISTS participations (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  event_name        VARCHAR(255) NOT NULL,
  location          VARCHAR(255) NOT NULL,
  participant_count INT UNSIGNED NOT NULL DEFAULT 0,
  description       TEXT         NOT NULL,
  status            ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  ai_summary        TEXT         NULL,
  reject_reason     TEXT         NULL,
  reviewed_by       INT UNSIGNED NULL,
  reviewed_at       DATETIME     NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_part_user_id (user_id),
  INDEX idx_part_status  (status)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: participation_files
-- ============================================================
CREATE TABLE IF NOT EXISTS participation_files (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  participation_id INT UNSIGNED  NOT NULL,
  file_url         VARCHAR(500)  NOT NULL,
  file_name        VARCHAR(255)  NOT NULL,
  file_type        VARCHAR(100)  NULL,
  file_size        INT UNSIGNED  NULL COMMENT 'Size in bytes',
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participation_id) REFERENCES participations(id) ON DELETE CASCADE,
  INDEX idx_pf_participation_id (participation_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: point_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS point_logs (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  action_type    ENUM('Survey_Completion','Event_Report','Bonus','Deduction') NOT NULL,
  points         INT          NOT NULL DEFAULT 0,
  reference_id   INT UNSIGNED NULL,
  reference_type VARCHAR(50)  NULL COMMENT 'survey_responses | participations',
  note           VARCHAR(255) NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pl_user_id    (user_id),
  INDEX idx_pl_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: faqs
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question   TEXT         NOT NULL,
  answer     TEXT         NOT NULL,
  category   VARCHAR(100) NULL,
  is_active  TINYINT(1)  NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FULLTEXT idx_faqs_ft (question, answer)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  title          VARCHAR(255) NOT NULL,
  message        TEXT         NOT NULL,
  is_read        TINYINT(1)  NOT NULL DEFAULT 0,
  reference_type VARCHAR(50)  NULL COMMENT 'survey | participation | user',
  reference_id   INT UNSIGNED NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_id (user_id),
  INDEX idx_notif_is_read (is_read)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Admin account: admin / Admin@123456
INSERT INTO users (full_name, username, email, password_hash, role, status, department, joined_date)
VALUES (
  'System Administrator',
  'admin',
  'admin@ecosurvey.edu.vn',
  -- bcrypt hash of 'Admin@123456' (10 rounds)
  '$2b$10$wudfrdk5avOD.j.zVGA18.ZTKMLwLmpeycOnQ1dx5DWg8PUSNjK1a',
  'Admin',
  'Approved',
  'IT Department',
  CURDATE()
);

-- Sample FAQs
INSERT INTO faqs (question, answer, category) VALUES
('Làm thế nào để tham gia khảo sát?', 'Sau khi đăng nhập, vào mục "Bảng Khảo Sát", chọn khảo sát bạn muốn tham gia và nhấn nút "Tham Gia Ngay". Điền đầy đủ các câu hỏi và nhấn "Nộp Bài".', 'Khảo sát'),
('Điểm được tính như thế nào?', 'Mỗi lần hoàn thành khảo sát bạn nhận được 10 điểm. Mỗi báo cáo Tham Gia Hiệu Quả (Effective Participation) được Admin duyệt sẽ cộng thêm 50 điểm.', 'Điểm số'),
('Tôi có thể nộp báo cáo hoạt động ngoại khóa không?', 'Có! Vào mục "Báo Cáo Hoạt Động", điền thông tin sự kiện, mô tả chi tiết và đính kèm tối đa 5 file minh chứng (ảnh/PDF, mỗi file ≤ 5MB). Admin sẽ xem xét và duyệt trong thời gian sớm nhất.', 'Hoạt động'),
('Tài khoản của tôi đang ở trạng thái chờ duyệt là sao?', 'Sau khi đăng ký, tài khoản cần được Admin phê duyệt trước khi sử dụng. Bạn sẽ nhận được thông báo khi tài khoản được duyệt hoặc bị từ chối. Thời gian duyệt thường trong vòng 1-2 ngày làm việc.', 'Tài khoản'),
('Làm sao để xem bảng xếp hạng?', 'Vào mục "Bảng Xếp Hạng" trên thanh điều hướng. Bạn có thể xem top 10 theo tuần, tháng hoặc toàn thời gian. Vị trí của bạn sẽ được hiển thị ngay cả khi không nằm trong top 10.', 'Xếp hạng'),
('Tôi quên mật khẩu thì phải làm sao?', 'Hiện tại vui lòng liên hệ Admin để được hỗ trợ đặt lại mật khẩu. Tính năng tự khôi phục mật khẩu qua email đang được phát triển.', 'Tài khoản'),
('Khảo sát có thể nộp lại không?', 'Không. Mỗi khảo sát chỉ được nộp bài một lần. Sau khi đã nộp, bạn sẽ thấy nhãn "Đã Hoàn Thành" và không thể tham gia lại khảo sát đó.', 'Khảo sát');

-- Sample surveys
INSERT INTO surveys (title, description, target_role, start_date, end_date, status, created_by)
VALUES
(
  'Khảo sát Nhận thức Bảo vệ Môi trường 2025',
  'Khảo sát nhằm đánh giá mức độ nhận thức của sinh viên về các vấn đề môi trường hiện nay, bao gồm biến đổi khí hậu, ô nhiễm nhựa và tiết kiệm năng lượng.',
  'Student',
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  DATE_ADD(NOW(), INTERVAL 30 DAY),
  'Published',
  1
),
(
  'Khảo sát Hoạt động Xanh trong Khuôn viên Trường',
  'Khảo sát dành cho toàn thể cán bộ, giảng viên và sinh viên về mức độ tham gia các hoạt động xanh, sử dụng túi vải, phân loại rác tại nguồn.',
  'All',
  DATE_SUB(NOW(), INTERVAL 2 DAY),
  DATE_ADD(NOW(), INTERVAL 14 DAY),
  'Published',
  1
),
(
  'Khảo sát Nội bộ - Tiết kiệm Điện tại Văn phòng',
  'Khảo sát dành riêng cho cán bộ nhân viên về thói quen sử dụng điện và đề xuất cải tiến.',
  'Staff',
  DATE_ADD(NOW(), INTERVAL 5 DAY),
  DATE_ADD(NOW(), INTERVAL 35 DAY),
  'Draft',
  1
);

-- Sample questions for survey 1
INSERT INTO questions (survey_id, question_text, question_type, options, order_num, is_required) VALUES
(1, 'Bạn hiểu biết về vấn đề biến đổi khí hậu ở mức nào?', 'Single_Choice', '["Rất hiểu biết","Hiểu biết cơ bản","Biết một chút","Chưa hiểu nhiều"]', 1, 1),
(1, 'Bạn thường thực hiện những hành động nào để bảo vệ môi trường?', 'Multiple_Choice', '["Phân loại rác tại nhà","Sử dụng túi vải thay túi nhựa","Tiết kiệm điện nước","Sử dụng phương tiện công cộng","Hạn chế dùng đồ nhựa một lần","Trồng cây xanh"]', 2, 1),
(1, 'Theo bạn, vấn đề môi trường nào đáng lo ngại nhất hiện nay tại Việt Nam?', 'Single_Choice', '["Ô nhiễm không khí","Ô nhiễm nguồn nước","Rác thải nhựa","Phá rừng","Biến đổi khí hậu"]', 3, 1),
(1, 'Bạn đã từng tham gia hoạt động tình nguyện bảo vệ môi trường chưa?', 'Single_Choice', '["Có, nhiều lần","Có, một vài lần","Chưa nhưng có kế hoạch","Chưa và không có kế hoạch"]', 4, 1),
(1, 'Theo bạn, nhà trường có thể làm gì để nâng cao ý thức bảo vệ môi trường trong sinh viên? (Nêu ý kiến cá nhân)', 'Text', NULL, 5, 0);

-- Sample questions for survey 2
INSERT INTO questions (survey_id, question_text, question_type, options, order_num, is_required) VALUES
(2, 'Bạn có sử dụng túi vải/hộp cơm cá nhân thay thế đồ nhựa dùng một lần không?', 'Single_Choice', '["Luôn luôn","Thường xuyên","Thỉnh thoảng","Hiếm khi","Không bao giờ"]', 1, 1),
(2, 'Bạn có thực hiện phân loại rác tại nguồn không?', 'Single_Choice', '["Có, thường xuyên","Thỉnh thoảng","Chưa biết cách phân loại","Không"]', 2, 1),
(2, 'Bạn đã tham gia những hoạt động xanh nào trong khuôn viên trường?', 'Multiple_Choice', '["Ngày hội Môi trường","Chiến dịch Nhặt rác","Trồng cây xanh","Cuộc thi tìm hiểu môi trường","Chưa tham gia hoạt động nào"]', 3, 1),
(2, 'Ý kiến của bạn về các hoạt động xanh của nhà trường?', 'Text', NULL, 4, 0);
