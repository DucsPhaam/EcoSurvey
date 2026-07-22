const fs = require('fs');
const initSql = fs.readFileSync('database/init.sql', 'utf8');

const surveyStart = initSql.indexOf('INSERT INTO `surveys`');
const endOfPointLogs = initSql.indexOf('INSERT INTO `notifications`');

const sqlToRun = initSql.substring(surveyStart, endOfPointLogs);

const seederPath = fs.readdirSync('backend/src/seeders').find(f => f.includes('demo-surveys'));

const seederContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM surveys');
    if (results[0].count === 0) {
      // Split the big sql by ';' to run each statement separately
      const statements = \`\n\${sqlToRun}\n\`.split(';');
      
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
};`;

fs.writeFileSync('backend/src/seeders/' + seederPath, seederContent);
console.log('Surveys seeder generated successfully');
