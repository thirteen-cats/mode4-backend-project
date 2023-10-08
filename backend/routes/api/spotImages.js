const express = require('express');
const router = express.Router();
const sequelize  = require('sequelize');
const { Op, Sequelize } = require('sequelize');
const { User, Spot, SpotImage, Review, ReviewImage, Booking  } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


//Delete a Spot Image
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const id = req.params.imageId;
    const user = req.user;
    const spotImage = await SpotImage.findByPk(id);
    if(!spotImage) {
        return res.status(404).json({ "message": "Spot Image couldn't be found" })
    };
    const spotId = spotImage.spotId;
    const currentSpot = await Spot.findByPk(spotId);


    if(user.id === currentSpot.ownerId) {
        spotImage.destroy();
        return res.status(200).json({ message: 'Successfully deleted'});
    } else return res.status(403).json({ message: "Forbidden!"});

});

module.exports = router;
