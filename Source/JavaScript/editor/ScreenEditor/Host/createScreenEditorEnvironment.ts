// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ConfigurationDestination } from '@cratis/components/ConfigurationEditor';
import type { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import { loadQuill } from '@cratis/scene.primereact/quill';
import type { QuillLoader } from '@cratis/scene.primereact';
import type { StateChangeSlice } from '../Actions/StateChangeSlice';
import type { ScreenEditorFileUpload } from './ScreenEditorFileUpload';
import { availableSourcesFor } from '../Binding/availableSourcesFor';
import { toSceneCandidates, type DiscoveredQueryCandidate } from '../Binding/toSceneCandidates';
import type { ScreenEditorEnvironment } from './ScreenEditorHost';

// What a host lends the editor besides the runtime: the model it was given to work with, as plain data.
export interface ScreenEditorEnvironmentSource {
    runtime: ScreenEditorRuntime;

    // The queries a screen being edited may bind. Candidates whose shape or origin Scene does not know are left out.
    queryCandidates?: readonly DiscoveredQueryCandidate[];

    // The state changes a screen can submit.
    stateChangeSlices?: readonly StateChangeSlice[];

    // Lends design-time commands to the host's form registry while the editor is open.
    registerDesignTimeCommands?: ScreenEditorEnvironment['registerDesignTimeCommands'];

    // The screens a navigation item or a button can lead to.
    destinations?: readonly ConfigurationDestination[];

    // Loads Quill for the rich text control. The ready-made loader from Scene's `quill` entry is the default, so a host does
    // nothing for it; pass another loader to supply the engine yourself, or `false` to leave rich text out.
    richText?: QuillLoader | false;

    // The host's own upload effect and the other origins an authored upload address may name. The default is neither: the
    // control posts to the address its author configured, to the page's own origin, when someone presses upload.
    fileUpload?: ScreenEditorFileUpload;

    // Where in the application the screen being edited sits; the templates it may use follow from it.
    templateScope?: TemplateScope;

    // The screen templates the application made itself, named as a screen refers to them.
    ownTemplates?: readonly ScreenTemplate[];

    // The same templates named by identifier, which is how a slice stores its selection.
    selectableTemplates?: readonly ScreenTemplate[];

    // The application the screen belongs to: what the shell around the screen draws its navigation from.
    navigation?: ScreenEditorEnvironment['navigation'];

    // Where the screen sits in the application, and how it moves to another feature.
    location?: ScreenEditorEnvironment['location'];

    // What the module and the features the screen sits in say about the outlets of its template, when the host keeps it.
    levelOutlets?: ScreenEditorEnvironment['levelOutlets'];
}

// Builds the environment the editor opens against. The editor never reaches for the application it runs in: every host,
// inside Studio or not, lends it the same four things through this one function, and the values a binding can be fed
// from are derived from the queries it was lent.
export function createScreenEditorEnvironment(source: ScreenEditorEnvironmentSource): ScreenEditorEnvironment {
    const queryCandidates = toSceneCandidates(source.queryCandidates ?? []);
    return {
        runtime: source.runtime,
        queryCandidates,
        stateChangeSlices: source.stateChangeSlices ?? [],
        destinations: source.destinations ?? [],
        ...(source.registerDesignTimeCommands ? { registerDesignTimeCommands: source.registerDesignTimeCommands } : {}),
        availableSources: availableSourcesFor(queryCandidates),
        ...(source.richText === false ? {} : { richText: source.richText ?? loadQuill }),
        ...(source.fileUpload ? { fileUpload: source.fileUpload } : {}),
        ...(source.templateScope ? { templateScope: source.templateScope } : {}),
        ...(source.ownTemplates && source.ownTemplates.length > 0 ? { ownTemplates: source.ownTemplates } : {}),
        ...(source.selectableTemplates && source.selectableTemplates.length > 0 ? { selectableTemplates: source.selectableTemplates } : {}),
        ...(source.navigation ? { navigation: source.navigation } : {}),
        ...(source.location ? { location: source.location } : {}),
        ...(source.levelOutlets ? { levelOutlets: source.levelOutlets } : {}),
    };
}
