const { getDrones, startListeningDrones } = require('./drones')
const express = require("express")
const cors = require("cors")
const app = express()
const http = require('http').Server(app);
app.use(cors())
const PORT = 4000
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

startListeningDrones(socketIO)

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)

    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
        socket.disconnect()
    });
});

app.get("/api/drones/", (req, res) => {
    res.json(getDrones())
});


http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});