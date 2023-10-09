//const { Router } = require("express");

const express = require('express');
const { User, Spot, Review, ReviewImage, SpotImage, Booking } = require('../../db/models')

const { Op } = require("sequelize");

const sequelize = require("sequelize");

const { requireAuth } = require("../../utils/auth");
const { calculateRating, setPreviewImage, pickAttributes, formWhereQuery, isQueryParamDefined } = require("../../utils/common");
const { check, query } = require('express-validator');
// const { query } = require('express-validator/check');
const { handleValidationErrors } = require('../../utils/validation');
const { spotAttributes } = require('../constants');

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
        .isInt({
            min: 1,
            max:5
        })
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
 ];

const validateQuery = [
    query("page")
        .optional(true)
        .isInt({ min: 1, max: 10 })
        .withMessage("Page must be greater than or equal to 1"),
    query("size")
        .optional(true)
        .isInt({ min: 1, max: 20 })
        .withMessage("Size must be greater than or equal to 1"),
    query("maxLng")
        .optional(true)
        .isFloat({ max: 180 })
        .withMessage("Maximum longitude is invalid"),
    query("minLng")
        .optional(true)
        .isFloat({ min: -180 })
        .withMessage("Minumum longitude is invalid"),
    query("maxLat")
        .optional(true)
        .isFloat({ max: 90 })
        .withMessage("Maximum latitude is invalid"),
    query("minLat")
        .optional(true)
        .isFloat({ min: -90 })
        .withMessage("Minumum latitude is invalid"),
    query("maxPrice")
        .optional(true)
        .isFloat({ min: 0 })
        .withMessage("Maximum price must be greater than or equal to 0"),
    query("minPrice")
        .optional(true)
        .isFloat({ min: 0 })
        .withMessage("Minimum price must be greater than or equal to 0"),
    handleValidationErrors,
];


//Get all Reviews by a Spot's id
router.get("/:spotId/reviews", requireAuth, async (req, res, next) => {
    const spotId = req.params.spotId;

    const reviews = await Review.findAll({
      where: {
        spotId: spotId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    if (reviews.length) return res.status(200).json({ Reviews: reviews });
        else return res.status(404).json({ message: "Spot couldn't be found" });
  });

//Create a review by spotId
router.post("/:spotId/reviews", requireAuth, validateReview, async (req, res, next) => {
    let spotId = req.params.spotId;
    const { review, stars } = req.body;
    const userId = req.user.id;

    const currentSpot = await Spot.findByPk(spotId);

    const userReviewCheck = await Review.findOne({
        where: {
          userId,
          spotId
        },
      });

    if (currentSpot){
        if (!userReviewCheck) {
            const newReview = await Review.create({
                userId,
                spotId,
                review,
                stars,
            });
            return res.status(201).json(newReview);
            } else return res.status(500).json({ message: "User already has a review for this spot" });
        } else return res.status(404).json({ message: "Spot couldn't be found" });
    });

// Get all bookings
router.get('/:spotId/bookings', requireAuth, async (req, res, next) => {
  const spotId = req.params.spotId;
  const spot = await Spot.findByPk(spotId);
  if(!spot) {
    return res.status(404).json({ "message": "Spot couldn't be found" })
  };

  const bookingList = await Booking.findAll({
      where: {spotId},
      include: {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
      },
  });
  const booking = await Booking.findAll({
      where: {
          spotId: spotId,
      },
      attributes: ['spotId', 'startDate', 'endDate'],
  });

  if(req.user.id === spot.ownerId) {
      return res.status(200).json({Bookings: bookingList})
  } else {
      return res.status(200).json({ Bookings: booking});
  }

});

//Create a booking from spot based on spotId
router.post("/:spotId/bookings", requireAuth, async (req, res) => {
  let { spotId } = req.params;
  spotId = Number(spotId);

  const { user } = req;
  const userId = user.id;
  const { startDate: start, endDate: end } = req.body;
  const startDate = new Date(start);
  const endDate = new Date(end);

  const spot = await Spot.findByPk(spotId);
  // spot cant be found
  if (!spot) {
    res.statusCode = 404;
    res.json({ message: "Spot coudn't be found" });
  }

  // if spot owned by current user
  if (spot.ownerId === user.id) {
    res.statusCode = 403;
    return res.json({ message: "Forbidden" });
  }

  // endDate cant be before startDate
  if (endDate <= startDate) {
    res.title = "Bad Request";
    res.statusCode = 400;
    return res.json({
      message: "Bad Request",
      errors: { endDate: "endDate cannot be on or before startDate" },
    });
  }
  // booking conflict
  const bookings = await Booking.findAll({ where: { spotId } });
  for (let booking of bookings) {
    const bookedStart = new Date(booking.startDate);
    const bookedEnd = new Date(booking.endDate);


    if(startDate >= bookedStart && startDate <= bookedEnd) {
        return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
        }
    })
   }

   if(endDate >= bookedStart && endDate <= bookedEnd) {
    return res.status(403).json({
    message: "Sorry, this spot is already booked for the specified dates",
    errors: {
      endDate: "End date conflicts with an existing booking"
    }
  })
  }

  if(startDate <= bookedStart && endDate >= bookedEnd){
    return res.status(403).json(
      {
        "message": "Sorry, this spot is already booked for the specified dates",
        "errors": {
          "startDate": "Start date conflicts with an existing booking",
          "endDate": "End date conflicts with an existing booking"
        }
      }
    )
  }

  }

  const booking = await Booking.create({ spotId, userId, startDate, endDate });

  return res.status(200).json( booking );
});

