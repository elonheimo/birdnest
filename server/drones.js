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

var drones = []
const getDrones = () => drones

const droneFilter = (drone) => {
    const sameDroneInStorage = drones
        .find(x => x.serialNumber === drone.serialNumber)
    if (sameDroneInStorage) {
        sameDroneInStorage.minNestDistance = Math.min(
            sameDroneInStorage.minNestDistance,
            drone.minNestDistance
        )
        sameDroneInStorage.lastSeen = drone.lastSeen
        return false
    }
    return drone.minNestDistance < 100_000
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

const startListeningDrones = (socketIO) => setInterval(async () => {
    let result = null
    try {
        result = await axios.get(URL, { timeout: 2000 })
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

    let dronesToAdd = resDrones.filter(droneFilter)
    dronesToAdd = removeUselessFields(dronesToAdd)
    dronesToAdd.forEach(async drone => {
        drone.pilot = await getPilotInfo(drone)
        socketIO.emit(
            'newDrone', drone
        )
    })

    drones = drones.concat(dronesToAdd)
}, 2000)

module.exports = {
    getDrones, startListeningDrones
}