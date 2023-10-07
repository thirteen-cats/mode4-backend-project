const express = require('express');
const { User, Spot, Review, ReviewImage, Booking } = require('../../db/models')

const { Op } = require("sequelize");

const sequelize = require("sequelize");

const { requireAuth } = require("../../utils/auth");

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// const validateReview = [
//     check('review')
//         .exists( { checkFalsy: true })
//         .withMessage('Review text is required'),
//     check('stars')
//         .exists( { checkFalsy: true })
//         .isInt({
//             min: 1,
//             max:5
//         })
//         .withMessage('Stars must be an integer from 1 to 5'),
//     handleValidationErrors
// ];

//Get all Reviews of the Current User
router.get('/current', requireAuth, async (req, res, next) => {
    const userId = req.user.id;
    const rewiews = await Review.findAll({
      where: { userId: userId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"]
        },
        {
            model: Spot,
            attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "price"]
        },
        {
            model: ReviewImage,
            attributes: ["id", "url"]
        },
      ],
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('stars')), 'avgRating']
        ]
      },
      group: ["Review.id", "User.id", "Spot.id", "ReviewImages.id"]
    });

    return res.status(200).json({ Reviews: rewiews})
  });

  module.exports = router;
