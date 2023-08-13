import { Group, TextInput, Button } from "@mantine/core";
import { useRef, useState } from "react";

export type CreateCounterFormProps = {
    onCreate: (counterName: string) => void;
};

export const CreateCounterForm: React.FC<CreateCounterFormProps> = (
    props: CreateCounterFormProps
) => {
    const counterNameRef = useRef<HTMLInputElement | null>(null);

    return (
        <Group>
            <TextInput ref={counterNameRef} />
            <Button
                defaultValue="Counter name"
                onClick={() => {
                    const counterName = counterNameRef.current;
                    if (!counterName) {
                        console.error('Empty ref')
                        return;
                    }
                    console.log(counterName.value);
                    props.onCreate(counterName.value);
                    counterName.value = '';
                }}
            >
                Create counter
            </Button>
        </Group>
    );
};
