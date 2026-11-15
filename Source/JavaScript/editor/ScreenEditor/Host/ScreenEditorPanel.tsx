// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SceneDocument } from '@cratis/scene.model';
import { authoredRoot, screenName } from '../Document/studioScreen';
import type { SceneDocumentProblem } from '../Document/readSceneDocument';
import { savedScreenDocument } from '../DesignMode/Outlets/savedScreenDocument';
import { projectToLegacyElements } from '../PrototypeProjection/projectToLegacyElements';
import { ScreenInspector } from '../Inspector/ScreenInspector';
import { StructureTree } from '../Inspector/StructureTree';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import type { PaletteIcons, PaletteSource } from '../Palette/buildPalette';
import { useComponentPalette } from '../Palette/useComponentPalette';
import { isPalettePayload } from '../Palette/PaletteEntry';
import { insertedComponentName } from '../Palette/insertedComponentName';
import { surfaceLayoutOfRoot } from '../Selection/surfaceLayoutOfRoot';
import type { LayoutLabels } from '../Layouts/toLayoutContainerDescriptors';
import { viewportPresetSizes } from '../Viewport/viewportPresets';
import { ViewportPreset } from '../Viewport/ViewportPreset';
import type { SceneScreenDraftAgent } from '../Drafting/SceneScreenDraft';
import { SceneScreenDraftToolbar } from '../Drafting/SceneScreenDraftToolbar';
import { DataDrawer, type DataDrawerStrings } from '../Data/DataDrawer';
import { screenDataOf, type DataField, type QueryDataField } from '../Data/DataField';
import { commandContextOf } from '../Data/commandContext';
import { queryTablesOf } from '../Data/queryTables';
import type { DataFieldRefusal } from '../Data/insertDataField';
import type { ScreenEditorEnvironment, ScreenEditorResult, ScreenEditorSubject } from './ScreenEditorHost';
import type { ScreenEditorController } from './ScreenEditorController';
import { ScreenEditorWindow } from './ScreenEditorWindow';
import { inspectorWidth } from './ScreenEditorOverlayFrame';
import { openSubject, type OpenedSubject } from './openSubject';
import { ScreenEditorBoundary } from './ScreenEditorBoundary';
import { UnreadableScreen } from './UnreadableScreen';
import { ScreenEditorControlProviders } from './ScreenEditorControlProviders';
import { useScreenEditor } from './useScreenEditor';
import { readOnlyController } from './readOnlyController';
import './ScreenEditorPanel.css';

type Size = { width: number; height: number };

// What the panel hands its host to lay out: the design surface with its inspector, the screen as it is edited, and what would be saved now.
export interface ScreenEditorPanelParts {
    controller: ScreenEditorController;
    design: ReactNode;
    size: Size;
    resultOf: () => ScreenEditorResult;
}

export interface ScreenEditorPanelData {
    // The slice whose command and queries the Data drawer offers.
    sliceId?: string;
    icon: ReactNode;
    strings: DataDrawerStrings;
    // Says why a piece of data could not become a field.
    onRefused?: (refusal: DataFieldRefusal) => void;
}

export interface ScreenEditorPanelProps {
    subject: ScreenEditorSubject;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    layoutLabels: LayoutLabels;
    icons: PaletteIcons;
    paletteSources: readonly PaletteSource[];
    initialSize?: Size;

    // Where the window's controls - saved state, device presets, preview, undo and redo, delete, the inspector - go, in the host's own title bar.
    // The palette and the Data drawer are not among them: they are the toolbar across the top of the design area.
    renderToolbar: (toolbar: ReactNode) => ReactNode;

    // The Data drawer, when the host has data to offer.
    data?: ScreenEditorPanelData;
    readOnly?: boolean;

    // Draws what is added to the Screen's properties in the inspector - what the host knows about the screen that the editor does not. It is
    // given the controller, which the host has no other way to reach before the editor is open.
    renderScreenProperties?: (controller: ScreenEditorController) => ReactNode;
    draftAgent?: SceneScreenDraftAgent;
    previewing?: boolean;
    // `fitsDialog` says the screen opens as a dialog or drawer, so the host can preview it alone rather than in its page.
    onPreview?: (document: SceneDocument, fitsDialog: boolean) => void;

