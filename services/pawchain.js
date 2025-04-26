const axios = require("axios");
const utils = require('../utils');
const block = require('../models/block');
const tvl = require('../models/tvl');
const { chain } = require("lodash");
const apis = require("../apis");
const { BURN_WALLETS, PAW } = require("../config");

const getLatestBlockTime = async () => {
  const result = await block.findOne({},{createdAt: 1, _id: 0}).sort({ createdAt: -1 }); // Get latest document
  console.log(result);
  if (!result) return null;
  return result.createdAt;
};

const getTokenTransfers = async(from, to) => {
    let tokenTransfers;
    if(from == 0){
       tokenTransfers = await block.find(
        {  
        },
        { 
            tx_tokenTransfer: 1, _id: 0 
        }
      );
    }
    else{
       tokenTransfers = await block.find(
        { 
          $and: [ 
              { createdAt: { $gt: from } }, 
              { createdAt: { $lt: to } } 
          ]
        },
        { 
            tx_tokenTransfer: 1, _id: 0 
        }
      );
    }
    
    return tokenTransfers;
};

const getNumberOfActiveUsers = async (from, to) => {
  const match = from === 0 ? {} : {
    createdAt: {
      $gt: from,
      $lt: to
    }
  };

  const results = await block.aggregate([
    { $match: match },
    { $project: { active_users: 1 } },
    { $unwind: "$active_users" },
    { $match: { active_users: { $ne: null } } },
    { $group: { _id: "$active_users" } },
    { $count: "uniqueUsers" }
  ]);

  return results.length > 0 ? results[0].uniqueUsers : 0;
};

const numberOfActiveUsers = async () => {
  const latestBlock = await block.findOne({}).sort({ createdAt: -1 });

  if (!latestBlock) {
    return {
      latestUserCount: 0,
      latest24hUserCount: 0,
      activeUserCountList: Array(7).fill(0),
    };
  }

  const latestUserCount = await getNumberOfActiveUsers(0, latestBlock.createdAt);

  const threshold24h = latestBlock.createdAt - 24 * 3600 * 1000;
  const latest24hUserCount = await getNumberOfActiveUsers(threshold24h, latestBlock.createdAt);
  const now = new Date();
  const dayNumber = now.getDay();
  const hourOffset = 7 + dayNumber;
  const dynamicThresholdTime = latestBlock.createdAt - hourOffset * 24 * 3600 * 1000;

  // Use Promise.all to collect all counts in a separate array
  const activeUserCountList = await Promise.all(
    Array.from({ length: 7 }).map(async (_, index) => {
      const from = dynamicThresholdTime + index * 24 * 3600 * 1000;
      const to = dynamicThresholdTime + (index + 1) * 24 * 3600 * 1000;
      const count = await getNumberOfActiveUsers(from, to);
      return typeof count === 'number' ? count : 0;
    })
  );

  //console.log(activeUserCountList);
  return {
    latestUserCount: latestUserCount,
    latest24hUserCount: latest24hUserCount,
    activeUserCountList: activeUserCountList,
  };
};

const getTotalBridgeVolume = async (from, to) => {
  const match = from === 0 ? {} : {
    createdAt: {
      $gt: from,
      $lt: to
    }
  };

  const result = await block.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $add: ["$bridge_Involume", "$bridge_Outvolume"]
          }
        }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

const getTotalBridgeEachVolume = async (from, to) => {
  const match = from === 0 ? {} : {
    createdAt: {
      $gt: from,
      $lte: to
    }
  };

  const result = await block.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalBridgeIn: { $sum: "$bridge_Involume" },
        totalBridgeOut: { $sum: "$bridge_Outvolume"}
      }
    }
  ]);

  return {
    totalBridgeIn: result[0]?.totalBridgeIn || 0,
    totalBridgeOut: result[0]?.totalBridgeOut || 0
  };
};

