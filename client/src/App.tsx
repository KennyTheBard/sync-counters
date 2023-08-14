import { useEffect, useState } from "react";
import { Button, Container } from "@mantine/core";
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
    const [localEvents, setLocalEvents] = useState<WithTimestamp<SyncEvent>[]>(
        []
    );
    const [currentState, setCurrentState] = useState<Counter[]>([]);

    useEffect(() => {
        axios.get("http://localhost:3000/rest").then((response) => {
            setSyncState(response.data);
            setSocket(io("http://localhost:3000"));
        });
    }, []);

    useEffect(() => {
        if (socket === null) {
            console.error("Websocket connection has net been initialized");
            return;
        }
        socket.on("event", (event: WithTimestamp<SyncEvent>) => {
            addSyncEvent(event);
        });
    }, [socket]);

    useEffect(() => {
        setCurrentState(computeCurrentState());
    }, [syncState, localEvents]);

    const sendMessage = (event: SyncEvent) => {
        if (socket === null) {
            console.error("Websocket connection has net been initialized");
            return;
        }
        setLocalEvents([
            ...localEvents,
            {
                ...event,
                ts: new Date().getTime(),
            },
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
                createdAt: new Date().getTime(),
            },
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
        // TODO: debounce
        const events = mergeEvents(syncState?.events ?? [], localEvents);
        return applyEvents(syncState?.counters ?? [], events);
    };

    const addSyncEvent = (event: WithTimestamp<SyncEvent>) => {
        // safety check
        if (!syncState) {
            console.error("Initial state not loaded");
            return null;
        }

        // remove local version of the event as the event has already been propagated
        if (
            syncState.events.find(
                (stateEvent) => stateEvent.uuid === event.uuid
            )
        ) {
            setLocalEvents((prevLocalEvents: WithTimestamp<SyncEvent>[]) => {
                const newLocalEvents = [...prevLocalEvents];
                // redo the find just to be safe from duplication / desynchronization errors
                const localEventIndex = syncState.events.findIndex(
                    (stateEvent) => stateEvent.uuid === event.uuid
                );
                if (localEventIndex >= 0) {
                    newLocalEvents.splice(localEventIndex, 1);
                }
                return newLocalEvents;
            });
        }

        setSyncState((prevState) => {
            // safety check
            if (!prevState) {
                console.error("Initial state not loaded");
                return null;
            }

            // find out where the new event should go
            const newSyncEvents = [...prevState.events];
            const syncEventIndex = newSyncEvents.findIndex(
                (prevStateEvent) => prevStateEvent.uuid === event.uuid
            );
            if (syncEventIndex >= 0) {
                // override existing events in case they are duplicated
                newSyncEvents.splice(syncEventIndex, 1, event);
            } else {
                newSyncEvents.push(event);
            }

            return {
                counters: prevState.counters,
                events: newSyncEvents.sort((e1, e2) => e1.ts - e2.ts),
            };
        });
    };

    const downloadCounters = async () => {
        try {
            const response = await axios.get("http://localhost:3000/rest/download");
            const counters: Counter[] = response.data;

            const blob = new Blob(counters.map(c => `${c.name}: ${c.value}\n`), { type: 'text/plain' });
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'download.txt';
            a.click();      
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Container>
            <h1>Synchronized Counters</h1>
            <Button onClick={downloadCounters}>
                Download all
            </Button>
            {currentState.map((counter) => (
                <CounterCard
                    key={counter.uuid}
                    counter={counter}
                    onIncrement={onIncrement(counter.uuid)}
                    onDecrement={onDecrement(counter.uuid)}
                    onDelete={onDelete(counter.uuid)}
                />
            ))}
            <CreateCounterForm onCreate={onCreate} />
        </Container>
    );
}

export default App;
