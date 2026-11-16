// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolveArgumentSource, type BindingScope } from '@cratis/scene.engine';
import type { ExternalComponent } from '@cratis/scene.model';

export function previewActionClick(element: ExternalComponent, scope: BindingScope) {
    return () => {
        const command = typeof element.properties.command === 'string' ? element.properties.command : '';
        const mapping = Array.isArray(element.properties.arguments) ? element.properties.arguments as { name?: unknown; source?: unknown }[] : [];
        const argumentsByName = Object.fromEntries(mapping
            .filter((argument): argument is { name: string; source: string } => typeof argument.name === 'string' && typeof argument.source === 'string')
            .map(argument => [argument.name, resolveArgumentSource(argument.source, scope)]));
        globalThis.dispatchEvent(new CustomEvent('cratis.scene.command', { detail: { command, element, arguments: argumentsByName } }));
    };
}