const totalBridgeVolume = async () => {
  const latestBlock = await block.findOne({}).sort({ createdAt: -1 });
  if (!latestBlock) {
    return {
      latestBridgeVolume: 0,
      latest24hBridgeVolume: 0,
      bridgeVolumeList: Array(7).fill(0),
    };
  }

  const createdAtTime = new Date(latestBlock.createdAt).getTime();

  const latestBridgeVolume = await getTotalBridgeVolume(0, createdAtTime);

  const threshold24h = createdAtTime - 24 * 3600 * 1000;
  const latest24hBridgeVolume = await getTotalBridgeVolume(threshold24h, createdAtTime);

  const now = new Date();
  const dayNumber = now.getDay();
  const hourOffset = 7 + dayNumber;
  const dynamicThresholdTime = createdAtTime - hourOffset * 24 * 3600 * 1000;

  const bridgeVolumeList = await Promise.all(
    Array.from({ length: 7 }).map(async (_, index) => {
      const from = dynamicThresholdTime + index * 24 * 3600 * 1000;
      const to = dynamicThresholdTime + (index + 1) * 24 * 3600 * 1000;
      const volume = await getTotalBridgeVolume(from, to);
      return typeof volume === 'number' ? volume : 0;
    })
  );

  return {
    latestBridgeVolume,
    latest24hBridgeVolume,
    bridgeVolumeList,
  };
};

const getTotalSwapVolume = async (from, to) => {
  const pipeline = [
    ...(from !== 0 ? [{ $match: { createdAt: { $gt: from, $lt: to } } }] : []),
    { $group: { _id: null, total: { $sum: "$swap_volume" } } }
  ];

  const result = await block.aggregate(pipeline);
  return result[0]?.total || 0;
};

const getNumberOfSwap = async (from, to) => {
  const query = from === 0
    ? { swap_flag: 1 }
    : {
        createdAt: { $gt: from, $lt: to },
        swap_flag: 1
      };

  const count = await block.countDocuments(query);
  return count;
};

const getSwapVolumeByAllTokenPairs = async (from, to) => {
  let pipeline = [];

  // Match the date range if 'from' and 'to' are provided
  if (from !== 0 || to !== 0) {
    pipeline.push({
      $match: {
        createdAt: { $gt: from, $lt: to },
      },
    });
  }

  // Group by 'pair_id' and sum 'swap_volume'
  pipeline.push({
    $group: {
      _id: "$pair_id",               // Group by 'pair_id'
      totalSwapVolume: { $sum: "$swap_volume" },  // Sum swap volumes
    },
  });

  // Sort by totalSwapVolume in descending order
  pipeline.push({
    $sort: {
      totalSwapVolume: -1,   // -1 for descending order
    },
  });

  // Execute the aggregation pipeline
  const result = await block.aggregate(pipeline).limit(5);

  // Return the result
  return result;
};

const getCrossChainSwapVolume = async (from, to) => {
  const pipeline = [
    ...(from !== 0 ? [{ $match: { createdAt: { $gt: from, $lt: to } } }] : []),
    { $group: { _id: null, total: { $sum: "$cross_chain_swap_volume" } } }
  ];

  const result = await block.aggregate(pipeline);
  return result[0]?.total || 0;
};

const getOnChainSwapVolume = async (from, to) => {
  const pipeline = [
    ...(from !== 0 ? [{ $match: { createdAt: { $gt: from, $lt: to } } }] : []),
    { $group: { _id: null, total: { $sum: "$on_chain_swap_volume" } } }
  ];

  const result = await block.aggregate(pipeline);
  return result[0]?.total || 0;
};

const getTotalFeesGenerated = async (from, to) => {
  const matchStage = from === 0 ? {} : {
    createdAt: { $gt: from, $lt: to }
  };

  const result = await block.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalUsdFee: { $sum: "$usdfee" },
        totalPawFee: { $sum: "$pawfee" }
      }
    }
  ]);

  return {
    usdFee: result[0]?.totalUsdFee || 0,
    pawFee: result[0]?.totalPawFee || 0
  };
};

