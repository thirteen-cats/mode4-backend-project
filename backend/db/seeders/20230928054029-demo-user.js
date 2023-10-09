'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Users';
    // await Sequelize.query("TRUNCATE TABLE Users RESTART IDENTITY", { type: QueryTypes.RAW });
    await queryInterface.sequelize.query(
      `TRUNCATE TABLE Users RESTART IDENTITY;`
    )
    await User.bulkCreate([
      {
        email: 'demo@user.io',
        firstName: 'Demo',
        lastName: 'Lition',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password0')
      },
      {
        email: 'user1@user.io',
        firstName: 'Fake',
        lastName: 'UserOne',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password1')
      },
      {
        email: 'user2@user.io',
        firstName: 'Demo',
        lastName: 'UserTwo',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'user3@user.io',
        firstName: 'Demo',
        lastName: 'UserTwo',
        username: 'FakeUser3',
        hashedPassword: bcrypt.hashSync('password3')
      },
      {
        email: 'user4@user.io',
        firstName: 'Demo',
        lastName: 'UserTwo',
        username: 'FakeUser4',
        hashedPassword: bcrypt.hashSync('password4')
      },
      {
        email: 'user5@user.io',
        firstName: 'Demo',
        lastName: 'UserTwo',
        username: 'FakeUser5',
        hashedPassword: bcrypt.hashSync('password5')
      },
      {
        email: 'user6@user.io',
        firstName: 'Demo',
        lastName: 'UserTwo',
        username: 'FakeUser6',
        hashedPassword: bcrypt.hashSync('password6')
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options,  null, { truncate: true, cascade: true });
  }
};
