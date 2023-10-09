const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const csrf = require('csurf');
const { User, Spot, SpotImage, Review, ReviewImage, Booking, sequelize } = require('../../db/models')
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');
const { spotAttributes } = require('../constants');
const {setPreviewImage, pickAttributes } = require("../../utils/common");

router.put("/:bookingId", requireAuth, async (req, res) => {

    // let { spotId } = req.params;
    let { bookingId } = req.params;
    bookingId = Number(bookingId);

    const { user } = req;
    const userId = user.id;
    const { startDate: start, endDate: end } = req.body;

    const startDate = new Date(start);
    const endDate = new Date(end);
     // endDate cant be before startDate
     if (endDate <= startDate) {
        res.title = "Bad Request";
        res.statusCode = 400;
        return res.json({
          message: "Bad Request",
          errors: { endDate: "endDate cannot be on or before startDate" },
        });
    }

    const currBooking = await Booking.findOne({
        where: {id: bookingId}
    });
    if(!currBooking){
        return res.status(404).json({message: "Booking couldn't be found" })
    }
    if(currBooking.userId === userId){
        const adjacentBooking = await Booking.findAll({
            where: {spotId: currBooking.spotId, id: {[Op.not]: currBooking.id}}
        })

        for (let booking of adjacentBooking) {
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
        currBooking.startDate = start;
        currBooking.endDate = end;

        await currBooking.save();
        return res.status(200).json(currBooking);
    }else{
        return res.status(403).json({message: "Forbidden" })
    }
  });
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

  });

module.exports = router;
