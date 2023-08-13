import { Button, Group } from "@mantine/core";

export type CounterCardProps = {
    counter: {
        uuid: string;
        value: number;
        name: string;
    };
    onIncrement: () => void;
    onDecrement: () => void;
    onDelete: () => void;
};

export const CounterCard: React.FC<CounterCardProps> = (
    props: CounterCardProps
) => {
    return (
        <Group m={10}>
            <Button color="green" onClick={props.onIncrement}>+1</Button>
            <Button color="red" onClick={props.onDecrement}>-1</Button>
            <Button onClick={props.onDelete}>Delete</Button>
            {props.counter.name}
            <strong>{props.counter.value}</strong>
        </Group>
    );
};
