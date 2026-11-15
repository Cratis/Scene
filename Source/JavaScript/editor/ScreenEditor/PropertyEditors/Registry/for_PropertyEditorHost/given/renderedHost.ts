// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ValueSource, type InspectedProperty, type PropertyDescriptor, type SceneDiagnostic } from '@cratis/scene.model';
import { anEditorContext } from '../../for_PropertyEditorRegistry/given/anEditorContext';
import { createPropertyEditorRegistry } from '../../createPropertyEditorRegistry';
import { PropertyEditorHost } from '../../PropertyEditorHost';
import type { PropertyEditorRegistry } from '../../PropertyEditorRegistry';

export const inspected = (descriptor: PropertyDescriptor, effectiveValue: unknown, rest: Partial<InspectedProperty> = {}): InspectedProperty => ({
    descriptor, currentValue: effectiveValue, effectiveValue, source: ValueSource.Local, editable: true, ...rest,
});

// Draws the host to markup with the editor it asks for already loaded: the registry's editors load on demand, and a server render never waits for them.
export async function renderedHost(property: InspectedProperty, diagnostics: readonly SceneDiagnostic[] = [], onChange: (property: InspectedProperty, value: unknown) => void = () => undefined, registry: PropertyEditorRegistry = createPropertyEditorRegistry()): Promise<string> {
    const resolution = registry.resolve(property.descriptor);
    if (resolution) await registry.load(resolution.id);
    return renderToStaticMarkup(createElement(PropertyEditorHost, { registry, property, context: anEditorContext(), componentId: 'c1', onChange, diagnostics }));
}
