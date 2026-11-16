// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SceneDocument } from '@cratis/scene.model';
import { ScreenEditorOverlayFrame } from './ScreenEditorOverlayFrame';
import { authoredRoot } from '../Document/studioScreen';
import { savedScreenDocument } from '../DesignMode/Outlets/savedScreenDocument';
import { projectToLegacyElements } from '../PrototypeProjection/projectToLegacyElements';
import { StructureTree } from '../Inspector/StructureTree';
import { ScreenInspector } from '../Inspector/ScreenInspector';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import type { PaletteIcons, PaletteSource } from '../Palette/buildPalette';
import { useComponentPalette } from '../Palette/useComponentPalette';
import { isPalettePayload } from '../Palette/PaletteEntry';
import { insertedComponentName } from '../Palette/insertedComponentName';
import type { LayoutLabels } from '../Layouts/toLayoutContainerDescriptors';
import { surfaceLayoutOfRoot } from '../Selection/surfaceLayoutOfRoot';
import type { ScreenEditorEnvironment, ScreenEditorResult, ScreenEditorSubject } from './ScreenEditorHost';
import { openSubject, type OpenedSubject } from './openSubject';
import { DefaultPaletteHost } from './DefaultPaletteHost';
import { ScreenEditorBoundary } from './ScreenEditorBoundary';
import { UnreadableScreen } from './UnreadableScreen';
import { createWindowSizeMemory, type WindowSizeMemory } from '../Viewport/windowSizeMemory';
import { resolveInitialWindowSize } from '../Viewport/windowSizing';
import { ScreenEditorControlProviders } from './ScreenEditorControlProviders';
import { ScreenEditorWindow } from './ScreenEditorWindow';
import { useScreenEditor } from './useScreenEditor';
import { readOnlyController } from './readOnlyController';
import type { SceneScreenDraftAgent } from '../Drafting/SceneScreenDraft';
import { SceneScreenDraftToolbar } from '../Drafting/SceneScreenDraftToolbar';
import './ScreenEditorOverlay.css';

export interface ScreenEditorOverlayProps {
    subject: ScreenEditorSubject;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    layoutLabels: LayoutLabels;
    icons: PaletteIcons;
    paletteSources: readonly PaletteSource[];
    sourceRect: DOMRect;

    // The size saved with the screen where it lives, if the host keeps one. The window opens at it unless this person left it at another size.
    initialSize?: { width: number; height: number };

    // Names the screen for the window's memory: a window left at a size reopens at that size, for this person on this browser, and a screen never
    // opened before opens at the size the last one was left at. Without a name the window remembers nothing. The size is never part of the screen.
    rememberWindowAs?: string;

    // Where those sizes are kept; the browser's local storage when left out.
    windowMemory?: WindowSizeMemory;
    centerOffsetX?: number;

    // The slot the palette is mounted into, in the host's own toolbar. Without one the editor draws its own palette beside the window.
    renderPaletteHost?: (palette: ReactNode) => ReactNode;
    onClose: (result: ScreenEditorResult) => void;

    // Saves before the window closes. A refusal keeps the draft open and returns the message to show there.
    onBeforeClose?: (result: ScreenEditorResult) => Promise<string | undefined>;

    // Called when the window is closed without a screen to save - when the saved screen could not be opened. Nothing is saved.
    onDismiss?: () => void;

    // Previews the screen as it is now - unsaved changes included - as the application would show it.
    // `fitsDialog` says the screen opens as a dialog or drawer, so the host can preview it alone rather than in its page.
    onPreview?: (document: SceneDocument, fitsDialog: boolean) => void;
    // True while the host shows the application preview above the editor; the draft review steps aside until it exits.
    previewing?: boolean;

    // Opens the screen to be read: it can be selected and inspected, but nothing on it changes and nothing is saved when it closes.
    readOnly?: boolean;

    // Enables reviewable additions for ordinary writable screens only.
    draftAgent?: SceneScreenDraftAgent;
}

const available = () => ({ width: window.innerWidth - 64, height: window.innerHeight - 64 });

// The floating screen editor. It opens a screen onto the Scene model, draws it through Scene's own renderer inside the
// shared overlay frame, and hands back the edited document - with the projection older readers still draw - when it closes.
export const ScreenEditorOverlay = (props: ScreenEditorOverlayProps) => (
    <ScreenEditorBoundary strings={props.strings} subject={props.subject} onClose={() => props.onDismiss?.()}>
        <OpeningScreenEditorOverlay {...props} />
    </ScreenEditorBoundary>
);

const OpeningScreenEditorOverlay = (props: ScreenEditorOverlayProps) => {
    const result = useMemo(() => openSubject(props.subject, props.environment.runtime, props.environment.selectableTemplates, props.environment.levelOutlets), [props.subject, props.environment.runtime, props.environment.selectableTemplates, props.environment.levelOutlets]);
    // The session is made once from what was opened, so a different runtime is a different editor.
    if (result.opened) return <OpenScreenEditorOverlay key={props.environment.runtime.id} {...props} opened={result.subject} />;

    return (
        <ScreenEditorOverlayFrame sourceRect={props.sourceRect} initialSize={props.initialSize} centerOffsetX={props.centerOffsetX} onClosed={() => props.onDismiss?.()}>
            {frame => <UnreadableScreen problem={result.problem} strings={props.strings} onClose={() => frame.close()} />}
        </ScreenEditorOverlayFrame>
    );
};

