const axios = require("axios");

const utils = require('../utils');
const service = require('../services/pawchain')

const getTokenTransfers = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    const tokenTransfers = await service.getTokenTransfers(from, to);
    result = ({
       "status": 200,
       "value": tokenTransfers,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getLatestBlockTime = async(req, res) => {
  let result = {};
  try{
    const time = await service.getLatestBlockTime();
    result = ({
        "status": 200,
        "value": time,
        "msg": "Success"
    })
  }
  catch(error)
  {
    result = ({
       "status": 500,
       "error": "server network error"
    });
  }
  res.json(result);
}

const getNumberOfActiveUsers = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    const numberOfActiveUsers = await service.getNumberOfActiveUsers(from, to);
    result = ({
       "status": 200,
       "value": numberOfActiveUsers,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getTotalBridgeVolume = async (req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const totalBridgeVolume = await service.getTotalBridgeVolume(from, to);

    result = ({
       "status": 200,
       "value": totalBridgeVolume,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getTotalSwapVolume = async (req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const totalSwapVolume = await service.getTotalSwapVolume(from, to);

    result = ({
       "status": 200,
       "value": totalSwapVolume,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
};

const getNumberOfSwap = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const numberOfSwap = await service.getNumberOfSwap(from, to);

    result = ({
       "status": 200,
       "value": numberOfSwap,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getSwapVolumeByTokenPair = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  let pairId = "";
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
    pairId = req.query.pairId
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const swapVolumeByTokenPair = await service.getSwapVolumeByTokenPair(from, to, pairId);

    result = ({
       "status": 200,
       "value": swapVolumeByTokenPair,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getCrossChainSwapVolume = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const crossChainSwapVolume = await service.getCrossChainSwapVolume(from, to);

    result = ({
       "status": 200,
       "value": crossChainSwapVolume,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getOnChainSwapVolume = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const onChainSwapVolume = await service.getOnChainSwapVolume(from, to);

    result = ({
       "status": 200,
       "value": onChainSwapVolume,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getTotalFeesGenerated = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const totalFee = await service.getTotalFeesGenerated(from, to);
    result = ({
       "status": 200,
       "value": totalFee,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getSwapFeesCollected = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const totalFee = await service.getSwapFeesCollected(from, to);

    result = ({
       "status": 200,
       "value": totalFee,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getBridgeFeesCollected = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const totalFee = await service.getBridgeFeesCollected(from, to);

    result = ({
       "status": 200,
       "value": totalFee,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getUniqueWalletNamesSold = async(req, res) => {
  let result = {};

  let from = 0;
  let to = 0;
  try{
    to = req.query.lastest_time + 1;
    const period = req.query.period;
    from = to - period - 1;
  }
  catch(e){
    result = ({
      "status": 400,
      "error": "Bad Request"
    });
  }

  try{
    console.log(from + " ~ " + to);
    const numberOfSwap = await service.getUniqueWalletNamesSold(from, to);
    
    result = ({
       "status": 200,
       "value": numberOfSwap,
       "msg": "Success"
    })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    });
  }  
  res.json(result);
}

const getTotalValueLockedFromSummary = async(req, res) => {
  try{
    const tvl = await service.getTotalValueLockedFromSummary();
    result = ({
    "status": 200,
    "value": tvl,
    "msg": "Success"
    })
  }
  catch(e){
  result = ({
      "status": 500,
      "error": "server network error"
  })
  }
  res.json(result);
}

//added summary module api
const getSummary = async(req, res) => {
  try{
    const tvl = await service.getTotalValueLockedFromSummary();
    const activeUsers = await service.numberOfActiveUsers();
    const totalBridgeVolume = await service.totalBridgeVolume();
    const totalFeesGenerated = await service.totalFeesGenerated();
    result = ({
    "status": 200,
    "tvl": tvl,
    'activeUsers' : activeUsers,
    'totalBridgeVolume': totalBridgeVolume,
    'totalFeesGenerated': totalFeesGenerated,
    "msg": "Success"
    })
  }
  catch(e){
    console.log(e)
    result = ({
        "status": 500,
        "error": "server network error"
    })
  }
  res.json(result);
}

const getBridge = async(req, res) => {
  try{
    const bridgeData = await service.getTotalValueLockedFromBridge();
    result = ({
      "status": 200,
      'bridgeData' : bridgeData,
      "msg": "Success"
      })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    })
  }
  res.json(result);
}

const getTokenInfo = async(req, res) => {
  try{
    const totalSupply = await service.getPawTotalSupply();
    const pawTokensEachChain = await service.getTotalValueLockedFromPawToken();
    const pawBurnt = await service.getPawBurntTokens();
    console.log(pawBurnt);
    result = ({
      "status": 200,
      totalSupply,
      pawTokensEachChain,
      pawBurnt,
      "msg": "Success"
      })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    })
  }
  res.json(result);
}

const getPawWalletNamingService = async(req, res) => {
  const data = await service.getPawWalletNamingService();
  try{
    result = ({
      "status": 200,
      data,
      "msg": "Success"
      })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    })
  }
  res.json(result);
}

const getPawSwap = async(req, res) => {
  const data = await service.getPawSwap();
  try{
    result = ({
      "status": 200,
      data,
      "msg": "Success"
      })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    })
  }
  res.json(result);
}

const getTotalValueLocked = async(req, res) => {
  const data = await service.getTotalValueLocked();
  try{
    result = ({
      "status": 200,
      data,
      "msg": "Success"
      })
  }
  catch(e){
    result = ({
      "status": 500,
      "error": "server network error"
    })
  }
  res.json(result);
}

module.exports = {
  getTokenTransfers,
  getLatestBlockTime,
  getNumberOfActiveUsers,
  getTotalBridgeVolume,
  getTotalSwapVolume,
  getNumberOfSwap,
  getSwapVolumeByTokenPair,
  getCrossChainSwapVolume,
  getOnChainSwapVolume,
  getTotalFeesGenerated, 
  getSwapFeesCollected,
  getBridgeFeesCollected,
  getUniqueWalletNamesSold,
  getTotalValueLockedFromSummary,

  //main
  getSummary,
  getBridge,
  getTokenInfo,
  getPawWalletNamingService,
  getPawSwap,
  getTotalValueLocked
}