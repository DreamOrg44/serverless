const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Your Sequelize instance

const EmailTracking = sequelize.define('email_tracking', {
 userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verificationLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verificationToken: {
    type: DataTypes.STRING, // Assuming your token is a string
    allowNull: false,
    unique: true, // If tokens should be unique
  },
});

module.exports = EmailTracking;
