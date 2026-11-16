// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicationStructure } from '@cratis/scene.model';
import type { SceneDocument, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import type { QueryCandidate } from '@cratis/scene.model';
import type { ConfigurationDestination } from '@cratis/components/ConfigurationEditor';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import type { QuillLoader } from '@cratis/scene.primereact';
import type { StateChangeSlice } from '../Actions/StateChangeSlice';
import type { LevelRefinements } from '../DesignMode/Outlets/levelOutlets';
import type { ScreenEditorFileUpload } from './ScreenEditorFileUpload';
import type { ColorToken, EditorReference, EditorSlice } from '../PropertyEditors/Registry/PropertyEditorProps';
import type { PropertyEditorRegistry } from '../PropertyEditors/Registry/PropertyEditorRegistry';

// What the editor is asked to open: a role's screen on a slice, or a screen template.
export interface ScreenEditorSubject {

    // The saved Scene document as stored (text). Without one, the subject opens as a new, empty screen document.
    documentText?: string;

    // The saved Scene document as an object. For a caller that already holds one; text is preferred because it is checked on open.
    document?: SceneDocument;

    // The size a new, empty screen document starts at. Used only when nothing is saved; a saved document carries its own.
    windowSize?: { width: number; height: number };

    // The template being authored; absent when editing a screen.
    authoringTemplate?: string;

    // The template a screen is built from, when it has one.
    screenTemplate?: string;

    // The screen of the document to open when it holds several; the one called 'Screen' when left out. It is edited as that screen and the result is
    // handed back with every screen under the name it had.
    screen?: string;

    // What is selected when the screen opens: an element, and an item inside it - a button of an outlet of actions - when that is what is meant
    // (StudioIssues#1333: a click on where a slice is issued from lands on the button).
    select?: ScreenEditorSelection;

    // Whether the screen's slice is opened over a page - a State Change slice's screen, which a hook opens in a dialog or a drawer. A screen that states no fit
    // fits a dialog then; any other fits a page, which is also the answer when the slice is not known.
    opensOverPage?: boolean;
}

// What is selected when a screen opens: an element, and an item inside it - a button of an outlet of actions - when that is what is meant.
export interface ScreenEditorSelection {
    componentId: string;
    itemId?: string;
    // A button to add to an outlet as the screen opens, and to select once it is added (StudioIssues#1333: a slice issued nowhere is given a button that issues it).
    add?: ScreenEditorButtonToAdd;
}

// A button that issues a slice, to be added to an outlet by its name, in the way the outlet's own "+" adds one.
export interface ScreenEditorButtonToAdd {
    outlet: string;
    // The slice, by the id the slice picker stores.
    slice: string;
    title: string;
}

// What the host environment lends the editor: queries to bind, slices to submit, and the packages in play.
export interface ScreenEditorEnvironment {
    runtime: ScreenEditorRuntime;
    queryCandidates: readonly QueryCandidate[];
    stateChangeSlices: readonly StateChangeSlice[];
    registerDesignTimeCommands?: (slices: readonly StateChangeSlice[]) => () => void;

    // The screens a navigation item or a button can lead to. Identity is the id; the label is only for showing.
    destinations: readonly ConfigurationDestination[];

    // The values a binding or action input can be drawn from on this screen, by path and type.
    availableSources: Record<string, string>;

    // Loads the rich text engine the editor control draws with. Absent when the host declined it, and then the control says so
    // instead of showing a text area that would store unsafe markup.
    richText?: QuillLoader;

    // How the file upload control reaches the host's server, when the host wants to own that.
    fileUpload?: ScreenEditorFileUpload;

    // What the property editors offer beyond what the editor itself knows: the slices of the whole model (with their kinds), the slots of the
    // template in effect, the theme's colour tokens, what a `reference` editor can point at - and editors a blueprint or plugin adds to
    // the registry (spec PE5). Absent, the editors offer what the screen's own environment holds.
    propertyEditors?: {
        registry?: PropertyEditorRegistry;
        slices?: readonly EditorSlice[];
        slots?: readonly string[];
        colorTokens?: readonly ColorToken[];
        references?: (target: string) => readonly EditorReference[];
    };

    // The screen templates the application made itself, named as a screen refers to them (by the name its author gave, not the identifier
    // the catalog keeps). They are offered beside the packages' templates and a screen that already uses one knows it (StudioIssues#998).
    ownTemplates?: readonly ScreenTemplate[];

    // The same templates named the way a slice stores its selection - by identifier - so a screen opened on one can be built on it before it is saved.
    selectableTemplates?: readonly ScreenTemplate[];

    // Where in the application the screen being edited sits, which decides the templates it may use. Without one every
    // template is offered.
    templateScope?: TemplateScope;

    // The application the screen belongs to, for editing its navigation (spec 5): the modules, features and slices its items lead to, the module the screen is
    // edited for (nothing at the application level, where what modules inherit is defined) and the slots of the layout an item may render into.
    navigation?: ScreenEditorNavigation;

    // Where the screen sits in the application, shown and (when the host lends a way) changed in the inspector.
    location?: ScreenEditorLocation;

    // What the module and the features the screen sits in say about the outlets of its template - the host keeps them, for an outlet of any kind (StudioIssues#1327). Given, the
    // editor opens with them in the document and hands them back, as their own, in `levelOutlets` of what it saves, which then carries none; absent, a document keeps its own.
    levelOutlets?: readonly LevelRefinements[];
}

// Where the screen sits in the application - the module and features it is declared in, which is its path in Screenplay - and, when the
// host can, how it moves to another feature. Moving is the host's: the editor asks, the host moves the slice the screen belongs to and
// answers with the reason it refused, if it did.
export interface ScreenEditorLocation {
    path: readonly string[];
    currentFeatureId: string;
    features: readonly ScreenEditorLocationFeature[];
    move?: (featureId: string) => Promise<string | undefined>;
}

export interface ScreenEditorLocationFeature {
    id: string;

    // The names of the module and the features above it, outermost first.
    path: readonly string[];
}

export interface ScreenEditorNavigation {
    structure: ApplicationStructure;
    module?: string;
    slots?: readonly string[];
}

// What closing the editor hands back to be saved.
export interface ScreenEditorResult {
    document: SceneDocument;

    // How the module and the features the screen sits in refine outlets, as the editor leaves them, when the host keeps them; the document then holds none.
    levelOutlets?: LevelRefinements[];

    // The screen in the prototype element shape, for the board thumbnails that still draw it.
    legacyElements: unknown[];
    windowSize: { width: number; height: number };
    layout: number;
    changed: boolean;
}
