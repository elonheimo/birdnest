import React, { useEffect, useState} from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box
} from '@chakra-ui/react'
const DroneList = ({socket, allDronesURL}) => { 
    const [drones, setDrones] = useState([])

    

    useEffect(()=> {
        async function resetDrones(){
          const res = await fetch(allDronesURL)
          const json = await res.json()
          console.log(res)
          setDrones(json)
        }

        socket.on(
          "connect",
          () => resetDrones()
        )
        socket.on(
          "newDrone",
          data => setDrones([...drones, data]
        ))
        socket.on(
          "removeDrone",
          data => setDrones(
            drones.filter( drone => drone.serialNumber !== data.serialNumber)
          )
        )

        const updateDroneArray = (data) => {
          const sameDroneInUpdateData = (serialNumber) =>
            data.find(dataDrone => dataDrone.serialNumber === serialNumber) 
          setDrones(drones.map(
            drone => {
              const updatedDrone = sameDroneInUpdateData(drone.serialNumber) 
              return updatedDrone 
                ? updatedDrone
                : drone
            }
          ))
        }

        socket.on(
          "updateDrones",
          data => updateDroneArray(data)
        )
    }, [socket, drones, allDronesURL])

    if (drones.length === 0) {
      return ('loading')
    }
    return (
      <Box w='100%' p={10} overflowX="auto">

        <TableContainer borderWidth='1px' borderRadius='lg'>
          <Table variant='striped' colorScheme='telegram'>
            <Thead>
              <Tr>
                <Th>minNestDistance</Th>
                <Th>lastSeen</Th>
                <Th>Pilot name</Th>
                <Th>email</Th>
                <Th>phone</Th>
              </Tr>
            </Thead>
            <Tbody>
              
              {drones
                .map(drone => 
                <Tr key={drone.serialNumber}>
                  <Td>{drone.minNestDistance}</Td>
                  <Td>{new Date(drone.lastSeen).toLocaleTimeString()}</Td>
                  {drone.pilot &&
                    <>
                      <Td>{`${drone.pilot.firstName} ${drone.pilot.lastName}`}</Td>
                      <Td>{`${drone.pilot.email}`}</Td>
                    </>
                  }
                  <Td>{drone.pilot.phoneNumber}</Td>
                </Tr>
              )}
              
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    )
  }
  
  export default DroneList