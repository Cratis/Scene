// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneScreenDraftStrings } from '../Drafting/SceneScreenDraftStrings';
import type { IconPickerLabels } from '@cratis/components/IconPicker';
import type { IconPropertyFieldStrings } from '../../Icons/IconPropertyFieldStrings';
import type { ComponentPickerStrings } from '../Palette/ComponentPicker';
import type { PropertyEditorStrings } from '../PropertyEditors/Registry/PropertyEditorStrings';
import type { StructuredEditorStrings } from '../PropertyEditors/Structured/StructuredEditorStrings';
import type { Ownership } from '../Structure/Ownership';
import type { SceneDocumentProblem } from '../Document/readSceneDocument';
import type { StructureEditRejection } from '../Structure/StructureEditRejection';
import type { SurfaceStrings } from '../Surface/DesignTime/SurfaceStrings';
import type { DesignModeStrings } from '../DesignMode/DesignModeStrings';
import type { DestinationProblemKind } from '../Destinations/DestinationProblemKind';
import type { TemplatePickerLabels } from '../../TemplatePicker/TemplatePickerLabels';
import type { TemplatePreviewSize } from '../Templates/TemplatePreviewSize';
import type { TemplatePreviewState } from '@cratis/scene.blueprint.default';

// Every label the screen editor chrome shows. Like the other designers in this package it has no localization of
// its own: the host hands the words down, so a missing label is a compile error in the host.
export interface ScreenEditorStrings {
    inspectorTitle: string;
    windowLabel: string;
    propertiesTab: string;
    structureTab: string;
    openInspector: string;
    closeInspector: string;
    desktopPreview: string;

    // The viewport toggle that draws the application's shell around the screen, and the bar over a destination peeked at from it.
    showApplicationShell: string;
    hideApplicationShell: string;
    showTemplate: string;

    // What the title bar says of a screen that opens as a popup, in place of the shell toggle.
    opensAsDialog: string;
    opensAsDrawer: string;
    hideTemplate: string;
    shellPeeking: (name: string) => string;
    shellPeekBack: string;
    mobilePreview: string;

    // Describes the size class in force, for example "Compact width, Regular height".
    sizeClass: (width: string, height: string) => string;
    viewportSize: (width: number, height: number) => string;

    noSelection: string;
    nameLabel: string;
    typeLabel: string;
    ownershipLabel: string;
    ownership: Record<Ownership, string>;
    ownershipHint: Record<Ownership, string>;

    unreadable: {
        title: string;
        warning: string;
        close: string;
        reasons: Record<SceneDocumentProblem, string>;
    };

    // Shown in place of the editor when a part of it fails, so the page it was opened over carries on.
    stopped: {
        title: string;
        message: string;
        close: string;
    };

    // What the surface says over the screen while it is designed: an empty container, a refused drop, a component with nothing to draw.
    surface: SurfaceStrings;

    // The words of the design-mode chrome: the floating toolbar of a selected item, its chips and the "+" (English when absent).
    designMode?: DesignModeStrings;

    undo: string;
    redo: string;
    palette: string;
    layoutDrawer: string;

    // The name of the folder that holds the component picker, and the picker's own words (English when absent).
    componentsDrawer: string;
    picker?: ComponentPickerStrings;

    // What each package's drawer is called, by the package's name. A package missing here is called by its name, split into words.
    packageTitles: Record<string, string>;
    closeDrawer: string;
    deleteElement: string;
    saveRefused: string;
    keepEditing: string;
    discardAndClose: string;

    // Saving without closing, and what the window says while there is something unsaved.
    save: string;
    unsavedChanges: string;

    // The title bar's button that previews the screen as the application would show it, with the changes not yet saved.
    previewScreen: string;
    allChangesSaved: string;

    // What the window says when the screen is opened to be read, and why nothing on it can be changed.
    readOnly: string;
    readOnlyReason: string;

