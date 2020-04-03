// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const MarketplaceItem = require('./marketplace_item');
const User = require('./user');
const dotnev = require('dotenv');

dotnev.config();

const DATABASE = process.env.DATABASE;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const sequelize = new Sequelize(DATABASE, DB_USERNAME, DB_PASSWORD, {
  dialect: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
});

const models = {
  MarketplaceItem: new MarketplaceItem(sequelize, DataTypes),
  User: new User(sequelize, DataTypes),
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;

module.exports = models;
