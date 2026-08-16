// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from 'primereact/button';
import { Stepper } from 'primereact/stepper';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringArrayProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:stepper` component - a wizard whose progress is shown as numbered steps.
 *
 * The adapter renders the Back and Next buttons itself. Without them the steps render but nothing can
 * move between them, which is a stepper that does not step.
 *
 * The reason changed with PrimeReact 11 even though the conclusion did not. In v10 the component owned
 * the active step and exposed `nextCallback` / `prevCallback` on a ref for someone else to call; v11 is
 * headless and owns nothing - the active step is `value` on `Stepper.Root`, so the adapter holds it in
 * state and the buttons set it. That also makes the step headers work: clicking one arrives as
 * `onValueChange`, which is routed into the same state rather than being handled separately.
 *
 * v11 also merged `primereact/stepperpanel` into `primereact/stepper`, splitting each step into a
 * `Stepper.Step` in the header list and a matching `Stepper.Panel` in the body, joined by value.
 *
 * **Dropped:** v10's `orientation` property has no equivalent - v11's headless stepper lays out
 * horizontally and leaves a vertical arrangement to CSS. The authored value is still forwarded as a
 * `data-orientation` attribute so a theme can act on it, but nothing in the component reads it.
 */
export function PrimeStepper({ element, slots }: RegisteredComponentProps) {
    const headers = stringArrayProperty(element, 'headers');
    const bodies = slots.content ?? [];
    const count = Math.max(headers.length, bodies.length);
    const [activeStep, setActiveStep] = useState(0);

    // A screen can shrink its step list between renders, which would leave the active step pointing past
    // the end and show no panel at all. Clamping keeps the value inside the set of steps that exist.
    const current = Math.min(activeStep, Math.max(count - 1, 0));

    return (
        <Stepper.Root
            data-scene-id={element.id}
            data-orientation={stringProperty(element, 'orientation', 'horizontal')}
            value={String(current)}
            linear={booleanProperty(element, 'linear', false)}
            onValueChange={(event) => {
                const selected = Number(event.value);
                if (!Number.isNaN(selected)) setActiveStep(selected);
            }}>
            <Stepper.List>
                {Array.from({ length: count }, (_, index) => (
                    <Stepper.Step key={index} value={String(index)}>
                        <Stepper.Header>
                            <Stepper.Number>{index + 1}</Stepper.Number>
                            <Stepper.Title>{headers[index] ?? `Step ${index + 1}`}</Stepper.Title>
                        </Stepper.Header>
                        {index < count - 1 && <Stepper.Separator />}
                    </Stepper.Step>
                ))}
            </Stepper.List>
            <Stepper.Panels>
                {Array.from({ length: count }, (_, index) => (
                    <Stepper.Panel key={index} value={String(index)}>
                        <div className='flex flex-col gap-4'>
                            {bodies[index]}
                            <div className='flex gap-2'>
                                {index > 0 && (
                                    <Button severity='secondary' onClick={() => setActiveStep(index - 1)}>
                                        Back
                                    </Button>
                                )}
                                {index < count - 1 && <Button onClick={() => setActiveStep(index + 1)}>Next</Button>}
                            </div>
                        </div>
                    </Stepper.Panel>
                ))}
            </Stepper.Panels>
        </Stepper.Root>
    );
}
