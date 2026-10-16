// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Layout, ScreenTemplate, TemplateReference } from '@cratis/scene.model';
import { BlueprintPinEvaluation } from '../blueprints/evaluateBlueprintPin';
import { ShellDiagnostic } from './ShellDiagnostic';

/** Where the effective shell was found, in resolution order. */
export enum ShellOrigin {
    /** The profile's root template reference. */
    Root = 'root',

    /** The profile's legacy layout name. */
    LegacyLayout = 'legacyLayout',

    /** The default layout of the first installed blueprint. */
    BlueprintDefault = 'blueprintDefault',

    /** Nothing was chosen or found: the built-in bare shell with one content outlet and no chrome. */
    Bare = 'bare',
}

/** What kind of template the shell is. */
export enum ShellKind {
    /** A layout, which is what blueprints ship as application shells. */
    Layout = 'layout',

    /** A screen template at the Application scope with the root role. */
    ScreenTemplate = 'screenTemplate',
}

/** Whose template the shell is. */
export enum ShellSource {
    /** A template of this application. */
    Own = 'own',

    /** A template of an installed blueprint. */
    Blueprint = 'blueprint',

    /** The engine's built-in bare shell. */
    BuiltIn = 'builtIn',
}

/** The one answer to "what is this application's shell?", the same for every host. */
export interface EffectiveShell {
    /** Where in the resolution order the shell came from. */
    origin: ShellOrigin;

    /** The pinned reference to the shell. Absent for the built-in bare shell. */
    reference?: TemplateReference;

    /** The shell template itself (for the bare shell, a layout with one `content` slot). */
    template: Layout | ScreenTemplate;

    /** Whether the shell is a layout or a root screen template. */
    kind: ShellKind;

    /** Whose template the shell is. */
    source: ShellSource;

    /** The shell's name. */
    name: string;

    /** The package that supplies the shell. Absent for the built-in bare shell and for a template of the application itself. */
    package?: string;

    /** The installed version of the supplying package. */
    packageVersion?: string;

    /** How the shell's pin relates to the installed version. Present for a shell from a blueprint. */
    pin?: BlueprintPinEvaluation;

    /** The names of the shell's outlets (slots), in declaration order. */
    outlets: string[];

    /** The outlet every screen's content is placed in. `content` unless the shell names another. */
    primaryOutlet: string;

    /** The shell's own configuration, as the profile wrote it. Empty when the profile leaves everything at the shell's defaults. */
    options: Record<string, unknown>;

    /** Everything found wrong, in a stable order: the root and fallbacks first, then the profile's theme and packages, then the screens. */
    diagnostics: ShellDiagnostic[];
}
