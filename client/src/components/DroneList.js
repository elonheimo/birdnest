import React, { useEffect, useState, useMemo} from 'react'
import MaterialReactTable from 'material-react-table';

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

    const columns = useMemo(
      () => [
        { 
          accessorFn: (row) => (row.minNestDistance/1000.0).toFixed(2),
          id: 'minNestDistance',
          header: 'Closest to nest (meters)',
        }, {
          accessorFn: (row) => new Date(row.lastSeen).toLocaleTimeString(),
          id: 'lastSeen',
          header: 'Last seen',
        }, {
          accessorFn: 
          (row) => row.pilot
            ?`${row?.pilot?.firstName} ${row?.pilot?.lastName}`
            :`pilot info unavailable`,
          id: 'name',
          header: 'Name',
        }, {
          accessorFn: (row) => row?.pilot?.email,
          id: 'email',
          header: 'Email',
        }, {
          accessorFn: (row) => row?.pilot?.phoneNumber,
          id: 'phoneNumber',
          header: 'Phone number',
        }
      ],
      [],
      );
    /* if (drones.length === 0) {
      return ('loading')
    } */
    return (
      <MaterialReactTable columns={columns} data={drones} />
    )
    /* return (
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
                  <Td>{(drone.minNestDistance/1000.0).toFixed(2)}</Td>
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
    ) */
  }
  
  export default DroneList