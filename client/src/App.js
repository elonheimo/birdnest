import { Link, Stack, Typography } from "@mui/material";
import socketIO from "socket.io-client"
import DroneList from "./components/DroneList";
const socket = socketIO.connect("http://localhost:4000")
const allDronesURL = "http://localhost:4000/api/drones"
function App() {
  return (
    <Stack alignItems="center" spacing={2}>
      <Typography variant="h2" gutterBottom>Project birdnest</Typography>
      <DroneList socket={socket} allDronesURL={allDronesURL}/>
      <Link href="https://github.com/elonheimo/birdnest" color="inherit" underline="hover"> <Typography variant="h6">Checkout my github </Typography></Link>
    </Stack>
  );
}

export default App;