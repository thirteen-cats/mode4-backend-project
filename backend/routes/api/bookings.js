const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const csrf = require('csurf');
const { Spot, User, Review, Image, Booking, sequelize } = require('../../db/models')
//const { check } = require('express-validator');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation');







module.exports = router;
