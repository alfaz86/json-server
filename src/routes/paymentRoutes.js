const express = require('express');
const { redirectPaymentHandler, callbackPaymentHandler, setPaymentHandler } = require('../controllers/paymentController');
const router = express.Router();

router.post('/set', setPaymentHandler);
router.get('/redirect', redirectPaymentHandler);
router.post('/callback', callbackPaymentHandler);

module.exports = router;