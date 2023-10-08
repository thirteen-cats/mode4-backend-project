const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js');
const bookingsRouter = require('./bookings.js');
const reviewsRouter = require('./reviews.js');
const reviewsImageRouter = require('./reviewImages.js');
const spotImageRouter = require('./spotImages.js');
const { restoreUser, requireAuth } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);
router.use('/spots', spotsRouter);
router.use('/bookings', requireAuth, bookingsRouter);
router.use('/reviews', requireAuth, reviewsRouter);
router.use('/review-images', requireAuth, reviewsImageRouter);
router.use('/spot-images', requireAuth, spotImageRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;
