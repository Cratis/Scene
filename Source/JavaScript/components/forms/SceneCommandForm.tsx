// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary, BindingKind, MissingBinding, resolveElementBinding } from '../bindings';
import type { BoundConstructor } from '../bindings';
import { stringArrayProperty, stringProperty } from '../properties';
import { commandInputs } from './commandInputs';

const CommandFormRuntime = lazy(() => import('./CommandFormRuntime'));

// Arc's useCommand constructs the proxy only on mount. Key by the actual registered class,
// not its Scene name (which may be re-registered with a different route or roles).
const commandKeys = new WeakMap<BoundConstructor, number>();
let nextCommandKey = 0;
function commandKey(command: BoundConstructor): number {
    let key = commandKeys.get(command);
    if (key === undefined) {
        key = ++nextCommandKey;
        commandKeys.set(command, key);
    }
    return key;
}

/**
 * Auto mode follows supported native proxy descriptors; opt-in inputs bind exactly named fields
 * inside a single native Arc form. Neither mode consumes the content slot.
 */
export function SceneCommandForm({ element }: RegisteredComponentProps) {
    const { name, target } = resolveElementBinding(element, BindingKind.Command);
    if (!target) return <MissingBinding element={element} kind={BindingKind.Command} name={name} />;

    const inputs = Object.hasOwn(element.properties, 'inputs') ? commandInputs(element.properties) : undefined;
    if (Object.hasOwn(element.properties, 'inputs') && !inputs) return <div role='alert'>Invalid command form inputs declaration</div>;

    return (
        <ArcRuntimeBoundary>
            <CommandFormRuntime
                key={commandKey(target)}
                command={target}
                inputs={inputs}
                exclude={stringArrayProperty(element.properties, 'exclude')}
                submitLabel={stringProperty(element.properties, 'submitLabel') ?? 'Submit'}
            />
        </ArcRuntimeBoundary>
    );
}