const totalFeesGenerated = async(from, to) => {
  const latestBlock = await block.findOne({}).sort({ createdAt: -1 });
  if (!latestBlock) {
    return {
      latestBridgeVolume: 0,
      latest24hBridgeVolume: 0,
      bridgeVolumeList: Array(7).fill(0),
    };
  }

  const createdAtTime = new Date(latestBlock.createdAt).getTime();

  const latestFeesVolume = await getTotalFeesGenerated(0, createdAtTime);

  const threshold24h = createdAtTime - 24 * 3600 * 1000;
  const latest24hFeesVolume = await getTotalFeesGenerated(threshold24h, createdAtTime);

  const now = new Date();
  const dayNumber = now.getDay();
  const hourOffset = 7 + dayNumber;
  const dynamicThresholdTime = createdAtTime - hourOffset * 24 * 3600 * 1000;

  const feesVolumeList = await Promise.all(
    Array.from({ length: 7 }).map(async (_, index) => {
      const from = dynamicThresholdTime + index * 24 * 3600 * 1000;
      const to = dynamicThresholdTime + (index + 1) * 24 * 3600 * 1000;
      const volume = await getTotalFeesGenerated(from, to);
      return volume
    })
  );

  return {
    latestFeesVolume,
    latest24hFeesVolume,
    feesVolumeList,
  };
}

const getSwapFeesCollected = async (from, to) => {
  const matchStage = from === 0
    ? {} // No time filter
    : {
        createdAt: { $gt: from, $lt: to },
        swap_flag: 1
      };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalUsdFee: { $sum: "$usdfee" },
        totalPawFee: { $sum: "$pawfee" }
      }
    }
  ];

  const result = await block.aggregate(pipeline);

  return {
    usdFee: result[0]?.totalUsdFee || 0,
    pawFee: result[0]?.totalPawFee || 0
  };
};

const getBridgeFeesCollected = async (from, to) => {
  const matchStage = from === 0
    ? {}
    : {
        createdAt: { $gt: from, $lt: to },
        bridge_flag: { $eq: 1 }
      };

  const result = await block.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalUsdFee: { $sum: "$usdfee" },
        totalPawFee: { $sum: "$pawfee" }
      }
    }
  ]);

  const { totalUsdFee = 0, totalPawFee = 0 } = result[0] || {};

  return { usdFee: totalUsdFee, pawFee: totalPawFee };
};

const getUniqueWalletNamesSold = async(from, to) => {
  const pipeline = [
    ...(from !== 0 ? [
      { $match: { createdAt: { $gt: from, $lt: to } } }
    ] : []),
    { $unwind: "$wallet_names" },
    { $group: { _id: "$wallet_names" } }
  ];
  
  const result = await block.aggregate(pipeline);
  const uniqueWallets = result
    .map(r => r._id)
    .filter(wallet => wallet !== null); // Remove null values
  
  return uniqueWallets;
}

const getTotalWalletNamesSold = async (from, to) => {
  const pipeline = [
    ...(from && to ? [{ $match: { createdAt: { $gt: from, $lt: to } } }] : []),
    { $match: { wallet_names: { $ne: null } } },
    { $group: { _id: null, allWallets: { $addToSet: "$wallet_names" } } },
    { $project: { _id: 0, allWallets: 1 } }
  ];

  const result = await block.aggregate(pipeline);
  const totalWalletList = result[0]?.allWallets || [];

  return totalWalletList;
};

const getTxCount = async (from, to) => {
  const result = await block.aggregate([
    { $match: { createdAt: { $gt: from, $lt: to } } },
    { $project: { count: { $size: "$txs" } } },
    { $group: { _id: null, total: { $sum: "$count" } } }
  ]);

  return result[0]?.total || 0;
};

