const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Message = sequelize.define('Message', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });

module.exports = Message;