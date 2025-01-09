const axios = require('axios');

// Fungsi untuk mendapatkan tanggal sekarang dalam format YYYY-MM-DD
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

exports.redirectPaymentHandler = async (req, res) => {
  const { appId } = req.query;
  if (!appId) {
    return res.status(400).json({ message: 'appId is required' });
  }

  try {
    const host = `${req.protocol}://${req.get('host')}`;
    const response = await axios.get(`${host}/db/redirect`);
    const redirectUrlList = response.data;

    // Filter untuk data dengan tanggal hari ini
    const todayDate = getCurrentDate();
    const filteredUrls = redirectUrlList.filter(
      item => item.appId === appId && item.date === todayDate
    );

    // Ambil entri terakhir jika ada lebih dari satu
    const redirectUrl = filteredUrls.length > 0 ? filteredUrls[filteredUrls.length - 1] : null;

    return redirectUrl
      ? res.redirect(redirectUrl.redirect_url)
      : res.status(404).json({ message: 'Redirect URL not found or not valid for today' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching redirect URL list' });
  }
};
