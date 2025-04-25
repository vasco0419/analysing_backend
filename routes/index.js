const express = require('express')

const router = express.Router()
const ctrl = require('../controllers/pawchain')

//basic apis
router.get('/latestBlockTime', ctrl.getLatestBlockTime);
router.get('/tokenTransfers', ctrl.getTokenTransfers);

//test apis
router.get('/numberOfActiveUsers', ctrl.getNumberOfActiveUsers);
router.get('/totalBridgeVolume', ctrl.getTotalBridgeVolume);
router.get('/totalSwapVolume', ctrl.getTotalSwapVolume);
router.get('/numberOfSwap', ctrl.getNumberOfSwap);
router.get('/swapVolumeByTokenPair', ctrl.getSwapVolumeByTokenPair);
router.get('/crossChainSwapVolume', ctrl.getCrossChainSwapVolume);
router.get('/onChainSwapVolume', ctrl.getOnChainSwapVolume);
router.get('/totalFeeGenerated', ctrl.getTotalFeesGenerated);
router.get('/swapFessCollected', ctrl.getSwapFeesCollected);
router.get('/bridgeFeesCollected', ctrl.getBridgeFeesCollected);
router.get('/uniqueWalletNamesSold', ctrl.getUniqueWalletNamesSold);
router.get('/totalValueLoked', ctrl.getTotalValueLockedFromSummary);

//prod apis
router.get('/getSummary', ctrl.getSummary);
router.get('/getBridge', ctrl.getBridge);
router.get('/getTokenInfo', ctrl.getTokenInfo);
router.get('/getPawWalletNamingService', ctrl.getPawWalletNamingService);
router.get('/getPawSwap', ctrl.getPawSwap);
router.get('/getTotalValueLocked', ctrl.getTotalValueLocked);
module.exports = router;