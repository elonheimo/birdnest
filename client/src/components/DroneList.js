import React, { useEffect, useState, useMemo} from 'react'
import MaterialReactTable from 'material-react-table';
import { Box, Grid } from '@mui/material';

const DroneList = ({socket, allDronesURL}) => { 
    const [drones, setDrones] = useState([])
    
    useEffect(()=> {
        async function resetDrones(){
          const res = await fetch(allDronesURL)
          const json = await res.json()
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

    return (
      <Grid 
        sx={{ overflow: "auto" , maxWidth: 1200}}
      >
        <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
          <MaterialReactTable 
          columns={columns}
          data={drones}
          autoResetPageIndex={false}
          />
        </Box>
      </Grid>
    )
  }
  
  export default DroneList