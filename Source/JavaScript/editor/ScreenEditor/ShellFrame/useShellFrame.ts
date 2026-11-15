// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DestinationReference, SceneDocument } from '@cratis/scene.model';
import { dialogFrameOf, type DialogFrameDescription } from '../Templates/dialogPresentation';
import { blueprintDialogTemplatesOf, pageTemplateNamesOf } from '../Templates/displayedFits';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import { composeShellFrame, effectiveShellFor, type ShellFrame } from './frameInShell';
import { canPeek, peekNameOf } from './peekOfDestination';
import { createShellPreference, shellCanFrame, shellShownByDefault, shellSubjectOf, templateCanFrame, templateShownByDefault, type ShellPreference } from './shellVisibility';

// What the screen editor's window and surface share about the application's shell.
export interface ShellState {
    // Whether the toggle is offered: not for the template that is the shell itself.
    available: boolean;
    shown: boolean;
    toggle(): void;

    // The template the screen is built from, around the screen's own content: the toggle is offered where a screen has one. Hidden, the surface draws the
    // slice's own content and nothing around it.
    template: { available: boolean; shown: boolean; toggle(): void };

    // How the screen opens when it is a dialog or a drawer: the frame it is drawn in instead of the shell, for the window to say so.
    dialog?: DialogFrameDescription;

    // The shell composed around a place for the screen; absent while it is hidden.
    frame?: ShellFrame;

    // The destination peeked at from the shell's navigation, if any.
    peeking?: DestinationReference;
    peekingName: string;
    navigate(destination: DestinationReference): void;
    back(): void;
}

const nothing = (): void => undefined;

// The shell around the screen being edited (StudioIssues#721): resolved by the engine's own function, composed by Scene's, shown or hidden by
// the author's remembered choice. The composed tree is kept until the profile, the packages or the templates change, so an edit of the screen
// does not recompose the shell (the performance guard of the issue).
export function useShellFrame(document: SceneDocument, runtime: ScreenEditorRuntime, authoringTemplate: string | undefined, preference: ShellPreference = defaultPreference, hasTemplate = false, opensOverPage = false): ShellState {
    const { layouts, screenTemplates, dialogTemplates } = document;
    const shape = useMemo(() => ({ layouts, screenTemplates, dialogTemplates }) as SceneDocument, [layouts, screenTemplates, dialogTemplates]);
    const name = useMemo(() => effectiveShellFor(runtime, shape).name, [runtime, shape]);
    const knownDialogTemplates = useMemo(() => blueprintDialogTemplatesOf(runtime.bundles), [runtime.bundles]);
    const pageTemplateNames = useMemo(() => pageTemplateNamesOf(undefined, runtime.bundles), [runtime.bundles]);
    const subject = shellSubjectOf(document, authoringTemplate, name, knownDialogTemplates, pageTemplateNames, opensOverPage);
    const dialog = useMemo(() => authoringTemplate === undefined ? dialogFrameOf(document, knownDialogTemplates, pageTemplateNames, opensOverPage) : undefined, [authoringTemplate, document, knownDialogTemplates, pageTemplateNames, opensOverPage]);
    const [chosen, setChosen] = useState<boolean | undefined>(() => preference.read(subject));
    const [chosenTemplate, setChosenTemplate] = useState<boolean | undefined>(() => preference.readTemplate(subject));
    const [peeking, setPeeking] = useState<DestinationReference>();

    // The remembered answer is read again when the subject is another kind (a dialog template after a screen).
    useEffect(() => { setChosen(preference.read(subject)); setChosenTemplate(preference.readTemplate(subject)); setPeeking(undefined); }, [preference, subject]);

    const available = shellCanFrame(subject);
    const shown = available && (chosen ?? shellShownByDefault(subject));
    const frame = useMemo(() => shown ? composeShellFrame(runtime, shape) : undefined, [shown, runtime, shape]);

    const toggle = useCallback(() => {
        const next = !shown;
        setChosen(next);
        setPeeking(undefined);
        preference.write(subject, next);
    }, [shown, subject, preference]);
    const templateAvailable = templateCanFrame(subject) && hasTemplate;
    const templateShown = !templateCanFrame(subject) || (chosenTemplate ?? templateShownByDefault(subject));
    const toggleTemplate = useCallback(() => {
        const next = !templateShown;
        setChosenTemplate(next);
        preference.writeTemplate(subject, next);
    }, [templateShown, subject, preference]);
    const navigate = useCallback((destination: DestinationReference) => { if (canPeek(destination)) setPeeking(destination); }, []);
    const back = useCallback(() => setPeeking(undefined), []);

    return { available, shown, toggle, ...(dialog ? { dialog } : {}), template: { available: templateAvailable, shown: templateShown, toggle: toggleTemplate }, frame, peeking: shown ? peeking : undefined, peekingName: peeking ? peekNameOf(peeking) : '', navigate: shown ? navigate : nothing, back };
}

const defaultPreference = createShellPreference();
