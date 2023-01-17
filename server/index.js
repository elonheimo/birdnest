const { getDrones, startListeningDrones } = require('./drones')
const express = require("express")
const cors = require("cors")
const app = express()
const server = require('http').createServer(app);
app.use(cors())
app.use(express.static('build'))
const PORT = process.env.PORT || 3000
const socketIO = require('socket.io')(server);

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


server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
