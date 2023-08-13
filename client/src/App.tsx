import { useEffect, useState } from "react";
import { Container, Button, Stack, Group, TextInput } from "@mantine/core";
import io, { Socket } from "socket.io-client";
import axios from "axios";

function App() {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        axios.get("http://localhost:3000/rest").then((response) => console.log(response.data));
        setSocket(io("http://localhost:3000/socket"));
    }, []);

    const sendMessage = () => {
        if (socket === null) {
            console.error("Websocket connection has net been initialized");
            return;
        }
        socket.emit("message", "Hello from the client!");
    };

    return (
        <Container>
            <Stack>
                {}
                <Container>
                    <Group>
                        <TextInput/>                        
                        <Button>
                            Create counter
                        </Button>
                    </Group>
                </Container>
            </Stack>
            <h1>Mantine + Socket.IO Example</h1>
            <Button onClick={sendMessage}>Send Message</Button>
        </Container>
    );
}

export default App;
