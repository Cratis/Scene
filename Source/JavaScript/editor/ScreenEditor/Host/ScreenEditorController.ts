// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { CanvasPlacement } from '../Document/placeOnCanvas';
import type { DataField } from '../Data/DataField';
import type { DataFieldRefusal } from '../Data/insertDataField';
import type { TableDrop } from '../Surface/columnAt';
import type { PreparedSceneScreenDraft, SceneScreenDraftPreparation } from '../Drafting/SceneScreenDraft';
import type { ApplicationStructure, Behavior, DestinationReference, DialogTemplate, NavigationModel, Form, NodeInspection, SceneDiagnostic, SceneDocument, SceneEdit, SceneElement, ScreenTemplate, Slot, TemplateMetadata } from '@cratis/scene.model';
import type { EditingContext, NavigationEdit } from '@cratis/scene.engine';
import type { Ownership } from '../Structure/Ownership';
import type { StructureEdit } from '../Structure/StructureEdit';
import type { StructureEditRejection } from '../Structure/StructureEditRejection';
import type { StructureTreeAdapter } from '../Structure/StructureTreeAdapter';
import type { EditorComposition } from '../Templates/composeEditorScreen';
import type { DropRegion } from '../DropRegions/DropRegion';
import type { LayoutItem } from '../Layouts/LayoutItem';
import type { OutletEditingLevel } from '../Outlets/outletDocument';
import type { ScreenEditorButtonToAdd } from './ScreenEditorHost';

// The state and operations the editing surface, the inspector and the window controls share.
// How big the surface drew an element, in the surface's pixels; nothing for one it has not drawn.
export type ElementMeasurer = (elementId: string) => { left: number; top: number; width: number; height: number } | undefined;

export interface ScreenEditorController {

    // Whether the screen's slice is opened over a page - a State Change slice's screen - which is what makes a screen that states no fit a dialog.
    opensOverPage: boolean;

    // Why the screen cannot be edited, when it is open to be read only; absent while it can. What draws an offer to edit (the "+" of design mode) draws none.
    readOnlyReason?: string;

    // The navigation of the application as the document holds it, the modules and features its items lead to, and the level being edited: a module, or the
    // application when it is undefined (NAV1-NAV3).
    navigation: NavigationModel;
    structure: ApplicationStructure;
    navigationModule: string | undefined;

    // Applies navigation edits all-or-nothing as one undo step; whether they applied, and why not.
    applyNavigationEdits: (edits: NavigationEdit[], label: string) => { applied: boolean; rejected?: string };

    // Moves the editor to a module, or to the application level - where what a module inherits is defined (NAV7).
    setNavigationModule: (module: string | undefined) => void;

    // The level the outlets of the screen are edited at - the screen, or a module or feature above it - and moving to another (StudioIssues#1330). Nothing
    // means the screen.
    outletLevel: OutletEditingLevel | undefined;
    setOutletLevel: (level: OutletEditingLevel | undefined) => void;

    // Changes the document as one undo step, for what no Scene edit carries: a level's refinement of an outlet, a template's outlets.
    changeDocument: (change: (document: SceneDocument) => SceneDocument, label: string) => { applied: boolean; rejected?: string };

    // The item selected inside the selected component - a navigation item, which is not an element of its own.
    selectedItemId: string | undefined;
    selectItem: (componentId: string | undefined, itemId: string | undefined) => void;
    // A button the screen was opened to add to an outlet, until it has been added.
    buttonToAdd: { componentId: string; button: ScreenEditorButtonToAdd } | undefined;
    // Says the button has been added, or cannot be.
    settleButtonToAdd: () => void;

    document: SceneDocument;

    // Rebuilds untrusted additions privately; applying revalidates against the latest session cell.
    prepareSceneScreenDraft?: (answer: string, parameterlessQueryIds: readonly string[]) => SceneScreenDraftPreparation;
    applySceneScreenDraft?: (draft: PreparedSceneScreenDraft) => { applied: boolean; problem?: string };
    isSceneScreenDraftCurrent?: (draft: PreparedSceneScreenDraft) => boolean;
    composition: EditorComposition;
    context: EditingContext;
    selectedId?: string;
    selection?: SceneElement;
    inspection?: NodeInspection;
    diagnostics: readonly SceneDiagnostic[];
    adapter: StructureTreeAdapter<SceneElement>;
    ownershipOf: (elementId: string) => Ownership;
    dropRegions: readonly DropRegion[];

