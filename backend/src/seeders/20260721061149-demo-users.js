'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Only insert if the table is empty to avoid duplicate keys
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM users');
    if (results[0].count === 0) {
      await queryInterface.sequelize.query(`
        INSERT INTO \`users\` (\`id\`, \`full_name\`, \`username\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`student_staff_id\`, \`class_name\`, \`department\`, \`joined_date\`, \`ui_theme\`, \`avatar_url\`, \`reject_reason\`, \`created_at\`, \`updated_at\`) VALUES
        (1,  'System Administrator', 'admin',       'admin@ecosurvey.edu.vn',          '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Admin',   'Approved', NULL,        NULL,   'IT Department',           '2026-07-06', 'light', NULL, NULL, '2026-07-07 19:15:15', '2026-07-07 19:15:15'),
        (2,  'Nguyễn Văn A',         'nva_student', 'nva@student.ecosurvey.edu.vn',    '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Student', 'Approved', 'SV2023001', 'IT1',  'Khoa CNTT',               '2023-09-05', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (3,  'Trần Thị B',           'ttb_student', 'ttb@student.ecosurvey.edu.vn',    '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Student', 'Pending',  'SV2023002', 'KT1',  'Khoa Kinh tế',            '2023-09-10', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (4,  'Lê Văn C',             'lvc_student', 'lvc@student.ecosurvey.edu.vn',    '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Student', 'Rejected', 'SV2023003', 'MT1',  'Khoa Môi trường',         '2023-09-12', 'light', NULL, 'Hình ảnh thẻ sinh viên không hợp lệ', '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (5,  'Phạm Cán Bộ',          'pcb_staff',   'pcb@ecosurvey.edu.vn',            '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Staff',   'Approved', 'CB001',     NULL,   'Phòng Đào tạo',           '2020-01-15', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (6,  'Hoàng Cán Bộ',         'hcb_staff',   'hcb@ecosurvey.edu.vn',            '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Staff',   'Approved', 'CB002',     NULL,   'Phòng Hành chính',        '2019-05-20', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (7,  'Đinh Văn Nam',         'dv_nam',      'nam.dv@student.ecosurvey.edu.vn', '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Student', 'Approved', 'SV2023004', 'IT2',  'Khoa CNTT',               '2023-09-01', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (8,  'Bùi Thị Lan',          'bt_lan',      'lan.bt@student.ecosurvey.edu.vn', '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Student', 'Approved', 'SV2023005', 'KT2',  'Khoa Kinh tế',            '2023-09-02', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (9,  'Vũ Đức Hải',           'vd_hai',      'hai.vd@student.ecosurvey.edu.vn', '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Student', 'Approved', 'SV2023006', 'MT1',  'Khoa Môi trường',         '2023-09-03', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (10, 'Phan Mỹ Tâm',          'pm_tam',      'tam.pm@student.ecosurvey.edu.vn', '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Student', 'Approved', 'SV2023007', 'NN1',  'Khoa Ngoại ngữ',          '2023-09-04', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (11, 'Ngô Minh Khang',       'nm_khang',    'khang.nm@student.ecosurvey.edu.vn','$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Student', 'Approved', 'SV2023008', 'IT1',  'Khoa CNTT',               '2023-09-05', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (12, 'Lý Tiểu Long',         'lt_long',     'long.lt@student.ecosurvey.edu.vn','$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Student', 'Approved', 'SV2023009', 'IT2',  'Khoa CNTT',               '2023-09-06', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (13, 'Đặng Thái Sơn',        'dt_son',      'son.dt@ecosurvey.edu.vn',         '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Staff',   'Approved', 'CB003',     NULL,   'Phòng Công tác Sinh viên','2021-02-15', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (14, 'Trương Lệ Na',         'tl_na',       'na.tl@ecosurvey.edu.vn',          '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Staff',   'Approved', 'CB004',     NULL,   'Khoa Môi trường',         '2018-08-10', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35'),
        (15, 'Hồ Ngọc Hà',           'hn_ha',       'ha.hn@ecosurvey.edu.vn',          '$2b$10$axYySaCq/Ufzc8K.2g983ur58rPVCMZdEALXg22UIAjqVxH5shM0a', 'Staff',   'Approved', 'CB005',     NULL,   'Phòng Tài chính',         '2022-05-01', 'light', NULL, NULL, '2026-07-07 20:17:35', '2026-07-07 20:17:35');
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
