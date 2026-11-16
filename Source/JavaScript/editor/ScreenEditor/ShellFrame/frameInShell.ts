// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, type SceneDocument, type SceneElement } from '@cratis/scene.model';
import type { EffectiveShell, TemplateLibrary, TemplateSource } from '@cratis/scene.engine';
import { LayoutName, composeApplicationScreen, defaultApplicationChrome, effectiveShellOf, externalComponent, type ApplicationDocument, type CompositionOptions } from '@cratis/scene.blueprint.default';
import { ComponentName } from '@cratis/scene.blueprint.default';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import { screenName } from '../Document/studioScreen';

// The application's own templates beside the blueprints the profile's packages bring: where the root template is looked up (REN2 - the
// same library Stage hands to the engine's resolveEffectiveShell).
export function shellLibraryOf(runtime: ScreenEditorRuntime, document: SceneDocument): TemplateLibrary {
    const blueprints: TemplateSource[] = runtime.bundles
        .filter(bundle => bundle.manifest.kind === PackageKind.Blueprint)
        .map(bundle => ({ manifest: bundle.manifest, layouts: bundle.layouts, screenTemplates: bundle.screenTemplates, dialogTemplates: bundle.dialogTemplates }));

    return {
        own: {
            manifest: { name: 'Application', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] },
            layouts: document.layouts,
            screenTemplates: document.screenTemplates,
            dialogTemplates: document.dialogTemplates ?? [],
        },
        blueprints,
    };
}

// The slot of the shell the edited screen is placed in, until the screen is put there.
export const shellContentId = 'studio-shell-content';

export interface ShellFrame {
    // The shell, composed with an empty place where the screen goes - the screen replaces `shellContentId`. It only changes when the
    // profile, the templates or the packages do, not with every edit of the screen.
    element: SceneElement;

    // What the engine resolved the shell to - the one function every host asks (spec 5.4).
    shell: EffectiveShell;
}

function applicationOf(runtime: ScreenEditorRuntime, document: SceneDocument, content: SceneElement): { application: ApplicationDocument; options: CompositionOptions } {
    const application: ApplicationDocument = {
        layouts: document.layouts,
        screenTemplates: document.screenTemplates,
        dialogTemplates: document.dialogTemplates ?? [],
        screens: [{ name: screenName, layout: runtime.profile.layout || LayoutName.AppShell, slotContent: { content: [content] }, forms: [], contributions: [] }],
        uiProfiles: [runtime.compositionProfile],
    };
    const options: CompositionOptions = {
        profile: runtime.compositionProfile,
        catalog: runtime.packages,
        templateLibrary: shellLibraryOf(runtime, document),
        chrome: (_, shell) => shell === ComponentName.FullPageShell ? {} : defaultApplicationChrome(),
    };

    return { application, options };
}

// The shell the UI profile chose for the screen, by the engine's own resolveEffectiveShell (through Scene's effectiveShellOf).
export function effectiveShellFor(runtime: ScreenEditorRuntime, document: SceneDocument): EffectiveShell {
    const { application, options } = applicationOf(runtime, document, externalComponent(shellContentId, 'text', { text: '' }));
    return effectiveShellOf(application, application.screens[0], options);
}

// The application's shell composed around a place for the edited screen. The shell is read-only context - the screen is all that is edited -
// and it is composed by Scene's own composeApplicationScreen, so the screen is in the same frame in the editor, the preview host and Stage.
export function composeShellFrame(runtime: ScreenEditorRuntime, document: SceneDocument): ShellFrame {
    const place = externalComponent(shellContentId, 'text', { text: '' });
    const { application, options } = applicationOf(runtime, document, place);
    const screen = application.screens[0];
    return { element: composeApplicationScreen(application, screen, options).element, shell: effectiveShellOf(application, screen, options) };
}
