const express = require('express');
const { redirectPaymentHandler } = require('../controllers/paymentController');
const router = express.Router();

router.get('/redirect', redirectPaymentHandler);

module.exports = router;