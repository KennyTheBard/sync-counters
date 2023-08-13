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

export const CounterCard: React.FC<CounterCardProps> = (props: CounterCardProps) => {
    return (
        <Group key={props.counter.uuid}>
            {props.counter.name}
            {props.counter.value}
            <Button onClick={props.onIncrement}>-1</Button>
            <Button onClick={props.onDecrement}>+1</Button>
            <Button onClick={props.onDelete}>Delete</Button>
        </Group>
    );
};
