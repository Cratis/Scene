// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentArgumentSourcePrefix } from '@cratis/scene.engine';
import type { ComponentOutputSource } from '../Binding/bindingSources';

// The prefix of a command input source that reads another component's output - the value a person typed or chose on the
// same screen. It is Scene's own argument source vocabulary (`resolveArgumentSource`), so Play submits what was typed.
export const componentSourcePrefix = componentArgumentSourcePrefix;

export interface CommandInputSource {
    // What the action stores as the input's source.
    path: string;

    // What the author sees: the value's own name, or the component and output it comes from.
    label: string;
}

export function componentSourcePath(componentId: string, outputPath: string): string {
    return `${componentSourcePrefix}${componentId}.${outputPath}`;
}

// Where a command input can take its value from on this screen: the data context the screen is opened with, and the outputs
// of the components on it. Scene says which properties are outputs, so a package that adds an input widget declaring its
// value as an output appears here with no change to the editor. The component being configured cannot feed itself.
export function commandInputSources(dataContext: readonly string[], outputs: readonly ComponentOutputSource[], ownComponentId: string): CommandInputSource[] {
    return [
        ...dataContext.map(path => ({ path, label: path })),
        ...outputs
            .filter(source => source.componentId !== ownComponentId)
            .flatMap(source => source.outputs.map(output => ({ path: componentSourcePath(source.componentId, output.path), label: `${source.label} - ${output.label}` }))),
    ];
}

// The component a source reads from, when it reads one.
export function componentOfSource(source: string): string | undefined {
    if (!source.startsWith(componentSourcePrefix)) return undefined;
    const rest = source.slice(componentSourcePrefix.length);
    const separator = rest.indexOf('.');
    return separator > 0 ? rest.slice(0, separator) : undefined;
}