const getTotalValueLockedFromSummary = async () => {
  // Step 1: Get the latest TVL entry
  let latestTvl = await tvl.findOne({}).sort({ createdAt: -1 });

  if (!latestTvl) return { latestTvl: 0, latestPaw: 0, latestPawPrice: 0, liquidityHeld: 0, latest24hTvl: 0, latest24hPaw: 0, 
                          latest24hPawPrice: 0, latest24hLiquidityHeld: 0, 
                          tvlList: Array(7).fill({tvlValue: 0, pawTokens: 0, pawPrice: 0, liquidityHeld: 0}) };
  
  // Step 2: Calculate 24h threshold
  let threshold_time = latestTvl.createdAt - 24 * 3600 * 1000;
  let latest24hTvl = await tvl.findOne({ createdAt: { $gt: threshold_time } }).sort({ createdAt: -1 });
  // Step 3: Calculate dynamic threshold by weekday
  const now = new Date();
  const dayNumber = now.getDay();
  const hourOffset = 7 + dayNumber; // 0 (Sun) → 7, 6 (Sat) → 13
  threshold_time = latestTvl.createdAt - hourOffset * 24 * 3600 * 1000;

  // Step 4: Get past 7 TVLs with dayFlag == 1
  let tvlList = await tvl.find({
    createdAt: { $gt: threshold_time },
    dayFlag: 1
  }, {tvlValue: 1, pawTokens: 1, pawPrice: 1, liquidityHeld: 1, latestTxCount: 1, _id: 0}).sort({ createdAt: 1 }).limit(7);
  
  // Step 5: Pad the list to 7 entries with 0s at the front
  while (tvlList.length < 7) {
    tvlList.unshift({tvlValue: 0, pawTokens: 0, pawPrice: 0, liquidityHeld: 0});
  }

  let latestBlock = await block.findOne({}, {createdAt:1}).sort({createdAt: -1});
  let latestTx = await getTxCount(0, latestBlock.createdAt);
  let latestTx24h = await getTxCount(latestBlock.createdAt - 24 * 3600 * 1000, latestBlock.createdAt);
  
  threshold_time = latestBlock.createdAt - hourOffset * 24 * 3600 * 1000;
  
  const txCountList = await Promise.all(
    Array.from({ length: 7 }).map((_, index) => {
      const from = threshold_time + index * 24 * 3600 * 1000;
      const to = threshold_time + (index + 1) * 24 * 3600 * 1000;
      return getTxCount(from, to).then(txCount => ({ txCount }));
    })
  );

  return {
    latestTvl: latestTvl.tvlValue,
    latestPaw: latestTvl.pawTokens,
    latestPawPrice: latestTvl.pawPrice,
    latestLiquidityHeld: latestTvl.liquidityHeld,
    latestTx: latestTx,
    latest24hTvl: latestTvl.tvlValue - latest24hTvl.tvlValue || 0,
    latest24hPaw: latestTvl.pawTokens - latest24hTvl.pawTokens || 0,
    latest24hPawPrice: latestTvl.pawPrice - latest24hTvl.pawPrice || 0,
    latest24hLiquidityHeld: latestTvl.liquidityHeld - latest24hTvl.liquidityHeld || 0,
    latestTx24: latestTx24h,  
    tvlList,
    txCountList
  };
};

const getTotalValueLockedFromBridge = async () => {
  let latestTvl = await tvl.findOne({}).sort({ createdAt: -1 });
  let latestBlock = await tvl.findOne({}).sort({ createdAt: -1 });

  let threshold_time = latestBlock.createdAt - 24 * 3600 * 1000;
  
  const totalBridgeFees = await getBridgeFeesCollected(0, latestBlock.createdAt);
  const todayBridgeFees = await getBridgeFeesCollected(threshold_time, latestBlock.createdAt);
  const bridge24h = await getTotalBridgeEachVolume(threshold_time, latestBlock.createdAt);
  threshold_time = latestBlock.createdAt - 7 * 24 * 3600 * 1000;
  const bridge7d = await getTotalBridgeEachVolume(threshold_time, latestBlock.createdAt);

  const now = new Date();
  const totalBridgeVolumeList = await Promise.all(
    Array.from({ length: 24 }).map(async (_, index) => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const fromYear = targetDate.getFullYear();
      const fromMonth = targetDate.getMonth();
      const from = new Date(fromYear, fromMonth, 1, 0, 0, 0).getTime();
      const to = new Date(fromYear, fromMonth + 1, 1, 0, 0, 0).getTime(); // next month

      const bridgeVolume = await getTotalBridgeEachVolume(from, to);
      return {
        month: `${fromYear}/${String(fromMonth + 1).padStart(2, '0')}`,
        bridgeVolume
      };
    })
  );

  const totalBridgeFeeList = await Promise.all(
    Array.from({ length: 24 }).map(async (_, index) => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const fromYear = targetDate.getFullYear();
      const fromMonth = targetDate.getMonth();
      const from = new Date(fromYear, fromMonth, 1, 0, 0, 0).getTime();
      const to = new Date(fromYear, fromMonth + 1, 1, 0, 0, 0).getTime(); // next month

      const bridgeFee = await getBridgeFeesCollected(from, to);
      return {
        month: `${fromYear}/${String(fromMonth + 1).padStart(2, '0')}`,
        bridgeFee
      };
    })
  );

  return {
    latestEachTvl: !latestTvl ? 0 : latestTvl.eachTvlData,
    totalValueLocked: latestTvl.tvlValue, 
    totalPawLocked: latestTvl.pawValue,
    totalBridgeFees: totalBridgeFees,
    todayBridgeFees: todayBridgeFees,
    total24hBridgeInVolume: bridge24h.totalBridgeIn,
    total24hBridgeOutVolume: bridge24h.totalBridgeOut,
    total7dBridgeInVolume: bridge7d.totalBridgeIn,
    total7dBridgeOutVolume: bridge7d.totalBridgeOut,
    totalBridgeVolumeList: totalBridgeVolumeList,
    totalBridgeFeeList: totalBridgeFeeList
  };
}