const OpenScreenEditorOverlay = ({ subject, environment, strings, layoutLabels, icons, paletteSources, sourceRect, initialSize, rememberWindowAs, windowMemory, centerOffsetX, renderPaletteHost, onClose, onBeforeClose, onPreview, readOnly = false, draftAgent, previewing, opened }: ScreenEditorOverlayProps & { opened: OpenedSubject }) => {
    // What goes onto the screen counts as used by the picker, however it got there; the picker is built after the controller it adds through.
    const inserted = useRef<(key: string) => void>(undefined);
    const editing = useScreenEditor(opened, subject.authoringTemplate, environment, { draftStrings: strings.draft, onInserted: key => inserted.current?.(key) });
    const controller = readOnly ? readOnlyController(editing, strings.readOnlyReason) : editing;

    // The window opens once, at the size worked out from what is known when it opens; and it is left at a size that is remembered.
    const memory = useMemo(() => windowMemory ?? createWindowSizeMemory(), [windowMemory]);
    const openedAt = useMemo(() => resolveInitialWindowSize({
        remembered: rememberWindowAs ? memory.read(rememberWindowAs) : undefined,
        saved: initialSize,
        lastUsed: memory.readLastUsed(),
    }, available()), []);
    const remember = useCallback((size: { width: number; height: number }) => { if (rememberWindowAs) memory.write(rememberWindowAs, size); }, [memory, rememberWindowAs]);

    const close = useCallback((size: { width: number; height: number }) => {
        remember(size);
        const root = authoredRoot(controller.document, subject.authoringTemplate);
        onClose({
            ...savedScreenDocument(controller.document, subject.screen, environment.levelOutlets !== undefined),
            legacyElements: projectToLegacyElements(root, environment.runtime.legacyTypeOf),
            windowSize: size,
            layout: surfaceLayoutOfRoot(root),
            changed: controller.isDirty,
        });
    }, [controller, environment.runtime.legacyTypeOf, environment.levelOutlets, onClose, remember, subject.authoringTemplate, subject.screen]);

    const [saveFailure, setSaveFailure] = useState<string>();
    const closeWhenSaved = useCallback(async (windowSize: { width: number; height: number }) => {
        // Remembered before the save, so a refused save that is given up on still leaves the window where it was put.
        remember(windowSize);
        if (readOnly) return true;
        const root = authoredRoot(controller.document, subject.authoringTemplate);
        const next = {
            ...savedScreenDocument(controller.document, subject.screen, environment.levelOutlets !== undefined),
            legacyElements: projectToLegacyElements(root, environment.runtime.legacyTypeOf),
            windowSize,
            layout: surfaceLayoutOfRoot(root),
            changed: controller.isDirty,
        };
        const refusal = await onBeforeClose?.(next);
        setSaveFailure(refusal);
        return !refusal;
    }, [controller, environment.runtime.legacyTypeOf, environment.levelOutlets, onBeforeClose, readOnly, remember, subject.authoringTemplate, subject.screen]);

    const { palette, recordInserted } = useComponentPalette({ strings, layoutLabels, icons, paletteSources, onAdd: entry => insertFromPayload(entry.payload) });
    inserted.current = recordInserted;

    function insertFromPayload(payload: unknown) {
        if (!isPalettePayload(payload)) return;
        const parent = controller.selection && isContainer(controller) ? controller.selectedId : undefined;
        if (payload.kind === 'layout') controller.insertLayout(payload.item, parent, undefined);
        else if (payload.kind === 'field') controller.insertDataField(payload.field, parent, undefined);
        else controller.insertComponent(insertedComponentName(payload.componentName, payload.package), parent, undefined);
    }

    return (
        <ScreenEditorControlProviders environment={environment}>
            {readOnly ? null : renderPaletteHost ? renderPaletteHost(palette) : <DefaultPaletteHost placement='floating'>{palette}</DefaultPaletteHost>}
            <ScreenEditorOverlayFrame
                sourceRect={sourceRect}
                initialSize={openedAt}
                centerOffsetX={centerOffsetX}
                canClose={closeWhenSaved}
                onClosed={close}
                renderInspector={frame => (
                    <ScreenInspector
                        strings={strings}
                        controller={controller}
                        environment={environment}
                        authoringTemplate={subject.authoringTemplate}
                        onClose={frame.toggleInspector}
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
                )}
            >
                {frame => (
                    <ScreenEditorWindow
                        controller={controller}
                        environment={environment}
                        strings={strings}
                        window={{ ...frame, available: available() }}
                        authoringTemplate={subject.authoringTemplate}
                        saveFailure={saveFailure}
                        onKeepEditing={() => setSaveFailure(undefined)}
                        onDiscard={frame.closeWithoutSaving}
                        onPreview={onPreview}
                        readOnly={readOnly}
                        toolbarActions={<SceneScreenDraftToolbar controller={controller} environment={environment} strings={strings} agent={draftAgent} readOnly={readOnly} authoringTemplate={subject.authoringTemplate} onPreview={onPreview} previewing={previewing} />}
                    />
                )}
            </ScreenEditorOverlayFrame>
        </ScreenEditorControlProviders>
    );
};

function isContainer(controller: { selection?: unknown }): boolean {
    return !!controller.selection && 'children' in (controller.selection as object);
}
