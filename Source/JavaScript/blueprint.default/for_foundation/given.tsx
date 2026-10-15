// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { componentRegistryKey } from '@cratis/scene.react';
import { ComponentState, foundationComponentMetadata, foundationElement } from '../foundation';
import { defaultBlueprintComponents } from '../defaultBlueprintComponents';
import { defaultBlueprintName } from '../packageName';

/** The bare names of every foundation component, from the metadata table that CMP1 already requires to be complete. */
export const foundationNames = Object.keys(foundationComponentMetadata);

/** The same axe-core WCAG A and AA rules the template previews are audited with; contrast and page-level landmarks need a real page. */
export const wcagRules = { runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } };

/** The accessibility violations axe finds in a rendered container, as readable lines. */
export async function violationsIn(container: HTMLElement): Promise<string[]> {
    return (await axe.run(container, wcagRules)).violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`);
}

/** Renders a foundation component directly, with its sample (or the given) properties and optionally a forced state. */
export function renderFoundation(name: string, properties?: Record<string, unknown>, state?: ComponentState, wrapper?: (children: ReactElement) => ReactElement) {
    const Component = defaultBlueprintComponents[componentRegistryKey(defaultBlueprintName, name)];
    const element = <Component element={foundationElement(name, properties, state)} slots={{}} />;
    return render(wrapper ? wrapper(element) : element);
}
