// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentDescriptor } from '@cratis/scene.model';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';

// Only Scene's explicit refusal says a package is unapproved. A component without design-time contributions asks for nothing,
// and its descriptor may use an alias rather than the package's manifest name.
export function unapprovedPackageOf(descriptor: ComponentDescriptor, environment: ScreenEditorEnvironment, actionDiagnostics: readonly (string | undefined)[] = []): string | undefined {
    const { designTime, packageDescriptorOf } = environment.runtime;
    const packageDescriptor = packageDescriptorOf(descriptor);
    const diagnostics = [
        designTime.designer(packageDescriptor).diagnostic,
        designTime.preview(packageDescriptor).diagnostic,
        designTime.propertyDisplay(packageDescriptor).diagnostic,
        ...packageDescriptor.properties.map(property => designTime.propertyEditor(packageDescriptor, property).diagnostic),
        ...actionDiagnostics,
    ];
    for (const diagnostic of diagnostics) {
        const refused = diagnostic?.match(/but package '([^']+)' is not approved by this host/);
        if (refused) return refused[1];
    }
    return undefined;
}
