// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Message, MessageSeverity } from '@cratis/components/Display';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The severities a screen may author for a message, mapped to `@cratis/components`' vocabulary.
 *
 * `warning` (PrimeReact 10) is `warn`, and `danger` - the spelling every other PrimeReact component uses - is
 * `error`, so a screen keeps its color and its announcement (`error` is the one severity that interrupts)
 * whichever package supplies the name. Anything unknown is an `info` message, as it is in PrimeReact.
 */
const severities: Record<string, MessageSeverity> = {
    info: 'info',
    success: 'success',
    warn: 'warn',
    warning: 'warn',
    error: 'error',
    danger: 'error',
    secondary: 'secondary',
    contrast: 'contrast',
};

/**
 * The `Cratis.Components:message` component - `Message` from `@cratis/components/Display`, a block notice.
 *
 * Renders as a live region (`role="alert"` for an error, `role="status"` otherwise), which is what a
 * notice that appears on a screen should be to assistive technology.
 */
export function SceneMessage({ element }: RegisteredComponentProps) {
    const severity = stringProperty(element.properties, 'severity');
    return <Message severity={(severity === undefined ? undefined : severities[severity]) ?? 'info'} text={stringProperty(element.properties, 'text') ?? ''} />;
}
