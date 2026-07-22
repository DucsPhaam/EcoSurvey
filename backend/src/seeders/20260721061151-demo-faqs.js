'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM faqs');
    if (results[0].count === 0) {
      await queryInterface.sequelize.query(`
        INSERT INTO \`faqs\` (\`id\`, \`question\`, \`answer\`, \`category\`, \`is_active\`, \`created_at\`, \`updated_at\`) VALUES
        (1, 'Làm thế nào để tham gia khảo sát?', 'Sau khi đăng nhập, vào mục "Bảng Khảo Sát", chọn khảo sát bạn muốn tham gia và nhấn nút "Tham Gia Ngay". Điền đầy đủ các câu hỏi và nhấn "Nộp Bài".', 'Khảo sát', 1, '2026-07-06 19:15:15', '2026-07-06 19:15:15'),
        (2, 'Điểm được tính như thế nào?', 'Mỗi lần hoàn thành khảo sát bạn nhận được 10 điểm. Mỗi báo cáo Tham Gia Hiệu Quả (Effective Participation) được Admin duyệt sẽ cộng thêm 50 điểm.', 'Điểm số', 1, '2026-07-06 19:15:15', '2026-07-06 19:15:15'),
        (3, 'Tôi có thể nộp báo cáo hoạt động ngoại khóa không?', 'Có! Vào mục "Báo Cáo Hoạt Động", điền thông tin sự kiện, mô tả chi tiết và đính kèm tối đa 5 file minh chứng (ảnh/PDF, mỗi file ≤ 5MB). Admin sẽ xem xét và duyệt trong thời gian sớm nhất.', 'Hoạt động', 1, '2026-07-06 19:15:15', '2026-07-06 19:15:15'),
        (4, 'Tài khoản của tôi đang ở trạng thái chờ duyệt là sao?', 'Sau khi đăng ký, tài khoản cần được Admin phê duyệt trước khi sử dụng. Bạn sẽ nhận được thông báo khi tài khoản được duyệt hoặc bị từ chối. Thời gian duyệt thường trong vòng 1-2 ngày làm việc.', 'Tài khoản', 1, '2026-07-06 19:15:15', '2026-07-06 19:15:15'),
        (5, 'Làm sao để xem bảng xếp hạng?', 'Vào mục "Bảng Xếp Hạng" trên thanh điều hướng. Bạn có thể xem top 10 theo tuần, tháng hoặc toàn thời gian. Vị trí của bạn sẽ được hiển thị ngay cả khi không nằm trong top 10.', 'Xếp hạng', 1, '2026-07-06 19:15:15', '2026-07-06 19:15:15'),
        (6, 'Tôi quên mật khẩu thì phải làm sao?', 'Hiện tại vui lòng liên hệ Admin để được hỗ trợ đặt lại mật khẩu. Tính năng tự khôi phục mật khẩu qua email đang được phát triển.', 'Tài khoản', 1, '2026-07-06 19:15:15', '2026-07-06 19:15:15'),
        (7, 'Khảo sát có thể nộp lại không?', 'Không. Mỗi khảo sát chỉ được nộp bài một lần. Sau khi đã nộp, bạn sẽ thấy nhãn "Đã Hoàn Thành" và không thể tham gia lại khảo sát đó.', 'Khảo sát', 1, '2026-07-06 19:15:15', '2026-07-06 19:15:15');
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('faqs', null, {});
  }
};