// Get all Spots owned by the Current User
router.get('/current', requireAuth, async (req, res, next) => {

    const userId = req.user.id;
    const allSpots = await Spot.findAll({
      where: {
        ownerId: userId
      },
      include: [{
        model: SpotImage,
        required: false,
        where: {
          preview: true
        }
      },
      {
        model: Review,
        required: false

      }]
    })
        calculateRating(allSpots);
        setPreviewImage(allSpots);
        const returnResults = [];
        for (const spot of allSpots) {
          returnResults.push(pickAttributes(spot, spotAttributes))
        }
        return res.json({Spots: returnResults})



  });

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
    else {
        return res.status(404).json({ message: "Spot couldn't be found" });
    }
});



//Get all spots
router.get('/', validateQuery, async (req, res) => {
  const {query} = req;
  // minLat: decimal, optional
  // maxLat: decimal, optional
  // minLng: decimal, optional
  // maxLng: decimal, optional
  // minPrice: decimal, optional, minimum: 0
  // maxPrice: decimal, optional, minimum: 0
  const queryParams = {
    page: isQueryParamDefined(query.page) ? parseInt(query.page) : 1,
    size: isQueryParamDefined(query.size) ? parseInt(query.size) : 20
  }
  const paginatedWhere = formWhereQuery(queryParams)
    const allSpots = await Spot.findAll({
      limit: queryParams.size, // size
      offset: queryParams.size * (queryParams.page - 1), // size * (page - 1)
      where: formWhereQuery(query),
      include: [{
        model: SpotImage,
        required: false,
        where: {
          preview: true
        }
      },
      {
        model: Review,
        required: false

      }]
    });

    calculateRating(allSpots);
    setPreviewImage(allSpots);
    const returnResults = [];
    for (const spot of allSpots) {
      returnResults.push(pickAttributes(spot, spotAttributes))
    }
    return res.json({Spots: returnResults})
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
      } else return res.status(403).json({ message: "Forbidden" });
    } else return res.status(404).json({ message: "Spot couldn't be found!" });
  });

  // Create and return a new spot
router.post( '/', requireAuth, validateSpot, async (req, res) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const user = req.user;
    const newSpot = await Spot.create({ ownerId: user.id, address, city, state, country, lat, lng, name, description, price });
    return res.status(201).json(newSpot)
})

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
      } else return res.status(403).json({message: "Forbidden"});
    } else return res.status(404).json({message: "Spot couldn't be found"});
  });

  //Delete spot by Id
  router.delete("/:spotId", requireAuth, async (req, res, next) => {
    const user = req.user;
    const spotId = req.params.spotId;

    const currentSpot = await Spot.findByPk(spotId);

    if (currentSpot) {
      if (user.id === currentSpot.ownerId) {
        await currentSpot.destroy();
        return res.status(200).json({ message: "Successfully deleted" });
      } else return res.status(403).json({ message: "Forbidden" });
    } else return res.status(404).json({ message: "Spot couldn't be found" });
  });




module.exports = router;
