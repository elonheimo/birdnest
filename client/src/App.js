import socketIO from "socket.io-client"
import { ChakraProvider, theme, Heading, Container } from "@chakra-ui/react";
import DroneList from "./components/DroneList";
const socket = socketIO.connect("http://localhost:4000")
const initialLoadURL = "http://localhost:4000/api/drones"
function App() {
  return (
    <ChakraProvider theme={theme}>
	  <Container maxW="4xl" h="100vh" justify="center" align="center">
      <Heading paddingTop={5}>Project birdnest</Heading>
  	  <DroneList socket={socket} initialLoadURL={initialLoadURL}/>
    </Container>
    </ChakraProvider>
  );
}

export default App;