const router = require('express').Router();

// GET /api/restore-user
//restoreUser middleware should be connected before any other middleware or route handlers are connected to the router.
const { restoreUser } = require('../../utils/auth.js');

router.use(restoreUser);






module.exports = router;
