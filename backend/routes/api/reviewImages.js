const express = require('express');
const router = express.Router();
const sequelize  = require('sequelize');
const { Op, Sequelize } = require('sequelize');
const { User, Spot, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
//Delete a Review Image
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const id = req.params.imageId;
    const user = req.user;
    const reviewImage = await ReviewImage.findByPk(id);
    if(!reviewImage) {
        //const err = new Error("Review Image couldn't be found");
        return res.status(404).json({ "message": "Review Image couldn't be found" })
    };
    const reviewId = reviewImage.reviewId;
    const reviews = await Review.findByPk(reviewId);



    if(user.id === reviews.userId) {
        reviewImage.destroy();
        return res.status(200).json({ message: 'Successfully deleted'});
    } else return res.status(403).json({ message: "Forbidden!"});
});

module.exports = router;