    // A save that was refused, shown above the surface with what can be done about it.
    saveFailure?: string;
    onKeepEditing?: () => void;
    onDiscard?: () => void;

    // Called when the author closes the message shown in place of an editor that failed or a screen that could not be opened.
    onDismiss?: () => void;

    // Drawn in place of the editor when the screen cannot be opened, so the host can frame the reason; the editor's own message otherwise.
    renderUnreadable?: (problem: SceneDocumentProblem) => ReactNode;
    children: (parts: ScreenEditorPanelParts) => ReactNode;
}

// The screen editor set into a host's dialog: the same surface, palette, inspector, undo and redo as the floating editor, with the
// toolbar handed to the host's title bar and the design surface handed to the host to place among its own parts.
export const ScreenEditorPanel = (props: ScreenEditorPanelProps) => (
    <ScreenEditorBoundary strings={props.strings} subject={props.subject} onClose={props.onDismiss}>
        <OpeningScreenEditorPanel {...props} />
    </ScreenEditorBoundary>
);

const OpeningScreenEditorPanel = (props: ScreenEditorPanelProps) => {
    const result = useMemo(() => openSubject(props.subject, props.environment.runtime, props.environment.selectableTemplates, props.environment.levelOutlets), [props.subject, props.environment.runtime, props.environment.selectableTemplates, props.environment.levelOutlets]);
    if (result.opened) return <OpenScreenEditorPanel key={props.environment.runtime.id} {...props} opened={result.subject} />;
    return props.renderUnreadable ? props.renderUnreadable(result.problem) : <UnreadableScreen problem={result.problem} strings={props.strings} onClose={props.onDismiss} />;
};