const getPawTotalSupply = async() => {
  const PAW_ADDRESS = 'pawx00000000000000000000000000000000000000000000000000';
  const result = await apis.assets(PAW_ADDRESS);
  return result.asset.totalSupply;
}

const getTotalValueLockedFromPawToken = async () => {
  // Step 1: Get the latest TVL entry
  let latestTvl = await tvl.findOne({}).sort({ createdAt: -1 });
   
  return {
    eachTvlData: latestTvl.eachTvlData,
    latestPaw: latestTvl.pawTokens,
  };
};

const getPawBurntTokens = async() => {
  const burnTxs = await block.find(
    {active_users: { $in: BURN_WALLETS },
    tx_tokenTransfer: {
      $elemMatch: { token_address: PAW }
    }}, {tx_tokenTransfer: 1, createdAt: 1, _id: 0}
  ).lean();

  let burntPawTokens = 0;
  for(let i = 0; i < burnTxs.length; i++){
      burntPawTokens += parseFloat(burnTxs[i].tx_tokenTransfer[0].value);
  }

  return {
    BURN_WALLETS,
    burntPawTokens,
    burnTxs, 
  };
}

const getPawWalletNamingService = async() => {
  const latestBlock = await block.findOne({}).sort({ createdAt: -1 });
  const uniqueWalletNameSold = await getUniqueWalletNamesSold(0, latestBlock.createdAt);
  const totalWalletNameSold = await getTotalWalletNamesSold(0, latestBlock.createdAt);
  const walletNamesRenewed = uniqueWalletNameSold.length;
  const totalFeeGenerated = await getTotalFeesGenerated(0, latestBlock.createdAt);
  const pawFeeCollected = totalFeeGenerated.pawFee;
  
  let threshold_time = latestBlock.createdAt - 24 * 3600 * 1000;
  let todayWalletSold = await getUniqueWalletNamesSold(threshold_time, latestBlock.createdAt);

  const now = new Date();
  const dayNumber = now.getDay();
  const hourOffset = 7 + dayNumber; // 0 (Sun) → 7, 6 (Sat) → 13
  threshold_time = latestBlock.createdAt - hourOffset * 24 * 3600 * 1000;

  let pawFeeList = [];
  for(let i = 0; i < 7; i++){
    let from = threshold_time + i * 24* 3600 * 1000;
    let to = threshold_time + (i+1) * 24* 3600 * 1000;
    const fee = await getTotalFeesGenerated(from, to);
    pawFeeList.push(fee.pawFee);
  } 
  
  let blocks = await block.find(
    { wallet_names: { $in: uniqueWalletNameSold } }, // Match if any wallet name exists in the list
    { txs: 1, active_users: 1, wallet_names: 1, _id: 0 } // Project only required fields
  ).sort({ createdAt: -1 }).limit(10);

  let txRecord = [];

  for(let i = 0; i< blocks.length; i++){
    txRecord.push({txId:blocks[i].txs[0],  walletAddress: blocks[i].active_users[0], walletName: blocks[i].wallet_names[0]})
  }

  return {
    uniqueWalletNameSold,
    walletNamesRenewed,
    totalWalletNameSold,
    todayWalletSold,
    pawFeeCollected,
    pawFeeList,
    txRecord
  };
}

