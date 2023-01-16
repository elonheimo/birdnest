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
const DroneList = ({socket, initialLoadURL}) => { 
    const [drones, setDrones] = useState([])
    useEffect(() => {
      async function initialFetch(){
        const res = await fetch(initialLoadURL)
        const json = await res.json()
        console.log(res)
        setDrones(json)
      }
      initialFetch()
    }, [initialLoadURL])
    useEffect(()=> {
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
        socket.on(
          "updateDrones",
          data => {
            console.log(`updatedrones ${JSON.stringify(data)}`)
            const shouldBeUpdated = (serialNumber) => data
              .find(dataDrone => dataDrone.serialNumber === serialNumber) 
            setDrones(
              drones.map(
                drone => {
                  const updatedDrone = shouldBeUpdated(drone.serialNumber) 
                  return updatedDrone 
                    ? updatedDrone
                    : drone
                }
              )
            )
          }
        )
        console.log(drones)
      }, [socket, drones])

    /*
    Add remove drone
    */

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
                  <Td>{drone.lastSeen.slice(11,23)}</Td>
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