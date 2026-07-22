const fs = require('fs');
const path = require('path');
const { sequelize } = require('./src/config/database');
const models = require('./src/models');

const output = [];

output.push(`'use strict';`);
output.push(``);
output.push(`module.exports = {`);
output.push(`  async up(queryInterface, Sequelize) {`);

// Sort tables by dependencies if possible.
// Users -> FAQs, Badges
// Surveys -> Questions
// UserBadges -> Users, Badges
// RefreshTokens -> Users
// Participations -> Users, Surveys
// ParticipationFiles -> Participations
// PointLogs -> Users
// Notifications -> Users
// SurveyResponses -> Users, Surveys
// SurveyAnswers -> SurveyResponses, Questions

const tablesOrder = [
  'users',
  'faqs',
  'badges',
  'surveys',
  'refresh_tokens',
  'questions',
  'participations',
  'participation_files',
  'point_logs',
  'notifications',
  'survey_responses',
  'survey_answers',
  'user_badges'
];

for (const tableName of tablesOrder) {
  // Find model by table name
  const modelName = Object.keys(models).find(m => models[m].tableName === tableName || m.toLowerCase() + 's' === tableName || (models[m].options && models[m].options.tableName === tableName));
  
  if (!modelName) {
    console.log('Skipping', tableName, 'No model found');
    continue;
  }
  const model = models[modelName];
  const attributes = model.getAttributes();
  
  output.push(`    await queryInterface.createTable('${tableName}', {`);
  
  for (const key of Object.keys(attributes)) {
    const attr = attributes[key];
    let typeStr = attr.type.key;
    if (attr.type.key === 'STRING') {
        typeStr = `Sequelize.STRING(${attr.type.options && attr.type.options.length ? attr.type.options.length : 255})`;
    } else if (attr.type.key === 'ENUM') {
        typeStr = `Sequelize.ENUM('${attr.type.values.join("', '")}')`;
    } else if (attr.type.key === 'INTEGER' || attr.type.key === 'TINYINT') {
        typeStr = `Sequelize.INTEGER`; // simplify
    } else if (attr.type.key === 'DECIMAL') {
        typeStr = `Sequelize.DECIMAL(${attr.type.options.precision || 10}, ${attr.type.options.scale || 2})`;
    } else if (attr.type.key === 'TEXT') {
        typeStr = `Sequelize.TEXT`;
    } else if (attr.type.key === 'BOOLEAN') {
        typeStr = `Sequelize.BOOLEAN`;
    } else if (attr.type.key === 'DATE') {
        typeStr = `Sequelize.DATE`;
    } else if (attr.type.key === 'JSON') {
        typeStr = `Sequelize.JSON`;
    } else {
        typeStr = `Sequelize.${attr.type.key}`;
    }

    output.push(`      ${key}: {`);
    output.push(`        type: ${typeStr},`);
    if (attr.primaryKey) output.push(`        primaryKey: true,`);
    if (attr.autoIncrement) output.push(`        autoIncrement: true,`);
    if (attr.allowNull === false) output.push(`        allowNull: false,`);
    if (attr.unique) output.push(`        unique: true,`);
    if (attr.defaultValue !== undefined) {
      if (attr.defaultValue === null) {
         output.push(`        defaultValue: null,`);
      } else if (typeof attr.defaultValue === 'object' && attr.defaultValue.constructor.name === 'NOW') {
         output.push(`        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),`);
      } else if (typeof attr.defaultValue === 'string') {
         output.push(`        defaultValue: '${attr.defaultValue}',`);
      } else {
         output.push(`        defaultValue: ${attr.defaultValue},`);
      }
    }
    if (attr.references) {
        output.push(`        references: {`);
        output.push(`          model: '${attr.references.model}',`);
        output.push(`          key: '${attr.references.key}'`);
        output.push(`        },`);
        output.push(`        onUpdate: 'CASCADE',`);
        output.push(`        onDelete: 'CASCADE',`);
    }
    
    output.push(`      },`);
  }
  
  output.push(`    });`);
  output.push(``);
}

output.push(`  },`);
output.push(``);
output.push(`  async down(queryInterface, Sequelize) {`);
for (const tableName of [...tablesOrder].reverse()) {
  output.push(`    await queryInterface.dropTable('${tableName}');`);
}
output.push(`  }`);
output.push(`};`);

const fileList = fs.readdirSync(path.join(__dirname, 'src/migrations'));
const initialSchemaFile = fileList.find(f => f.includes('create-initial-schema'));
if (initialSchemaFile) {
  fs.writeFileSync(path.join(__dirname, 'src/migrations', initialSchemaFile), output.join('\n'));
  console.log('Successfully generated initial schema migration');
} else {
  console.log('Migration file not found');
}
