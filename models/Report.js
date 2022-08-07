const mongoose = require('mongoose')


const reportSchema = new mongoose.Schema({
    user:{
        type: String,
        reqiured: true
    },
    video:{
        type: String,
        reqiured: true
    },
    report:{
        type: String,
        reqiured: true
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Report', reportSchema)