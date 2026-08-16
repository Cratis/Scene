// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { TimeMachine } from '@cratis/components/TimeMachine';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty } from '../properties';
import { timeMachineVersions } from './timeMachineVersions';
import { useEditableCopy } from './useEditableCopy';

/**
 * The `Cratis.Components:timeMachine` component - `TimeMachine` from `@cratis/components/TimeMachine`.
 *
 * Scrubs through successive versions of something on a timeline - which in an event-sourced application
 * is the most natural way to look at anything, since every read model *has* a history rather than only a
 * current value. The selected version is held here so the timeline scrubs on a screen; a host that wants
 * to drive the selection renders the component itself.
 */
export function SceneTimeMachine({ element }: RegisteredComponentProps) {
    const versions = useMemo(() => timeMachineVersions(element.properties), [element.properties]);
    const declaredIndex = numberProperty(element.properties, 'currentVersionIndex') ?? 0;
    const [currentVersionIndex, setCurrentVersionIndex] = useEditableCopy(declaredIndex);

    return (
        <TimeMachine
            versions={versions}
            currentVersionIndex={currentVersionIndex}
            onVersionChange={setCurrentVersionIndex}
            scrollSensitivity={numberProperty(element.properties, 'scrollSensitivity')}
        />
    );
}
