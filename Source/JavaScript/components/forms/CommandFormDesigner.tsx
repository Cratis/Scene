// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeComponentProps } from '@cratis/scene.react';

/**
 * Generic package-side command form designer. It reads only the shared design-time context and submits Scene edits.
 */
export function CommandFormDesigner({ context }: DesignTimeComponentProps) {
    const canGenerate = context.capabilities['commandForm.generateFields'] === true && context.permissions.edit !== false;
    return <button type='button' disabled={!canGenerate} onClick={() => context.submitAction('Cratis.Components.commandForm.generateFields', [])}>
        Generate fields
    </button>;
}
