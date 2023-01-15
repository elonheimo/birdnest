import React, { useEffect, useState} from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
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
        socket.on("newDrone", data => setDrones([...drones, data]))
        console.log(drones)
      }, [socket, drones])

    /*
    Add remove drone
    */

    if (drones.length === 0) {
      return ('loading')
    }
    return (
      <>
      <Box w='100%' p={10}>

        <TableContainer borderWidth='1px' borderRadius='lg'>
          <Table variant='striped' colorScheme='telegram'>
            <Thead>
              <Tr>
                <Th>minNestDistance</Th>
                <Th>lastSeen</Th>
                <Th>Serial number</Th>
              </Tr>
            </Thead>
            <Tbody>
              
              {drones
                .map(drone => 
                <Tr key={drone.serialNumber}>
                  <Td>{drone.minNestDistance}</Td>
                  <Td>{drone.lastSeen}</Td>
                  <Td>{drone.serialNumber}</Td>
                  {drone.pilot && console.log(drone.pilot) &&
                    <Td>{drone.pilot.firstName}</Td>
                  }
                </Tr>
              )}
              
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      {/* <div>
          {drones.map(drone => <li key={drone.id}>
            {JSON.stringify(drone)}
          </li>
          )}
        </div> */}
      </>
    )
  }
  
  export default DroneList