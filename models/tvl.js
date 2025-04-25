const { any } = require('bluebird');
const mongoose = require('mongoose');

const TVLSchema = new mongoose.Schema({
    eachTvlData: {
        type: JSON
    },
    tvlValue:{
        type: Number
    },
    pawValue:{
        type: Number
    },
    pawTokens:{
        type: Number
    },
    pawPrice:{
       type: Number
    },
    liquidityHeld:{
       type: Number
    },
    liquidityPools:{
       type:Array
    },
    createdAt: {
        type: Number
    },
    dayFlag: {
        type: Number
    }
});

module.exports = mongoose.model("TVL", TVLSchema);