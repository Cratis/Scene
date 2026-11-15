// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import { IconButton } from '@cratis/components/Common';
import { WindowTitleBar } from './WindowTitleBar';
import { SaveRefusedNotice } from './SaveRefusedNotice';
import { FaEye, FaRedo, FaSlidersH, FaTrash, FaUndo } from 'react-icons/fa';
import type { SceneDocument } from '@cratis/scene.model';
import { ViewportControls } from '../Inspector/ViewportControls';
import { DialogPresentation } from '../Templates/dialogPresentation';
import { useShellFrame } from '../ShellFrame/useShellFrame';
import type { ScreenEditorStrings } from '../Inspector/ScreenEditorStrings';
import { ScreenSurface } from '../Surface/ScreenSurface';
import type { ScreenEditorController } from './ScreenEditorController';
import type { ScreenEditorEnvironment } from './ScreenEditorHost';
import './ScreenEditorOverlay.css';

// The height of the title bar, which the screen's viewport does not include.
const titleBarHeight = 40;

// What the window needs to know about the space it sits in, whoever provides it.
export interface ScreenEditorWindowState {
    size: { width: number; height: number };
    setSize: (size: { width: number; height: number }) => void;
    isInspectorOpen: boolean;
    toggleInspector: () => void;

    // The room the display has for the window, for fitting a device preset into it.
    available: { width: number; height: number };
}

export interface ScreenEditorWindowProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    window: ScreenEditorWindowState;

    // The screen template or dialog template being authored, when it is one: it decides whether the application's shell is drawn by default.
    authoringTemplate?: string;

    // Names what is being edited, shown at the start of the title bar.
    title?: ReactNode;

    // When set the screen is drawn at exactly the window's size inside the canvas, as a device frame.
    deviceFrame?: boolean;

    // A refusal returned while trying to save. The editor stays open so the draft can be corrected and tried again.
    saveFailure?: string;

    // What the person can do about a refused save: carry on editing, or give up the changes and leave. Without them the notice only informs.
    onKeepEditing?: () => void;
    onDiscard?: () => void;

    // Previews the screen - with the changes not yet saved - as the application would show it. The button is there only when the host can.
    // `fitsDialog` says the screen opens as a dialog or drawer, so the host can preview it alone rather than in its page.
    onPreview?: (document: SceneDocument, fitsDialog: boolean) => void;

    // The screen is open to be read: the window says so, and offers no undo, redo or delete.
    readOnly?: boolean;

    // Optional host-provided controls; ordinary screen controls remain available.
    toolbarActions?: ReactNode;

    // Hands the controls to the host to draw in its own title bar - a dialog's, say - instead of the window drawing a title bar of its own.
    renderControls?: (controls: ReactNode) => ReactNode;
}

// The window itself: the title bar with the device presets, undo and redo, delete and the inspector toggle, and the canvas
// the screen is drawn and edited on. The floating overlay and the inline template workspace both draw exactly this.
export const ScreenEditorWindow = ({ controller, environment, strings, window: state, authoringTemplate, title, deviceFrame = false, saveFailure, onKeepEditing, onDiscard, onPreview, readOnly = false, toolbarActions, renderControls }: ScreenEditorWindowProps) => {
    const shell = useShellFrame(controller.document, environment.runtime, authoringTemplate, undefined, controller.composition.templates.length > 0, controller.opensOverPage);
    const selectedLocal = !!controller.selectedId && controller.canRemove(controller.selectedId);

    const controls = (
        <>
            <span className='studio-screen-editor-window__state' role='status' data-dirty={controller.isDirty ? '' : undefined} data-read-only={readOnly ? '' : undefined} title={readOnly ? strings.readOnlyReason : undefined}>
                {readOnly ? strings.readOnly : controller.isDirty ? strings.unsavedChanges : strings.allChangesSaved}
            </span>
            <ViewportControls windowSize={state.size} available={state.available} strings={strings} onResize={state.setSize} shell={shell.available ? { shown: shell.shown, toggle: shell.toggle } : undefined} opensAs={shell.dialog ? (shell.dialog.presentation === DialogPresentation.Drawer ? strings.opensAsDrawer : strings.opensAsDialog) : undefined} template={shell.template.available ? shell.template : undefined} />
            {onPreview && (
                <IconButton icon={<FaEye aria-hidden='true' />} aria-label={strings.previewScreen} title={strings.previewScreen} variant='ghost' size='small' data-studio-preview-screen='' onClick={() => onPreview(controller.document, shell.dialog !== undefined)} />
            )}
            {!readOnly && (
                <>
                    {toolbarActions}
                    <IconButton icon={<FaUndo aria-hidden='true' />} aria-label={strings.undo} title={strings.undo} variant='ghost' size='small' disabled={!controller.canUndo} onClick={controller.undo} />
                    <IconButton icon={<FaRedo aria-hidden='true' />} aria-label={strings.redo} title={strings.redo} variant='ghost' size='small' disabled={!controller.canRedo} onClick={controller.redo} />
                    <IconButton
                        icon={<FaTrash aria-hidden='true' />}
                        aria-label={strings.deleteElement}
                        title={strings.deleteElement}
                        variant='ghost'
                        size='small'
                        disabled={!selectedLocal}
                        onClick={() => controller.selectedId && controller.remove(controller.selectedId)}
                    />
                </>
            )}
            <IconButton
                icon={<FaSlidersH aria-hidden='true' />}
                aria-label={state.isInspectorOpen ? strings.closeInspector : strings.openInspector}
                aria-pressed={state.isInspectorOpen}
                title={state.isInspectorOpen ? strings.closeInspector : strings.openInspector}
                variant='ghost'
                size='small'
                onClick={state.toggleInspector}
            />
        </>
    );

    return (
        <div className='studio-screen-editor-window' role='group' aria-label={strings.windowLabel}>
            {/* The controls are the title bar's content; a centred title would draw over them. */}
            {renderControls ? renderControls(controls) : <WindowTitleBar controls={controls} title={title} />}
            {saveFailure && <SaveRefusedNotice strings={strings} message={saveFailure} onKeepEditing={onKeepEditing} onDiscard={onDiscard} />}
            <div className='studio-screen-editor-window__canvas' data-studio-viewport=''>
                <div className={deviceFrame ? 'studio-screen-editor-window__viewport studio-screen-editor-window__device' : 'studio-screen-editor-window__viewport'} style={deviceFrame ? { width: state.size.width, minHeight: state.size.height - titleBarHeight } : undefined}>
                    {shell.peeking && (
                        <div className='studio-screen-editor-window__peek' role='status'>
                            <span>{strings.shellPeeking(shell.peekingName)}</span>
                            <button type='button' onClick={shell.back}>{strings.shellPeekBack}</button>
                        </div>
                    )}
                    {/* No interaction scope is provided, so components render but run nothing while the screen is edited. */}
                    <ScreenSurface
                        controller={controller}
                        environment={environment}
                        resolveBinding={() => undefined}
                        strings={strings.surface}
                        editorStrings={strings}
                        viewportHeight={deviceFrame ? state.size.height - titleBarHeight : undefined}
                        shell={shell}
                    />
                </div>
            </div>
        </div>
    );
};
