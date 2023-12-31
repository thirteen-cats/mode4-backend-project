'use strict';

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = "Bookings";

    return queryInterface.bulkInsert(
      options,
      [
        {
          id: 1,
          spotId: 1,
          userId: 3,
          startDate: "2024-01-14",
          endDate: "2024-02-14",
        },
        {
          id: 2,
          spotId: 2,
          userId: 1,
          startDate: "2024-02-15",
          endDate: "2024-03-15",
        },
        {
          id: 3,
          spotId: 3,
          userId: 2,
          startDate: "2024-03-16",
          endDate: "2024-04-16",
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Bookings";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, null, { truncate: true, cascade: true })
  }
};
