const sequelize = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');

(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
})();