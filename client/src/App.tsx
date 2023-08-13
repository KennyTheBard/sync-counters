import { useEffect, useState } from "react";
import { Container } from "@mantine/core";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import {
    Counter,
    CreateCounterEvent,
    DecrementCounterEvent,
    DeleteCounterEvent,
    IncrementCounterEvent,
    SyncEvent,
    SynchronizationState,
    WithTimestamp,
    applyEvents,
    mergeEvents,
} from "common";
import { CounterCard } from "./components/CounterCard";
import { v4 as uuid } from "uuid";
import { CreateCounterForm } from "./components/CreateCounterForm";

function App() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [syncState, setSyncState] = useState<SynchronizationState | null>(
        null
    );
    const [localEvents, setLocalEvent] = useState<WithTimestamp<SyncEvent>[]>(
        []
    );

    useEffect(() => {
        axios
            .get("http://localhost:3000/rest")
            .then((response) => setSyncState(response.data));
        setSocket(io("http://localhost:3000")); // TODO: listen to messages
    }, []);

    const sendMessage = (event: SyncEvent) => {
        if (socket === null) {
            console.error("Websocket connection has net been initialized");
            return;
        }
        setLocalEvent([
            ...localEvents,
            {
                ...event,
                ts: new Date().getTime()
            }
        ]); // TODO: reconcile local and synced events
        socket.emit("message", event);
    };

    const onCreate = (counterName: string) => {
        sendMessage({
            uuid: uuid(),
            type: "create",
            creationData: {
                uuid: uuid(),
                name: counterName,
                createdAt: new Date().getTime()
            }
        } as CreateCounterEvent);
    };

    const onIncrement = (counterUuid: string) => () => {
        sendMessage({
            uuid: uuid(),
            type: "increment",
            counterUuid,
        } as IncrementCounterEvent);
    };

    const onDecrement = (counterUuid: string) => () => {
        sendMessage({
            uuid: uuid(),
            type: "decrement",
            counterUuid,
        } as DecrementCounterEvent);
    };

    const onDelete = (counterUuid: string) => () => {
        sendMessage({
            uuid: uuid(),
            type: "delete",
            counterUuid,
        } as DeleteCounterEvent);
    };

    const computeCurrentState = (): Counter[] => {
        return applyEvents(
            syncState?.counters ?? [],
            mergeEvents(syncState?.events ?? [], localEvents)
        );
    };

    return (
        <Container>
            <h1>Distributed counters</h1>
            {computeCurrentState().map(counter => 
                <CounterCard
                    counter={counter}
                    onIncrement={onIncrement(counter.uuid)}
                    onDecrement={onDecrement(counter.uuid)}
                    onDelete={onDelete(counter.uuid)}
                />)
            }
            <CreateCounterForm
                onCreate={onCreate}
            />
        </Container>
    );
}

export default App;
