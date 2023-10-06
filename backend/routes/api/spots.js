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
        .withMessage("Name must be less than 50 characters"),
    check("description")
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
    check("price")
        .exists({ checkFalsy: true })
        .withMessage("Price per day is required"),
    handleValidationErrors,
  ];

router.get('/', async (req, res) => {
    const allSpots = await Spot.findAll();

    return res.json({Spots: allSpots})
})
// Create and return a new spot
router.post( '/',async (req, res) => {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;
        const user = req.user;
        const newSpot = await Spot.create({ ownerId: user.id, address, city, state, country, lat, lng, name, description, price });
        return res.status(201).json(newSpot)
    })


module.exports = router;
