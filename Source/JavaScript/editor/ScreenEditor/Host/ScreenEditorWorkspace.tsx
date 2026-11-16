// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { authoredRoot } from '../Document/studioScreen';
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
import type { ScreenEditorEnvironment, ScreenEditorResult, ScreenEditorSubject } from './ScreenEditorHost';
import { ScreenEditorWindow } from './ScreenEditorWindow';
import { inspectorWidth } from './ScreenEditorOverlayFrame';
import { savedScreenDocument } from '../DesignMode/Outlets/savedScreenDocument';
import { openSubject, type OpenedSubject } from './openSubject';
import { DefaultPaletteHost } from './DefaultPaletteHost';
import { ScreenEditorBoundary } from './ScreenEditorBoundary';
import { UnreadableScreen } from './UnreadableScreen';
import { ScreenEditorControlProviders } from './ScreenEditorControlProviders';
import { useScreenEditor } from './useScreenEditor';
import { viewportPresetSizes } from '../Viewport/viewportPresets';
import { ViewportPreset } from '../Viewport/ViewportPreset';
import './ScreenEditorWorkspace.css';

export interface ScreenEditorWorkspaceProps {
    subject: ScreenEditorSubject;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    layoutLabels: LayoutLabels;
    icons: PaletteIcons;
    paletteSources: readonly PaletteSource[];
    initialSize?: { width: number; height: number };

    // Called as the author edits, with what would be saved now. The host decides when to actually save.
    onChange?: (result: ScreenEditorResult) => void;

    // The slot the palette is mounted into, in the host's own toolbar. Without one the editor draws its own palette beside the window.
    renderPaletteHost?: (palette: ReactNode) => ReactNode;

    // Names the template being authored, shown at the start of the window's title bar.
    title?: ReactNode;

    // Called when the author closes the message shown in place of an editor that failed.
    onDismiss?: () => void;
}

// The screen editor set into a page instead of floating over one - what authoring a screen template uses. It is the same
// window, surface, palette and inspector as the floating editor, laid side by side, so there is one editor to learn and
// one set of rules for what may be changed.
export const ScreenEditorWorkspace = (props: ScreenEditorWorkspaceProps) => (
    <ScreenEditorBoundary strings={props.strings} subject={props.subject} onClose={props.onDismiss}>
        <OpeningScreenEditorWorkspace {...props} />
    </ScreenEditorBoundary>
);

const OpeningScreenEditorWorkspace = (props: ScreenEditorWorkspaceProps) => {
    const result = useMemo(() => openSubject(props.subject, props.environment.runtime, props.environment.selectableTemplates, props.environment.levelOutlets), [props.subject, props.environment.runtime, props.environment.selectableTemplates, props.environment.levelOutlets]);
    if (result.opened) return <OpenScreenEditorWorkspace key={props.environment.runtime.id} {...props} opened={result.subject} />;
    return <UnreadableScreen problem={result.problem} strings={props.strings} />;
};

const OpenScreenEditorWorkspace = ({ subject, environment, strings, layoutLabels, icons, paletteSources, initialSize, onChange, renderPaletteHost, title, opened }: ScreenEditorWorkspaceProps & { opened: OpenedSubject }) => {
    // What goes onto the screen counts as used by the picker, however it got there; the picker is built after the controller it adds through.
    const inserted = useRef<(key: string) => void>(undefined);
    const controller = useScreenEditor(opened, subject.authoringTemplate, environment, { draftStrings: strings.draft, onInserted: key => inserted.current?.(key) });
    const [size, setSize] = useState(initialSize ?? viewportPresetSizes[ViewportPreset.Desktop]);
    const [isInspectorOpen, setInspectorOpen] = useState(true);

    const latest = useRef(onChange);
    latest.current = onChange;
    useEffect(() => {
        const root = authoredRoot(controller.document, subject.authoringTemplate);
        latest.current?.({
            ...savedScreenDocument(controller.document, subject.screen, environment.levelOutlets !== undefined),
            legacyElements: projectToLegacyElements(root, environment.runtime.legacyTypeOf),
            windowSize: size,
            layout: surfaceLayoutOfRoot(root),
            changed: controller.isDirty,
        });
    }, [controller.document, controller.isDirty, size, subject.authoringTemplate, subject.screen, environment.runtime.legacyTypeOf, environment.levelOutlets]);

    const insert = useCallback((payload: unknown) => {
        if (!isPalettePayload(payload)) return;
        const selection = controller.selection as { children?: unknown[] } | undefined;
        const parent = selection && 'children' in selection ? controller.selectedId : undefined;
        if (payload.kind === 'layout') controller.insertLayout(payload.item, parent, undefined);
        else if (payload.kind === 'field') controller.insertDataField(payload.field, parent, undefined);
        else controller.insertComponent(insertedComponentName(payload.componentName, payload.package), parent, undefined);
    }, [controller]);

    const { palette, recordInserted } = useComponentPalette({ strings, layoutLabels, icons, paletteSources, onAdd: entry => insert(entry.payload) });
    inserted.current = recordInserted;

    // The same host services as the floating editor, around everything the workspace draws - palette, surface and inspector - so a
    // control behaves alike in both: the rich text control is editable here as well, and an upload goes through the host's handler.
    return (
        <ScreenEditorControlProviders environment={environment}>
            <div className='studio-screen-editor-workspace'>
                {renderPaletteHost ? renderPaletteHost(palette) : <DefaultPaletteHost placement='inline'>{palette}</DefaultPaletteHost>}
                <div className='studio-screen-editor-workspace__stage'>
                    <ScreenEditorWindow
                        controller={controller}
                        environment={environment}
                        strings={strings}
                        window={{ size, setSize, isInspectorOpen, toggleInspector: () => setInspectorOpen(open => !open), available: { width: 1600, height: 1000 } }}
                        authoringTemplate={subject.authoringTemplate}
                        title={title}
                        deviceFrame
                    />
                </div>
                {isInspectorOpen && (
                    <aside className='studio-screen-editor-workspace__inspector' style={{ flexBasis: inspectorWidth }}>
                        <ScreenInspector
                            strings={strings}
                            controller={controller}
                            environment={environment}
                            authoringTemplate={subject.authoringTemplate}
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
        </ScreenEditorControlProviders>
    );
};
