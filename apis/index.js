const axios = require("axios");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const assets = async(id) => {
  let bFlag = true;
  let result;
  while (bFlag) {
    await axios.get(`${process.env.BACKEND_API}/chart/asset`, {
      headers: {
        "x-api-key": process.env.PAW_API_KEY,
      },
      params: {id}, // Pass pairAddress in params
      timeout: 180000,
    }).then((res) => {
      result = res.data;
      bFlag = false;
    }).catch((error) => {
      console.error("Error: get Assets", error);
    });

    if (bFlag) await utils.delay(500);
  }

  return result;
}

module.exports = {
    delay,
    assets
}