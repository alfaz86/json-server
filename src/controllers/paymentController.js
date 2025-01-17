const axios = require('axios');
const db = require('./../libs/database');

// Fungsi untuk mendapatkan tanggal sekarang dalam format YYYY-MM-DD
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getAppCode(req, methode) {
  // get the app code from order_id with prefix "XID-appCode.randomString-timestamp"
  // e.g. BID-Nj9k.EtPoUoLmzIoR-1732456620
  const orderId = methode === "GET" ? req.query.order_id : req.body.order_id;
  if (!orderId) {
    return null;
  }

  const appCode = orderId.split('-')[1].split('.')[0];
  return appCode;
}

exports.setPaymentHandler = async (req, res) => {
  const { app_code, redirect_url, callback_url, date } = req.body || {};
  if (!app_code || !redirect_url || !callback_url || !date) {
    return res.status(400).json({ message: 'app_code, redirect_url, callback_url and date are required' });
  }

  try {
    // Cek apakah app_code sudah ada di database
    const checkQuery = 'SELECT app_code FROM hooks WHERE app_code = ?';
    const [checkResult] = await db.query(checkQuery, [app_code]);

    if (checkResult.length > 0) {
      // update hooks
      const updateQuery = 'UPDATE hooks SET redirect_url = ?, callback_url = ?, date = ? WHERE app_code = ?';
      await db.query(updateQuery, [redirect_url, callback_url, date, app_code]);
    } else {
      const query = 'INSERT INTO hooks (app_code, redirect_url, callback_url, date) VALUES (?, ?, ?, ?)';
      await db.query(query, [app_code, redirect_url, callback_url, date]);
    }

    return res.status(201).json({ message: 'Payment hook has been set' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.redirectPaymentHandler = async (req, res) => {
  const app_code = getAppCode(req, "GET");
  if (!app_code) {
    return res.status(400).json({ message: 'app_code is required' });
  }

  try {
    const query = 'SELECT redirect_url FROM hooks WHERE app_code = ?';
    const [result] = await db.query(query, [app_code]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'app_code not found' });
    }

    const redirect_url = result[0].redirect_url;
    return res.redirect(redirect_url);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.callbackPaymentHandler = async (req, res) => {
  const app_code = getAppCode(req, "POST");
  if (!app_code) {
    return res.status(400).json({ message: 'app_code is required' });
  }

  try {
    const query = 'SELECT callback_url FROM hooks WHERE app_code = ?';
    const [result] = await db.query(query, [app_code]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'app_code not found' });
    }

    const callback_url = result[0].callback_url;
    const response = await axios.post(callback_url, req.body);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}