// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicationStructure, TemplateReference, DialogTemplate, ExposureDeclaration, InstanceContribution, Layout, NavigationModel, SampleDataPack, Screen, ScreenTemplate, Theme, UiProfile } from '@cratis/scene.model';

/**
 * The scene a preview renders: the application as Stage emits it for its own frontend - the same members, the same JSON (string
 * enumerations, camel-cased) - because the preview is Stage's composition run in the editor, not a second reading of the model (spec PRV9, REN2).
 */
export interface PreviewScene {
    layouts: Layout[];
    screenTemplates: ScreenTemplate[];
    dialogTemplates: DialogTemplate[];
    screens: Screen[];
    exposures?: ExposureDeclaration[];
    instanceContributions?: InstanceContribution[];
    themes?: Theme[];

    /** The profiles the model compiled to; their own root templates are named, where the stored profile's are identified. */
    uiProfiles?: UiProfile[];
    navigation?: NavigationModel;
    structure: ApplicationStructure;

    /** The templates the model assigns to the application, a module or a feature, by the dotted path of the owner. A feature shown by a template alone has no screen of its own. */
    templateReferences?: { scope: string; owner: string; reference: TemplateReference }[];

    /** The sample data packs the model itself carries. */
    sampleDataPacks?: SampleDataPack[];

    /** The JSON schema of every modeled command, by command name - what the task dialog of a slice asks for. */
    commandSchemas?: Record<string, string>;
}

/** What a node of the board is: a module, a feature or a slice. */
export enum PreviewNodeKind {
    Module = 'module',
    Feature = 'feature',
    Slice = 'slice',
}

/**
 * A node of the board and the identifier the scene knows it by - the dotted path of Screenplay names, such as `Sales.Orders.PlaceOrder`.
 * Preview is started from a board node and the scene is addressed by the scene identifier; this is the join.
 */
export interface PreviewNodeRef {
    /** The identifier of the module, feature or slice on the board. */
    id: string;
    kind: PreviewNodeKind;
    sceneId: string;
}
