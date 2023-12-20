const express = require("express")
const app = express()
const cors = require("cors")
const http = require('http').Server(app);
const config = require('./config').config;
require('dotenv').config();
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});
const mongoose = require('mongoose')
const mongo = require('./service/mongo')
const carSchema = require('./schema/carSchema')

app.use(cors())

process.on('SIGINT', () => {
    mongoose.connection.close(function () {
        console.error('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`)

    socket.on("getAllCars", async (callback) => {
        try {
            let cars = await carSchema.find().sort({ "logDate": 1 }).limit(100)
            callback({
                cars: cars
            })
        } catch (e) {
            console.log('error sending data: ', e)
        }
    })

    socket.on("getSpecifiedCarData", async (id, callback) => {
        try {
            let carRecords = await carSchema.find({"id":id}).sort({"logDate": 1 }).limit(100)
            callback({
                carRecords: carRecords
            })
        } catch (e) {
            console.log('error sending data: ', e)
        }
    })

    socket.on("getCarIdList", async (callback) => {
        try {
            let carIdList = await carSchema.distinct("id")
            callback({
                carIdList: carIdList
            })
        } catch (e) {
            console.log('error sending data: ', e)
        }
    })

    socket.on("addCarLog", async (car) => {
        try {
            await carSchema.create(car)
            socket.broadcast.emit("newLog", (car))
        } catch (e) {
            console.log('error sending data to database: ', e)
        }
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected')
        socket.disconnect()
    });
});


http.listen(config.port, async () => {
    console.log(`Server listening on ${config.port}`);
    await mongo().then(async (mongoose) => {
        console.log('connected to database')
    })
});