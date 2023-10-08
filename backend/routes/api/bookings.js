const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const csrf = require('csurf');
const { User, Spot, SpotImage, Review, ReviewImage, Booking, sequelize } = require('../../db/models')
//const { check } = require('express-validator');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');
const { spotAttributes } = require('../constants');
const {setPreviewImage, pickAttributes } = require("../../utils/common");
// router.get('/current', requireAuth, async (req, res, next) => {
//     const userId = req.user.id;
//     const bookings = await Booking.findAll({
//         where: { userId: userId },
//         include: [
//             {
//                 model: Spot,
//                 attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price', 'previewImage'],
//             },
//         ],
//     });
//     return res.status(200).json( { Bookings: bookings });
// });

//Get all of the Current User's Bookings
router.get('/current', requireAuth, async (req, res) => {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Spot,
          required: false,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'description']
          },
          include: {
            model: SpotImage,
            required: false,
            attributes: ['url'],
            where: {
                preview: true
            },
            limit: 1
          },
        }
      ],
      where: { userId: req.user.id }
    })
    bookings

     const currSpotAttributes = spotAttributes.filter(attr => !["avgRating", "createdAt", "updatedAt", "description"].includes(attr));
    for (const booking of bookings) {
      const currSpot = booking.Spot;
      setPreviewImage([currSpot]);
      const modifiedSpot = pickAttributes(currSpot, currSpotAttributes);
      booking.dataValues.Spot = modifiedSpot;
    }

    // const print = bookings.map((booking) => {
    //   const temp = booking.toJSON();
    //   const final = {}

    //   if(temp.Spot.SpotImages.length > 0) {
    //     temp.Spot.previewImage = temp.Spot.SpotImages[0].url
    //   }
    //   else {
    //     temp.Spot.previewImage = ''
    //   }

    //   //placing in order
    //   final.id = temp.id;
    //   final.spotId = temp.spotId;
    //   final.Spot = temp.Spot;
    //   final.userId = temp.userId;
    //   final.startDate = temp.startDate;
    //   final.endDate = temp.endDate;
    //   final.createdAt = temp.createdAt;
    //   final.updatedAt = temp.updatedAt;

    //   delete final.Spot.SpotImages;
    //   return final;
    // });

    return res.json({Bookings: bookings});
  })

  router.delete('/:bookingId', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const {bookingId} = req.params;
    const booking = await Booking.findOne({
        where: {
           id: bookingId
       },
         include: {model: Spot}
    })

    // const
    if(!booking){
        return res.status(404).json(
            {
                "message": "Booking couldn't be found"
            }
        );
    }
    if(booking.userId === userId || booking.Spot.ownerId === userId){
        const now = new Date();
        const {startDate: start, endDate: end} = booking;
        const startDate = new Date(start);
        const endDate = new Date(end);

        if((now >= startDate && now <= endDate) || now > endDate){
            return res.status(403).json(
              {
                "message": "Bookings that have been started can't be deleted"
              });
        }else{
            await booking.destroy();
            return res.status(200).json(
                { "message": "Successfully deleted"}
                );
        }
    }else{
       return  res.status(403).json({
        message: "Forbidden"
       })
    }
    // const
  });

module.exports = router;
