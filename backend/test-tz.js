const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('ecosurvey', 'root', '12345678', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  timezone: '+00:00',
});
const S = sequelize.define('test_tz', { date: DataTypes.DATE });
async function run() {
  await sequelize.sync();
  await S.create({ date: '2026-07-23T11:24:00.000Z' });
  const rows = await sequelize.query('SELECT date FROM test_tzs');
  console.log('DB Raw:', rows[0]);
  const s = await S.findOne();
  console.log('Sequelize Model:', s.date.toISOString());
  process.exit(0);
}
run();
