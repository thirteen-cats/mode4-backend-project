'use strict';

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 2,
        review: "Amazing place",
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: 2,
        userId: 3,
        review: "Nice place",
        stars: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        spotId: 3,
        userId: 1,
        review: "Terrible place",
        stars: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },{
        spotId: 2,
        userId: 1,
        review: "Fantastic place",
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    return queryInterface.bulkDelete(options, null, { truncate: true, cascade: true })
  }
};
