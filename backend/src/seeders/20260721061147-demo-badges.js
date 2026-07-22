'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('badges', [
      { id: 1, name: 'Bước đầu tiên', icon_emoji: '🎯', description: 'Nộp survey đầu tiên', condition_type: 'SURVEY_COUNT', condition_value: 1 },
      { id: 2, name: 'Nhiệt huyết', icon_emoji: '🔥', description: 'Hoàn thành 5 surveys', condition_type: 'SURVEY_COUNT', condition_value: 5 },
      { id: 3, name: 'Cống hiến', icon_emoji: '🌟', description: 'Hoàn thành 10 surveys', condition_type: 'SURVEY_COUNT', condition_value: 10 },
      { id: 4, name: 'Hoạt động viên', icon_emoji: '📝', description: 'Tạo participation đầu tiên', condition_type: 'PARTICIPATION_COUNT', condition_value: 1 },
      { id: 5, name: 'Top 10', icon_emoji: '🏆', description: 'Vào top 10 leaderboard', condition_type: 'LEADERBOARD_RANK', condition_value: 10 },
      { id: 6, name: 'Thế kỷ', icon_emoji: '💯', description: 'Đạt 100 điểm', condition_type: 'TOTAL_POINTS', condition_value: 100 },
      { id: 7, name: 'Eco Warrior', icon_emoji: '🌿', description: 'Hoàn thành 1 survey môi trường (quy đổi 15 điểm)', condition_type: 'TOTAL_POINTS', condition_value: 15 },
      { id: 8, name: 'Nhà phê bình', icon_emoji: '⭐', description: 'Hoàn thành 2 participation', condition_type: 'PARTICIPATION_COUNT', condition_value: 2 }
    ], {
      updateOnDuplicate: ['name', 'icon_emoji', 'description', 'condition_type', 'condition_value']
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('badges', null, {});
  }
};
