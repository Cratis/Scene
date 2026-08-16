// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef } from 'react';
import { Button } from 'primereact/button';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:stepper` component - a wizard whose progress is shown as numbered steps.
 *
 * Stepper advances only when something calls `nextCallback` / `prevCallback` on its ref, so the adapter
 * renders the Back and Next buttons itself. Without them the steps render but nothing can move between
 * them, which is a stepper that does not step.
 */
export function PrimeStepper({ element, slots }: RegisteredComponentProps) {
    const stepper = useRef<Stepper>(null);
    const headers = stringArrayProperty(element, 'headers');
    const bodies = slots.content ?? [];
    const count = Math.max(headers.length, bodies.length);
    return (
        <Stepper
            ref={stepper}
            data-scene-id={element.id}
            linear={booleanProperty(element, 'linear', false)}
            orientation={stringProperty(element, 'orientation', 'horizontal') as 'horizontal' | 'vertical'}>
            {Array.from({ length: count }, (_, index) => (
                <StepperPanel key={index} header={headers[index] ?? `Step ${index + 1}`}>
                    <div className='flex flex-col gap-4'>
                        {bodies[index]}
                        <div className='flex gap-2'>
                            {index > 0 && <Button label='Back' severity='secondary' onClick={() => stepper.current?.prevCallback()} />}
                            {index < count - 1 && <Button label='Next' onClick={() => stepper.current?.nextCallback()} />}
                        </div>
                    </div>
                </StepperPanel>
            ))}
        </Stepper>
    );
}