    properties: {
        // Shown as the Properties tab's header when nothing on the screen is selected, above the screen's own
        // settings (template, dialog templates, forms) - the implicit subject until a component is selected.
        screenLabel: string;

        // The screen's place in the application - the modules and features above it - and moving it to another feature.
        location: {
            title: string;
            path: string;
            moveTo: string;
            moveHint: string;
            move: string;
            moved: (path: string) => string;
            moveFailed: string;
        };
        diagnostics: string;
        noProperties: string;
        designTimeActions: string;
        designTimeDesigners: string;
        designTimePropertyEditors: string;

        // Shown in place of a package's designer that failed, naming it.
        designerFailed: (designer: string) => string;

        // Shown once when the selected component's package is not in the application's UI profile, saying what to do about it.
        packageNotInProfile: (packageName: string) => string;
        layoutType: string;
        changeLayout: string;
        confirmLayoutTitle: string;
        confirmLayoutAccept: string;
        confirmLayoutCancel: string;
        exposure: string;
        exposeProperty: string;
        unexposeProperty: string;
        exposedToScopes: string;
        itemsLabel: string;
        addItem: string;

        // The icon fields of the Properties tab and of a navigation item. `iconPickerLabels` holds the picker's labels
        // that are built from a count or a query, which a resource file cannot carry; the picker has English defaults.
        icon: IconPropertyFieldStrings;
        iconPickerLabels?: IconPickerLabels;

        // The editor of a property that describes its own shape (a chart's data, a table's rows, a menu's items). English when the host
        // supplies none.
        structured?: StructuredEditorStrings;

        // The words of the property editors (spec section 8) and of the registry's host. English when the host supplies none.
        editors?: PropertyEditorStrings;
        templates: {
            label: string;
            choose: string;
            none: string;
            category: string;
            scope: string;
            anyScope: string;

            // The slice kinds a template is for (state change, state view), and the places a template declares for a screen to fill.
            sliceKinds: string;
            slots: string;
            slotsHint: string;
            missing: (template: string) => string;
            picker: TemplatePickerLabels;
            preview: (template: string) => string;
            previewState: string;
            previewStates: Record<TemplatePreviewState, string>;
            previewSize: string;
            previewSizes: Record<TemplatePreviewSize, string>;
            previewFailed: string;
            noPreview: string;
            provenanceLabel: string;
            license: string;
            attribution: string;
            compatibility: string;
            compatible: string;
            incompatible: string;
            apply: string;
            discard: string;
        };
        slots: {
            label: string;
            name: string;
            role: string;
            roles: { none: string; page: string; pane: string; panel: string };
            routed: string;
            routedHint: string;
            optional: string;
            optionalHint: string;
            add: string;
            remove: string;
            moveUp: string;
            moveDown: string;
            unnamed: string;
            newSlotName: string;
        };
        destination: {
            label: string;
            screen: string;
            noScreen: string;
            missingScreen: (screen: string) => string;
            route: string;
            routePlaceholder: string;
            slot: string;
            dialog: string;
            clear: string;
            kind: string;
            kinds: { default: string; slot: string; dialog: string; external: string };
            problems: Record<DestinationProblemKind, string>;
        };
        toolbarButton: {
            label: string;
            onClick: string;
            kinds: { none: string; navigate: string; openDialog: string; executeCommand: string };
            target: string;
            chooseTarget: string;
            missingTarget: (target: string) => string;
        };
        dialogTemplates: {
            label: string;
            name: string;
            displayName: string;
            description: string;
            add: string;
            remove: string;
            moveUp: string;
            moveDown: string;
            unnamed: string;
            newTemplateName: string;
            removeBlocked: string;
        };
        commandForm: {
            label: string;
            command: string;
            none: string;
            unknownCommand: string;
            chooseCommandHint: string;
            createForm: (command: string) => string;
        };
        forms: {
            label: string;
            ownedByElements: string;
            presented: string;
            notPresented: string;
            mode: string;
            auto: string;
            manual: string;
            fieldLabel: string;
            sourceProperty: string;
            mapping: Record<'autoMapped' | 'renamed' | 'composed' | 'broken', string>;
            markers: Record<'boundToCommand' | 'inheritedFromRules' | 'local', string>;
            control: string;
            controlText: string;
            controlPicker: string;
            choicesQuery: string;
            choicesShow: string;
            choicesInferred: string;
            fieldComposition: string;
            columns: string;
            column: (index: number) => string;
            gaps: string;
            columnGap: string;
            rowGap: string;
            placements: string;
            row: string;
            columnPlacement: string;
            rowSpan: string;
            columnSpan: string;
            fieldWidth: string;
            widthValue: string;
            widthUnit: string;
            remove: string;
        };
        binding: {
            source: string;
            sources: { dataContext: string; queryResult: string; componentProperty: string; literal: string; commandResponse: string };
            path: string;
            query: string;
            component: string;
            componentProperty: string;
            literalValue: string;
            literalType: string;
            literalNull: string;
            literalStructured: string;
            literalNoEditor: string;
            unsupportedValue: string;
            replaceUnsupported: string;
            incompatibleSource: string;
            unavailableSource: string;
            commandResponseOutOfScope: string;
            mode: string;
            inheritedMode: string;
            nullBehavior: string;
            defaultNullBehavior: string;
            expectedType: string;
            inferType: string;
            noSource: string;
            clear: string;
            missingQuery: (query: string) => string;
            missingComponent: (componentId: string) => string;
        };
        dataBinding: {
            feedsTitle: string;
            fedByFilter: (title: string) => string;
            fedByRoute: (parameter: string, slot: string) => string;
            fedByMapping: (source: string) => string;
            fedByNothing: string;
            routeSource: (parameter: string) => string;
            routeSourceNone: string;
            routeSourceOption: (parameter: string, slot: string) => string;
            addFilter: string;
            filtersInAddress: string;
            selectionTitle: string;
            selectionHint: string;
            selectionNone: string;
            selectionSlot: string;
            selectionScreen: string;
            selectionBy: string;
            selectionNoSlot: string;
            selectionSummary: (screen: string, slot: string, by: string) => string;
            statFollowsFilters: (filters: string) => string;
            statFollowsNothing: string;
        };
        query: {
            label: string;
            choose: string;
            none: string;
            missing: string;
            parameters: string;
            columns: string;
            sourceFor: (parameter: string) => string;
            noSource: string;
            showColumn: (field: string) => string;
            preview: {
                noQuery: string;
                missingQuery: string;
                loading: string;
                empty: string;
                error: string;
                ready: string;
            };
        };
        action: {
            label: string;
            none: string;
            slice: string;
            chooseSlice: string;
            inputs: string;
            opens: string;
            openings: { automatic: string; none: string; dialog: string; drawer: string; slot: string };
            opensIn: string;
            sourceFor: (input: string) => string;
            problems: { missingSlice: string; unmappedInput: (input: string) => string; unknownInput: (input: string) => string; unknownSource: (input: string) => string };
        };
    };

    // Optional for existing hosts that do not offer AI drafting.
    draft?: SceneScreenDraftStrings;

    structureLabel: string;
    structureEmpty: string;
    moveUp: string;
    moveDown: string;
    outdent: string;
    indent: string;
    moved: string;
    rejection: Record<StructureEditRejection, string>;
}
