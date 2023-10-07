//const { Router } = require("express");

const express = require('express');
const { User, Spot, Review, ReviewImage, SpotImage, Booking } = require('../../db/models')

const { Op } = require("sequelize");

const sequelize = require("sequelize");

const { requireAuth } = require("../../utils/auth");

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();


const validateSpot = [
    check("address")
        .exists({ checkFalsy: true })
        .withMessage("Street address is required"),
    check("city")
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check("state")
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    check("country")
        .exists({ checkFalsy: true })
        .withMessage("Country is required"),
    check("lat")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude is not valid"),
    check("lng")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude is not valid"),
    check("name")
        .exists({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage("Name must be less than 50 characters"),
    check("description")
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
    check("price")
        .exists({ checkFalsy: true })
        .withMessage("Price per day is required"),
    handleValidationErrors,
  ];
const validateReview = [
    check('review')
        .exists( { checkFalsy: true })
        .withMessage('Review text is required'),
    check('stars')
        .exists( { checkFalsy: true })
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
 ];

const validateQuery = [
    check("page")
        .optional(true)
        .isFloat({ min: 1 })
        .withMessage("Page must be greater than or equal to 1"),
    check("size")
        .optional(true)
        .isFloat({ min: 1 })
        .withMessage("Size must be greater than or equal to 1"),
    check("maxLng")
        .optional(true)
        .isFloat({ max: 180 })
        .withMessage("Maximum longitude is invalid"),
    check("minLng")
        .optional(true)
        .isFloat({ min: -180 })
        .withMessage("Minumum longitude is invalid"),
    check("maxLat")
        .optional(true)
        .isFloat({ max: 90 })
        .withMessage("Maximum latitude is invalid"),
    check("minLat")
        .optional(true)
        .isFloat({ min: -90 })
        .withMessage("Minumum latitude is invalid"),
    check("maxPrice")
        .optional(true)
        .isFloat({ min: 0 })
        .withMessage("Maximum price must be greater than or equal to 0"),
    check("minPrice")
        .optional(true)
        .isFloat({ min: 0 })
        .withMessage("Minimum price must be greater than or equal to 0"),
    handleValidationErrors,
];

//   // if spot is owned by the current user
//   if (spot.ownerId === user.id) {
//     res.statusCode = 403;
//     return res.json({ message: "Forbidden" });
//   }

//Get details of a Spot from an id
router.get("/:spotId", async (req, res, next) => {
    let spotId = req.params.spotId;
    const spot = await Spot.findOne({
        where: { id: spotId, },
        include: [
            {
                model: Review,
                attributes: [],
            },
            {
                model: SpotImage,
                attributes: ["id", "url", "preview"],
            },
            {
                model: User,
                as: "Owner",
                attributes: ["id", "firstName", "lastName"],
            },
        ],
        attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "description",
            "price",
            "createdAt",
            "updatedAt",
            [ sequelize.fn("COUNT", sequelize.col("Reviews.id")), "numReviews" ],
            [ sequelize.fn("ROUND", sequelize.fn("AVG", sequelize.col("stars")), 2), "avgStarRating" ],
            ],
        group: ["Spot.id", "Owner.id", "SpotImages.id"],
        });

       if (spot) {
        const avgStarRating = Number(spot.dataValues.avgStarRating).toFixed(1);
        spot.dataValues.avgStarRating = avgStarRating;
        return res.status(200).json(spot);
    }
    // else {
    //     return res.status(404).json({ message: "Spot couldn't be found" });
    // }
});

// Get all Spots owned by the Current User
router.get('/current', requireAuth, async (req, res, next) => {
    const userId = req.user.id;
    const spots = await Spot.findAll({
      where: { ownerId: userId },
      include: [
        {
          model: Review,
          attributes: []
        },
      ],
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgRating']
        ]
      },
      group: ['Spot.id']
    });

    return res.status(200).json({ Spots: spots})
  });

//Get all spots
router.get('/', validateQuery, async (req, res) => {
    const allSpots = await Spot.findAll();

    return res.json({Spots: allSpots})
})


// Create and return a new spot
router.post( '/', requireAuth, validateSpot, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const user = req.user;

    //checking unique address - could not find it in the readme that address is unique
    // const check = await Spot.findOne({where: {address: address}});
    // if(check) {
    //     res.status(400);
    //     return res.json({
    //          "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
    //          "errors": {
    //             "address": "Street address must be unique",
    //         }
    //     })
    // }
    const newSpot = await Spot.create({ ownerId: user.id, address, city, state, country, lat, lng, name, description, price });
    return res.status(201).json(newSpot)
})

//Add an Image to a Spot based on the SpotId
router.post("/:spotId/images", requireAuth, async (req, res, next) => {
    const { url, preview } = req.body;
    const user = req.user;
    const spotId = req.params.spotId;

    const currentSpot = await Spot.findByPk(spotId);

    if (currentSpot) {
      if (user.id === currentSpot.ownerId) {
        const spotImage = await SpotImage.create({
          spotId,
          url,
          preview,
        });
        let outputSpotImage = {
          id: spotImage.id,
          url: spotImage.url,
          preview: spotImage.preview,
        };
        currentSpot.addSpotImage(spotImage);
        return res.status(200).json(outputSpotImage);
      } else return res.status(403).json({ message: "Forbidden!" });
    } else return res.status(404).json({ message: "Spot couldn't be found!" });
  });

//Edit a Spot
router.put("/:spotId", requireAuth, validateSpot, async (req, res, next) => {
    let spotId = req.params.spotId;
    const user = req.user;
    const { address, city, state, country, lat, lng, name, description, price } =
      req.body;

    let currentSpot = await Spot.findByPk(spotId);

    if (currentSpot) {
      if (user.id === currentSpot.ownerId) {
        currentSpot.address = address;
        currentSpot.city = city;
        currentSpot.state = state;
        currentSpot.country = country;
        currentSpot.lat = lat;
        currentSpot.lng = lng;
        currentSpot.name = name;
        currentSpot.description = description;
        currentSpot.price = price;

        await currentSpot.save();
        return res.status(200).json(currentSpot);
      } else return res.status(403).json("Forbidden");
    } else return res.status(404).json("Spot couldn't be found");
  });

  //Delete spot by Id
  router.delete("/:spotId", requireAuth, async (req, res, next) => {
    const user = req.user;
    const spotId = req.params.spotId;

    const currentSpot = await Spot.findByPk(spotId);

    if (currentSpot) {
      if (user.id === currentSpot.ownerId) {
        await currentSpot.destroy();

        return res.status(200).json({ message: "Successfully deleted!" });
      } else return res.status(403).json({ message: "Forbidden!" });
    } else return res.status(404).json({ message: "Spot couldn't be found!" });
  });




module.exports = router;
