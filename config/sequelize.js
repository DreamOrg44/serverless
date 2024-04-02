const { Sequelize } = require('sequelize');
const dbConfig = require('./dbConfig'); // Adjust the path based on your project structure

const sequelize = new Sequelize(dbConfig.database.database, dbConfig.database.username, dbConfig.database.password, {
    host: dbConfig.database.host,
    dialect: dbConfig.database.dialect,
    logging: console.log,
});

module.exports = sequelize;
