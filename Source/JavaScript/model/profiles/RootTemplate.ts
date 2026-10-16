// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReference } from '../screens/TemplateReference';

/**
 * The application's root template - its shell. The shell is either a layout or an application-scope screen template with the
 * root role; this reference names it, pinned like any other template reference, and carries the shell's own configuration.
 */
export interface RootTemplate {
    /** Which template is the shell: an own template, or a blueprint template with a version pin. */
    template: TemplateReference;

    /**
     * The shell's own configurable items (for example `navigationMode` or `showFooter`), keyed by the shell's exposed option
     * name. Absent when the profile leaves every option at the shell's default.
     */
    options?: Record<string, unknown>;
}

export const RootTemplatePropertyNames: (keyof RootTemplate)[] = ['template', 'options'];
