// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button, TextArea } from '@cratis/components/Common';
import { Dialog, DialogInitialFocus } from '@cratis/components/Dialogs';
import { SceneEditKind, type SceneDocument, type SceneEdit } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { PreparedSceneScreenDraft, SceneScreenDraftAgent } from './SceneScreenDraft';
import { sceneScreenDraftReviewVisible } from './sceneScreenDraftReviewVisibility';
import type { SceneScreenDraftStrings } from './SceneScreenDraftStrings';
import { useSceneScreenDraft } from './useSceneScreenDraft';
import { defaultSceneScreenDraftStrings } from './defaultSceneScreenDraftStrings';

export interface SceneScreenDraftReviewProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    agent: SceneScreenDraftAgent;
    onPreview?: (document: SceneDocument, fitsDialog: boolean) => void;
    strings?: SceneScreenDraftStrings;
    previewing?: boolean;
}

const describeEdit = (edit: SceneEdit, text: SceneScreenDraftStrings) => {
    if (edit.kind === SceneEditKind.InsertNode) return text.addControl(edit.target);
    return edit.kind === SceneEditKind.SetProperty ? text.setProperty(edit.path, edit.nodeId) : edit.kind;
};

const DraftAdditions = ({ prepared, text }: { prepared: PreparedSceneScreenDraft; text: SceneScreenDraftStrings }) => (
    <section aria-label={text.review}>
        <h3>{text.additions}</h3>
        <p>{prepared.reply}</p>
        <ol>{prepared.edits.map((edit, index) => <li key={index}>{describeEdit(edit, text)}</li>)}</ol>
    </section>
);

const DraftNotices = ({ busy, problem, text }: { busy: boolean; problem?: string; text: SceneScreenDraftStrings }) => <>
    {busy && <p role='status'>{text.status}</p>}
    {problem && <p role='alert'>{problem}</p>}
</>;

interface DraftButtonsProps {
    text: SceneScreenDraftStrings;
    unavailable: boolean;
    onDiscard: () => void;
    onApply: () => void;
    onPreview?: () => void;
}

const DraftButtons = ({ text, unavailable, onDiscard, onApply, onPreview }: DraftButtonsProps) => <>
    <Button label={text.discard} onClick={onDiscard} />
    {onPreview && <Button label={text.preview} disabled={unavailable} onClick={onPreview} />}
    <Button label={text.apply} disabled={unavailable} onClick={onApply} />
</>;

const previewDraft = (draft: { preview: () => SceneDocument | undefined }, onPreview: (document: SceneDocument, fitsDialog: boolean) => void) => {
    const document = draft.preview();
    // A draft is seen where it will be: in its page.
    if (document) onPreview(document, false);
};

const currentPrepared = (prepared: PreparedSceneScreenDraft | undefined, document: SceneDocument, runtime: unknown) =>
    prepared?.base === document && prepared.runtime === runtime ? prepared : undefined;

const canGenerate = (draft: { busy: boolean; instruction: string }) => !draft.busy && !!draft.instruction.trim();

// Generation and preview remain ephemeral. Only Apply uses the editor's existing edit session.
export function SceneScreenDraftReview({ controller, environment, agent, onPreview, strings: text = defaultSceneScreenDraftStrings, previewing = false }: SceneScreenDraftReviewProps) {
    const [visible, setVisible] = useState(false);
    const draft = useSceneScreenDraft(controller, environment, agent, text);
    const close = () => { draft.discard(); setVisible(false); };
    const prepared = currentPrepared(draft.prepared, controller.document, environment.runtime);
    return <>
        <Button label={text.open} onClick={() => setVisible(true)} />
        <Dialog title={text.title} visible={sceneScreenDraftReviewVisible(visible, previewing)} dismissable initialFocus={DialogInitialFocus.Content} onClose={close}
            width='min(42rem, 100vw)' closeAriaLabel={text.discardAriaLabel}
            buttons={<DraftButtons text={text} unavailable={!prepared || draft.busy} onDiscard={close} onPreview={onPreview && (() => previewDraft(draft, onPreview))} onApply={() => { if (draft.apply()) setVisible(false); }} />}>
            <p>{text.explanation}</p>
            <label htmlFor='scene-screen-draft-instruction'>{text.instruction}</label>
            <TextArea id='scene-screen-draft-instruction' rows={5} maxLength={4000} value={draft.instruction} onChange={value => draft.setInstruction(value)} />
            <Button label={draft.busy ? text.generating : text.generate} disabled={!canGenerate(draft)} onClick={() => { void draft.generate(); }} />
            <DraftNotices busy={draft.busy} problem={draft.problem} text={text} />
            {prepared && <DraftAdditions prepared={prepared} text={text} />}
        </Dialog>
    </>;
}
