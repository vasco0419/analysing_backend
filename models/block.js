const { any } = require('bluebird');
const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
    blockNo: {
        type: String
    },
    txs: {
        type: Array
    },
    validator_id: {
        type: Array
    },
    createdAt: {
        type: Number
    },
    tx_from:{
        type: String
    },
    tx_to: {
        type: String
    },
    tx_value: {
        type: Number
    },
    tx_tokenTransfer: {
        type: Array
    },
    tx_status: {
        type: String
    },
    status: {
        type: String
    },
    pair_id: {
        type: String
    },
    asset0In: {
        type: String
    },
    asset1Out: {
        type: String
    },
    asset0Out:{
        type: String
    },
    asset1In: {
        type: String
    },
    reserve0:{
        type: String
    },
    reserve1:{
        type: String
    },
    active_users:{
        type: Array    
    },
    wallet_names: {
        type: Array
    },
    bridge_Involume:{
        type: Number
    },
    bridge_Outvolume:{
        type: Number
    },
    swap_volume: {
        type: Number
    },
    cross_chain_swap_volume: {
        type: Number
    },
    on_chain_swap_volume: {
        type: Number
    },
    pawfee: {
        type: Number
    },
    usdfee: {
        type: Number
    },
    bridge_flag:{
        type:Number
    },
    swap_flag: {
        type: Number
    }
});

module.exports = mongoose.model("Block", BlockSchema);