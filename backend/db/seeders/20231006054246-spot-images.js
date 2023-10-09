'use strict';

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkInsert(options, [
      {
        id: 1,
        spotId: 1,
        url: "https://freeimage.host/i/J2ApRqJ",
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        spotId: 2,
        url: "https://freeimage.host/i/J2ApRqJ",
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        spotId: 3,
        url: "hello url",
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkDelete(options, null, { truncate: true, cascade: true })
  }
};