const getPawSwap = async() => {
  const latestBlock = await block.findOne({}).sort({ createdAt: -1 });
  const totalSwapVolume = await getTotalSwapVolume(0, latestBlock.createdAt);
  const crossChainSwapVolume = await getCrossChainSwapVolume(0, latestBlock.createdAt);
  const onChainSwapVolume = await getOnChainSwapVolume(0, latestBlock.createdAt);
  const totalSwapFee = await getSwapFeesCollected(0, latestBlock.createdAt);
  const swapFeeCollected = totalSwapFee.pawFee;

  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const fromYear = targetDate.getFullYear();
  const fromMonth = targetDate.getMonth();
  
  let from = new Date(fromYear, fromMonth, 1, 0, 0, 0).getTime();
  let to = new Date(fromYear, fromMonth + 1, 1, 0, 0, 0).getTime(); // next month
  const pastSwapVolume = await getTotalSwapVolume(from, to);

  from = new Date(fromYear, fromMonth + 1, 1, 0, 0, 0).getTime();
  to = new Date(fromYear, fromMonth + 2, 1, 0, 0, 0).getTime(); // next month
  const currentSwapVolume = await getTotalSwapVolume(from, to);

  const swapGrowthRate = ((currentSwapVolume - pastSwapVolume) * 100 / pastSwapVolume).toFixed(2);
  
  const swapCountList = await Promise.all(
    Array.from({ length: 12 }).map(async (_, index) => {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const fromYear = targetDate.getFullYear();
      const fromMonth = targetDate.getMonth();
      const from = new Date(fromYear, fromMonth, 1, 0, 0, 0).getTime();
      const to = new Date(fromYear, fromMonth + 1, 1, 0, 0, 0).getTime(); // next month
      const Count = await getNumberOfSwap(from, to);
      return {
        time: `${fromYear}/${String(fromMonth + 1).padStart(2, '0')}`,
        Count
      };
    })
  );

  const eachSwapVolumes = await getSwapVolumeByAllTokenPairs(0, latestBlock.createdAt);

  return {
    crossChainSwapVolume,
    onChainSwapVolume,
    totalSwapVolume,
    swapFeeCollected,
    swapGrowthRate,
    swapCountList,
    eachSwapVolumes
  };
} 

const getTotalValueLocked = async () => {
  const latestTvl = await tvl.findOne({}).sort({ createdAt: -1 });

  // Get the liquidity pool data and calculate the sum of priceA + priceB for each pool
  let poolData = latestTvl.liquidityPools
    .map(pool => ({
      name: pool.pair_address,
      value: pool.priceA + pool.priceB
    }))
    .sort((a, b) => b.value - a.value) // Sort the pools by value in descending order
    .slice(0, 5); // Limit to top 5 pools

  // Calculate the total sum of priceA + priceB for all pools
  const totalPoolValue = latestTvl.liquidityPools.reduce((sum, pool) => sum + pool.priceA + pool.priceB, 0);

  const pawValue = latestTvl.pawValue;

  return {
    pawValue,
    poolData,
    totalPoolValue // Return the sum of all priceA + priceB values
  };
};

module.exports = {
  getLatestBlockTime,
  getTokenTransfers,
  getNumberOfActiveUsers,
  numberOfActiveUsers,
  getTotalBridgeVolume,
  getTotalBridgeEachVolume,
  totalBridgeVolume,  
  getTotalSwapVolume,
  getNumberOfSwap,
  getSwapVolumeByAllTokenPairs,
  getCrossChainSwapVolume,
  getOnChainSwapVolume,
  getTotalFeesGenerated,
  totalFeesGenerated, 
  getSwapFeesCollected,
  getBridgeFeesCollected,
  getUniqueWalletNamesSold,
  getTotalWalletNamesSold,
  getTxCount, 
  getTotalValueLockedFromSummary, 
  getTotalValueLockedFromBridge,  
  getPawTotalSupply,     
  getTotalValueLockedFromPawToken,  
  getPawBurntTokens, 
  getPawWalletNamingService,
  getPawSwap,
  getTotalValueLocked 
}

