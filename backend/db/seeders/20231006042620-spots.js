'use strict';

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    return queryInterface.bulkInsert(options, [
      {
        id: 1,
        ownerId: 1,
        address: '111 Main St',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        lat: 40.7128,
        lng: -74.0060,
        name: 'Ny Apartment',
        description: 'Best view over the Big Apple',
        price: 100.00,
        // previewImage: 'https://freeimage.host/i/J2ApRqJ'
      },
      {
        id: 2,
        ownerId: 2,
        address: '222 Oak St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
        lat: 34.0522,
        lng: -118.2437,
        name: 'Glass House',
        description: 'A lplace like a piece of art!',
        price: 500.00,
        // previewImage: 'https://freeimage.host/i/J2ApRqJ'
      },
      {
        id: 3,
        ownerId: 3,
        address: '333 Cherry St',
        city: 'Chicago',
        state: 'IL',
        country: 'United States',
        lat: 41.8781,
        lng: -87.6298,
        name: 'Chicago Flat',
        description: 'The best of Chicago sights close by!',
        price: 200.00,
        // previewImage: 'https://freeimage.host/i/J2ApRqJ'
      },
      {
        id: 4,
        ownerId: 4,
        address: '444 Mission St',
        city: 'San Francisco',
        state: 'CA',
        country: 'Millenium Tower',
        lat: 37.7749,
        lng: -122.4194,
        name: 'Leaning Tower',
        description: 'Like Piza tower, but in the heart of SF!',
        price: 150.00,
        // previewImage: 'https://freeimage.host/i/J2ApRqJ'
      },
      {
        id: 5,
        ownerId: 5,
        address: '555 Cedar Rd',
        city: 'Miami',
        state: 'FL',
        country: 'United States',
        lat: 25.7617,
        lng: -80.1918,
        name: 'Florida Heat Glory',
        description: 'The heat is outside, enjoy the AC in the room!',
        price: 300.00,
        // previewImage: 'https://freeimage.host/i/J2ApRqJ'
      },
      {
        id: 6,
        ownerId: 6,
        address: '777 Maple St',
        city: 'Sunnyvale',
        state: 'CA',
        country: 'United States',
        lat: 47.6062,
        lng: -122.3321,
        name: 'Parrot nest',
        description: 'A cozy apartment with nice flock of 20 parakeets',
        price: 120.00,
        // previewImage: 'https://freeimage.host/i/J2ApRqJ'
      },
      {
        id: 7,
        ownerId: 6,
        address: '888 Apple Cider St',
        city: 'PostmanTown',
        state: 'CA',
        country: 'AppAcademyLand',
        lat: 35.6062,
        lng: 35.6062,
        name: 'Almost done with testing!!!!!',
        description: 'Thank you for testing my CozycoRnR API!!!!!!',
        price: 88.00,
        // previewImage: 'https://freeimage.host/i/J2ApRqJ'
      }
      ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = "Spots";
    const Op = Sequelize.op;
    return queryInterface.bulkDelete(options, null, { truncate: true, cascade: true });
  }
};