    select: (elementId: string | undefined) => void;

    // The surface tells the controller how to measure what it draws, so an element added to a canvas without a drop point is placed clear of those there.
    setMeasurer: (measure: ElementMeasurer | undefined) => void;
    apply: (edit: SceneEdit, label: string) => void;

    // Applies an edit and reports what Scene said, for flows that ask the author a question when the edit is refused.
    tryApply: (edit: SceneEdit, label: string) => { applied: boolean; diagnostics: SceneDiagnostic[] };
    applyAll: (edits: SceneEdit[], label: string) => { applied: boolean; diagnostics: SceneDiagnostic[] };

    // A structure move, by pointer or keyboard. Returns why it was refused, or nothing once applied.
    // `at` is where the element goes when the move ends on a canvas: it is given that position in the same undo step. Moving into a canvas
    // without one steps it from the last; moving out of a canvas takes its position off; moving within a canvas repositions it.
    move: (edit: StructureEdit, at?: CanvasPlacement) => StructureEditRejection | undefined;

    // Whether a move would be refused, and why, without applying it - what the surface asks while an element is dragged over it.
    validateMove: (edit: StructureEdit) => StructureEditRejection | undefined;
    // `at` is where on a canvas the element goes, in the canvas's pixels; without it an element added to a canvas is stepped from the last.
    insertComponent: (componentName: string, parentId: string | undefined, index: number | undefined, at?: CanvasPlacement) => void;
    insertLayout: (item: LayoutItem, parentId: string | undefined, index: number | undefined, at?: CanvasPlacement) => void;
    // Puts an element made elsewhere - a field bound to data, say - onto the screen, selected, as one undo step.
    insertElement: (element: SceneElement, parentId: string | undefined, index: number | undefined, label: string, at?: CanvasPlacement) => void;
    // Makes a field bound to a piece of data from the Data drawer - a property of the command, a field a query returns - and says why when it cannot.
    insertDataField: (field: DataField, parentId: string | undefined, index: number | undefined, at?: CanvasPlacement, over?: TableDrop) => DataFieldRefusal | undefined;
    // Places every property of the slice's command on the screen's form, which is made when the screen has none - Generate the form.
    generateForm: (sliceId: string, parentId: string | undefined, index: number | undefined) => DataFieldRefusal | undefined;
    // Takes a field a query returns off the screen again: the column of every table over the query.
    removeDataField: (field: Extract<DataField, { source: 'query' }>) => void;
    // Removes an element as one undo step and selects what takes its place: the next sibling, else the previous, else its container.
    // The screen's own root, and anything a template gives the screen, is refused.
    remove: (elementId: string) => void;
    canRemove: (elementId: string) => boolean;
    setProperty: (property: NodeInspection['properties'][number], value: unknown) => void;
    setScreenForms: (forms: Form[], label: string) => void;
    setScreenTemplateSlots: (templateName: string, slots: Slot[], label: string) => void;
    setScreenTemplateMetadata: (templateName: string, metadata: TemplateMetadata | undefined, label: string) => void;
    setDialogTemplates: (templates: DialogTemplate[], label: string) => void;
    setCollectionItemDestination: (componentId: string, path: string, itemId: string, destination: DestinationReference | undefined, label: string) => void;

    // Replaces an element's behaviors as one undo step; nothing removes them.
    setElementBehaviors: (elementId: string, behaviors: Behavior[] | undefined, label: string) => void;

    // Builds the screen from a template, or from none, as one undo step.
    setScreenTemplate: (template: ScreenTemplate | undefined, label: string) => void;

    // The host has stored the document as it is now: it is no longer dirty, and the history is kept.
    markSaved: () => void;

    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    isDirty: boolean;
}
