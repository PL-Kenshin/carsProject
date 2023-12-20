const mongoose = require('mongoose')

const carSchema = mongoose.Schema({
    id:Number,
    batteryStatus:Number,
    motorRight:Number,
    motorLeft:Number,
    logDate:Date,
})

module.exports = mongoose.model('car', carSchema)