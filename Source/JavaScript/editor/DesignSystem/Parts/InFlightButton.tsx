// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef, useState } from 'react';
import { Button } from '@cratis/components/Common';

export interface InFlightButtonProps {
    /** What the button says. */
    label: string;

    /** What it does; answers why it could not, or nothing when it did. */
    onRun: () => Promise<string | undefined>;

    /** Whether it can be pressed. */
    disabled?: boolean;

    /** How it is drawn. */
    variant?: 'solid' | 'outline';
}

/**
 * A button for something the host performs: it cannot be pressed again while the host is at it, and a refusal is said beside it
 * until the button is pressed again.
 */
export const InFlightButton = ({ label, onRun, disabled = false, variant = 'outline' }: InFlightButtonProps) => {
    const [running, setRunning] = useState(false);
    const [refusal, setRefusal] = useState<string | undefined>();
    const inFlight = useRef(false);

    const run = async () => {
        if (inFlight.current) return;
        inFlight.current = true;
        setRunning(true);
        setRefusal(undefined);
        try {
            setRefusal(await onRun());
        } finally {
            inFlight.current = false;
            setRunning(false);
        }
    };

    return (
        <>
            <Button label={label} size='small' variant={variant} loading={running} disabled={disabled || running} onClick={() => void run()} />
            {refusal !== undefined && <span role='alert' className='studio-design-system__error'>{refusal}</span>}
        </>
    );
};
