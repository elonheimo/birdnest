import socketIO from "socket.io-client"
import { ChakraProvider, theme, Heading, Container } from "@chakra-ui/react";
import DroneList from "./components/DroneList";
const socket = socketIO.connect("http://localhost:4000")
const allDronesURL = "http://localhost:4000/api/drones"
function App() {
  return (
    <ChakraProvider theme={theme}>
	  <Container maxW="6xl" h="100vh" justify="center" align="center">
      <Heading paddingTop={5}>Project birdnest</Heading>
  	  <DroneList socket={socket} allDronesURL={allDronesURL}/>
    </Container>
    </ChakraProvider>
  );
}

export default App;