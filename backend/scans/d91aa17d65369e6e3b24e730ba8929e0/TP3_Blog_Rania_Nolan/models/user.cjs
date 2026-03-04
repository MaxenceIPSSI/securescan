'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      User.hasMany(models.Article, {
        foreignKey: 'userId',
        as: 'articles'
      });
    }

    
    async checkPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }

  User.init(
    {
      userName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      mail: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'User',

      //  HOOKS SEQUELIZE
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        }
      }
    }
  );

  return User;
};