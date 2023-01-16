const axios = require('axios')

const { XMLParser } = require('fast-xml-parser')

const options = {
    ignoreAttributes: false
};

const parser = new XMLParser(options)

const URL = 'http://assignments.reaktor.com/birdnest/drones/'
const getPilotURL = (serialNumber) => `http://assignments.reaktor.com/birdnest/pilots/${serialNumber}`

const distFromBirdnest = (drone_x, drone_y) => {
    // distance = √[(x2 − x1)^2 + (y2 − y1)^2]
    const a = drone_x - 250_000
    const b = drone_y - 250_000
    return Math.floor(
        Math.sqrt(a * a + b * b)
    )
}
let drones = []

const getDrones = () => drones


const findDrone = (serialNumber) => {
    return drones.find(drone => drone.serialNumber === serialNumber)
}

const updateDronesInStorage = (oldDrones, socketIO) => {
    if (oldDrones.length === 0) {
        return
    }
    const updatedDrones = oldDrones.map((oldDrone) => {
        const sameDroneInStorage = findDrone(oldDrone.serialNumber)
        sameDroneInStorage.minNestDistance = Math.min(
            sameDroneInStorage.minNestDistance,
            oldDrone.minNestDistance
        )
        sameDroneInStorage.lastSeen = oldDrone.lastSeen
        return sameDroneInStorage
    })
    socketIO.emit(
        'updateDrones', updatedDrones
    )
}

const splitToOldAndNew = (resDrones) => {
    let oldDrones = [], newDrones = []

    resDrones.forEach((resDrone) => {
        if (findDrone(resDrone.serialNumber)) {
            oldDrones.push(resDrone)
        } else {
            newDrones.push(resDrone)
        }
    })
    return [oldDrones, newDrones]
}

async function getPilotInfo(drone) {
    let resultData = null
    try {
        let result = await axios.get(
            getPilotURL(drone.serialNumber),
            { timeout: 2000 }
        );
        resultData = result.data
        console.log(resultData)
    } catch (error) {
        console.log(error)
    }
    return resultData
}
const removeUselessFields = (droneArray) => droneArray
    .map(drone => {
        const {
            model,
            manufacturer,
            mac,
            ipv4,
            ipv6,
            altitude,
            firmware,
            ...droneWithoutFields
        } = drone
        return droneWithoutFields
    })

let oldestDroneSighting = new Date();
const updateOldestDroneSighting = () => {
    if (drones.length == 0) {
        return
    }
    oldestDroneSighting = drones.reduce(
        (oldest, current) => {
            if (current < oldest) {
                return current
            }
        }, new Date())
}
const removeOldDroneSightings = (socketIO) => {
    if (new Date() - oldestDroneSighting < 600_000) {
        return
    }
    const oldDrones = drones.filter(
        (drone) => (Date.now() - drone.lastSeen) > 600_000
    )
    oldDrones.forEach(drone => {
        socketIO.emit(
            'removeDrone', drone
        )
        drones = drones.filter(
            (toRemove) => toRemove.serialNumber !== drone.serialNumber
        )
    });
    updateOldestDroneSighting()
}

const startListeningDrones = (socketIO) => setInterval(async () => {
    let result = null
    try {
        result = await axios.get(URL, { timeout: 1900 })
    } catch (error) {
        console.log(error)
        return;
    }
    const parsedData = parser.parse(result.data)
    const resDrones = parsedData.report.capture.drone
    const time = new Date(parsedData.report.capture['@_snapshotTimestamp'])

    resDrones.forEach(drone => {
        drone.minNestDistance = distFromBirdnest(
            drone.positionX, drone.positionY
        )
        drone.lastSeen = time
    })

    const [resDronesOld, resDronesNew] = splitToOldAndNew(resDrones)

    let dronesToAdd = resDronesNew.filter(
        (drone) => drone.minNestDistance < 100_000
    )
    dronesToAdd = removeUselessFields(dronesToAdd)
    dronesToAdd.forEach(async drone => {
        drone.pilot = await getPilotInfo(drone)
        socketIO.emit(
            'newDrone', drone
        )
    })
    updateDronesInStorage(resDronesOld, socketIO)

    removeOldDroneSightings(socketIO)

    drones = drones.concat(dronesToAdd)
}, 2000)

module.exports = {
    getDrones, startListeningDrones
}