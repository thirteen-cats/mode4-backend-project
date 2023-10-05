const express = require('express');

const { Spot } = require('../../db/models');

const router = express.Router();

router.post(
    '/',
    async (req, res) => {
        const {
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price
          } = req.body;
          const user = req.user;

          const newSpot = await Spot.create({ ownerId: user.id, address, city, state, country, lat, lng, name, description, price });

          return res.status(201).json(newSpot)
    })


module.exports = router;