const OpenScreenEditorPanel = ({
    subject, environment, strings, layoutLabels, icons, paletteSources, initialSize, renderToolbar, data, readOnly = false, renderScreenProperties, draftAgent, previewing, onPreview,
    saveFailure, onKeepEditing, onDiscard, children, opened,
}: ScreenEditorPanelProps & { opened: OpenedSubject }) => {
    const inserted = useRef<(key: string) => void>(undefined);
    const editing = useScreenEditor(opened, subject.authoringTemplate, environment, { draftStrings: strings.draft, onInserted: key => inserted.current?.(key) });
    const controller = readOnly ? readOnlyController(editing, strings.readOnlyReason) : editing;
    const [size, setSize] = useState<Size>(initialSize ?? viewportPresetSizes[ViewportPreset.Desktop]);
    // The inspector starts open: it holds the Screen properties - what the screen fits and submits - while nothing is selected.
    const [isInspectorOpen, setInspectorOpen] = useState(true);

    // The screen is drawn at the size chosen for it, but never wider than the room the dialog gives it beside the inspector: a wider one would
    // run under the inspector, out of reach.
    const stage = useRef<HTMLDivElement>(null);
    const [room, setRoom] = useState<Size>({ width: window.innerWidth - 64, height: window.innerHeight - 64 });
    useEffect(() => {
        const element = stage.current;
        if (!element || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) setRoom(current => current.width === width && current.height === height ? current : { width, height });
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    const drawnSize = { width: Math.min(size.width, room.width), height: size.height };

    const parentForInsert = () => {
        const selection = controller.selection as { children?: unknown[] } | undefined;
        return selection && 'children' in selection ? controller.selectedId : undefined;
    };

    const insert = (payload: unknown) => {
        if (!isPalettePayload(payload)) return;
        const parent = parentForInsert();
        if (payload.kind === 'layout') controller.insertLayout(payload.item, parent, undefined);
        else if (payload.kind === 'field') addField(payload.field);
        else controller.insertComponent(insertedComponentName(payload.componentName, payload.package), parent, undefined);
    };

    const addField = (field: DataField) => {
        const refusal = controller.insertDataField(field, parentForInsert(), undefined);
        if (refusal) data?.onRefused?.(refusal);
    };

    const { palette, recordInserted } = useComponentPalette({ strings, layoutLabels, icons, paletteSources, onAdd: entry => insert(entry.payload), labelled: true, disabled: readOnly, disabledReason: strings.readOnlyReason });
    inserted.current = recordInserted;

    const screenData = useMemo(
        () => screenDataOf(data?.sliceId, environment.stateChangeSlices, environment.queryCandidates),
        [data?.sliceId, environment.stateChangeSlices, environment.queryCandidates]);

    const forms = controller.document.screens.find(screen => screen.name === screenName)?.forms;
    const commandContext = useMemo(
        () => commandContextOf(data?.sliceId, environment.stateChangeSlices, forms ?? [], controller.composition.roots, environment.queryCandidates),
        [data?.sliceId, environment.stateChangeSlices, forms, controller.composition.roots, environment.queryCandidates]);
    const shownColumns = useMemo(() => queryTablesOf(controller.composition.roots), [controller.composition.roots]);
    const isShown = (field: QueryDataField) => shownColumns.some(table => table.binding.queryId === field.queryId && table.binding.results.some(result => result.field === field.field));
    const generate = () => {
        if (!data?.sliceId) return;
        const refusal = controller.generateForm(data.sliceId, parentForInsert(), undefined);
        if (refusal) data.onRefused?.(refusal);
    };

    const resultOf = useCallback((): ScreenEditorResult => {
        const root = authoredRoot(controller.document, subject.authoringTemplate);
        return {
            ...savedScreenDocument(controller.document, subject.screen, environment.levelOutlets !== undefined),
            legacyElements: projectToLegacyElements(root, environment.runtime.legacyTypeOf),
            windowSize: size,
            layout: surfaceLayoutOfRoot(root),
            changed: controller.isDirty,
        };
    }, [controller.document, controller.isDirty, size, subject.authoringTemplate, subject.screen, environment.runtime.legacyTypeOf, environment.levelOutlets]);

    const toolbar = (controls: ReactNode) => renderToolbar(<div className='studio-screen-editor-panel__controls'>{controls}</div>);

    const design = (
        <div className='studio-screen-editor-panel'>
            <div className='studio-screen-editor-panel__toolbar' role='toolbar' aria-label={strings.componentsDrawer}>
                {palette}
                {data && <DataDrawer data={screenData} command={commandContext} icon={data.icon} strings={data.strings} disabled={readOnly} labelled disabledReason={strings.readOnlyReason} onAdd={addField} isShown={isShown} onRemove={controller.removeDataField} onGenerate={generate} />}
            </div>
            <div className='studio-screen-editor-panel__body'>
                <div className='studio-screen-editor-panel__stage' ref={stage}>
                    <ScreenEditorWindow
                        controller={controller}
                        environment={environment}
                        strings={strings}
                        window={{ size: drawnSize, setSize, isInspectorOpen, toggleInspector: () => setInspectorOpen(open => !open), available: room }}
                        authoringTemplate={subject.authoringTemplate}
                        deviceFrame
                        saveFailure={saveFailure}
                        onKeepEditing={onKeepEditing}
                        onDiscard={onDiscard}
                        onPreview={onPreview}
                        readOnly={readOnly}
                        renderControls={toolbar}
                        toolbarActions={<SceneScreenDraftToolbar controller={controller} environment={environment} strings={strings} agent={draftAgent} readOnly={readOnly} authoringTemplate={subject.authoringTemplate} onPreview={onPreview} previewing={previewing} />}
                    />
                </div>
                {isInspectorOpen && (
                    <aside className='studio-screen-editor-panel__inspector' style={{ flexBasis: inspectorWidth }}>
                        <ScreenInspector
                            strings={strings}
                            controller={controller}
                            environment={environment}
                            authoringTemplate={subject.authoringTemplate}
                            screenProperties={renderScreenProperties?.(controller)}
                            onClose={() => setInspectorOpen(false)}
                            structure={
                                <StructureTree
                                    roots={controller.composition.roots}
                                    adapter={controller.adapter}
                                    strings={strings}
                                    selectedId={controller.selectedId}
                                    onSelect={controller.select}
                                    onEdit={controller.move}
                                    onRemove={controller.remove}
                                />
                            }
                        />
                    </aside>
                )}
            </div>
        </div>
    );

    return (
        <ScreenEditorControlProviders environment={environment}>
            {children({ controller, design, size, resultOf })}
        </ScreenEditorControlProviders>
    );
};
