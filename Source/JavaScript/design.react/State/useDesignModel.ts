// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { SceneDocument } from '@cratis/scene.model';
import {
    type DesignContext, type DesignMode, type DesignOperation, type DesignSession, type DesignSystemProposal, type DesignWorkspace, type ScreenSet, type Storyline,
    createDesignContext, currentRevisionOf, foldDesignSession,
} from '@cratis/scene.design';
import type { DesignCanvasHost, DesignIds, DesignSessionStore, ScreenText } from '../Host/DesignCanvasHost';
import { randomDesignIds } from '../Host/randomDesignIds';
import { type PinAnchor, commentEvents } from './commentPins';
import { type RecordedDesignOperations, recordDesignOperations, recordDocumentEdit } from './recordDesignOperations';
import { revertEvents, revertTurnEvents } from './revisionHistory';
import { reorderEvents, screenSetOf } from './storylines';
import { dismissTweakEvent, tweakOperations } from './tweakControls';
import { templateDraftProposal } from './templateDrafts';
import { templateSetEvent } from './templateSet';
import type { TweakRecord } from '@cratis/scene.design';

/** The session a store holds, folded from its events. */
export function useDesignSession(store: DesignSessionStore): DesignSession | undefined {
    const events = useSyncExternalStore(store.subscribe, store.getEvents);
    return useMemo(() => foldDesignSession(events), [events]);
}

/** What a recorded change says about itself. */
export interface RecordMeta {
    prompt?: string;
    /** The screen a change that names none belongs to. */
    focus?: string;
    turnId?: string;
}

/** What the canvas does to a design. Every one of them becomes events of the session; none of them reaches for anything but the host. */
export interface DesignActions {
    record(operations: readonly DesignOperation[], meta?: RecordMeta): Promise<RecordedDesignOperations>;
    addScreen(name: string, template: string): Promise<RecordedDesignOperations>;
    removeScreen(name: string): Promise<void>;
    moveScreen(name: string, index: number): Promise<void>;
    revert(screen: string, revisionId: string): Promise<void>;
    revertTurn(turnId: string): Promise<void>;
    chooseVariation(groupId: string, candidateId: string): Promise<void>;
    applyTweak(tweak: TweakRecord, value: string): Promise<RecordedDesignOperations>;
    dismissTweak(tweakId: string): Promise<void>;
    addComment(screen: string, anchor: PinAnchor, text: string): Promise<void>;
    resolveComment(commentId: string): Promise<void>;
    reopenComment(commentId: string): Promise<void>;
    setTemplateSet(templates: string[] | undefined): Promise<void>;
    saveEdit(after: SceneDocument): Promise<void>;
    proposeToSystem(proposal: DesignSystemProposal): Promise<void>;
    proposeTemplate(template: string): Promise<void>;
    saveStorylines(storylines: readonly Storyline[]): Promise<void>;
}

/** The design the canvas is showing, and what can be done to it. */
export interface DesignModel {
    /** Undefined until the session has started. */
    session: DesignSession | undefined;
    context: DesignContext;
    /** The session read into a Scene document; undefined while the bridge is still reading it. */
    workspace: DesignWorkspace | undefined;
    workspaceError: string | undefined;
    screenSet: ScreenSet;
    actions: DesignActions;
}

export interface DesignModelOptions {
    /** What a session that has not started starts as. */
    mode?: DesignMode;
    /** The templates a session that has not started is limited to. */
    templateSet?: string[];
}

const textsOf = (session: DesignSession | undefined): ScreenText[] =>
    session === undefined ? [] : session.screens.flatMap(entry => {
        const revision = currentRevisionOf(session, entry.screen);
        return revision === undefined ? [] : [{ screen: entry.screen, text: revision.text }];
    });

/** The design of a host: its session folded from events, read into a workspace through the bridge, and the actions that change it. */
export function useDesignModel(host: DesignCanvasHost, options: DesignModelOptions = {}): DesignModel {
    const ids: DesignIds = host.ids ?? randomDesignIds;
    const session = useDesignSession(host.session);
    const [authored, setAuthored] = useState<readonly Storyline[]>(() => host.storylines?.storylines() ?? []);
    const [workspace, setWorkspace] = useState<DesignWorkspace | undefined>();
    const [workspaceError, setWorkspaceError] = useState<string | undefined>();

    // The first view of a subject that has no design starts one; the host's store answers with the event.
    const starting = useRef(false);
    useEffect(() => {
        if (session !== undefined || starting.current) return;
        starting.current = true;
        void host.session.append([{
            type: 'DesignSessionStarted', sessionId: ids.next('session'), subject: host.subject, mode: options.mode ?? 'screens', startedBy: host.user.id,
            ...(options.templateSet === undefined ? {} : { templateSet: options.templateSet }),
        }]);
    }, [session, host, ids, options.mode, options.templateSet]);

    const input = host.catalogue.input();
    const templateSet = session?.templateSet;
    const context = useMemo(
        () => createDesignContext({ ...input, ...(templateSet === undefined ? {} : { templateSet }) }),
        // The catalogue input is read afresh each render; what makes a different context is a different catalogue source or template set.
        [host.catalogue, templateSet?.join('\u0000')],
    );

    const screenSet = useMemo(() => screenSetOf(session, authored), [session, authored]);

    const profile = host.catalogue.profile?.current;
    const texts = useMemo(() => textsOf(session), [session]);
    const key = `${session?.mode ?? ''}|${texts.map(text => `${text.screen}\u0001${text.text}`).join('\u0002')}`;
    useEffect(() => {
        if (session === undefined) return;
        let stale = false;
        host.screenplay.toDocument(texts, session.mode).then(
            document => {
                if (stale) return;
                setWorkspaceError(undefined);
                setWorkspace({ document, screenSet, ...(profile === undefined ? {} : { profile }) });
            },
            (error: unknown) => { if (!stale) setWorkspaceError(error instanceof Error ? error.message : String(error)); },
        );
        return () => { stale = true; };
        // `texts` is what `key` summarizes: the effect runs again when the screens' current revisions change, not on every render.
    }, [key, profile, screenSet, host.screenplay]);

    const latest = useRef({ session, workspace, context });
    latest.current = { session, workspace, context };

    const actions = useMemo<DesignActions>(() => {
        const ready = (): { session: DesignSession; workspace: DesignWorkspace; context: DesignContext } => {
            const { session: current, workspace: read, context: ground } = latest.current;
            if (current === undefined || read === undefined) throw new Error('The design is not ready yet.');
            return { session: current, workspace: read, context: ground };
        };
        const requireSession = (): DesignSession => {
            const current = latest.current.session;
            if (current === undefined) throw new Error('The design has not started yet.');
            return current;
        };
        const append = (events: Parameters<DesignSessionStore['append']>[0]) => events.length === 0 ? Promise.resolve() : host.session.append(events);

        const record: DesignActions['record'] = async (operations, meta = {}) => {
            const state = ready();
            const recorded = await recordDesignOperations({
                ...state, operations, author: host.user.id, turnId: meta.turnId ?? ids.next('turn'), ids, bridge: host.screenplay,
                ...(meta.prompt === undefined ? {} : { prompt: meta.prompt }), ...(meta.focus === undefined ? {} : { focus: meta.focus }),
            });
            await append(recorded.events);
            if (recorded.profile !== undefined) await host.catalogue.profile?.change(recorded.profile);
            return recorded;
        };

        return {
            record,
            addScreen: (name, template) => record([{ op: 'addScreen', name, template }], { focus: name }),
            removeScreen: async name => { await record([{ op: 'removeScreen', name }]); },
            moveScreen: async (name, index) => append(reorderEvents(requireSession(), name, index)),
            revert: async (screen, revisionId) => append(revertEvents(requireSession(), screen, revisionId, host.user.id, ids)),
            revertTurn: async turnId => append(revertTurnEvents(requireSession(), turnId, host.user.id, ids, ids.next('turn'))),
            chooseVariation: async (groupId, candidateId) => append([{
                type: 'VariationChosen', groupId, candidateId, revisionId: ids.next('revision'), author: host.user.id, turnId: ids.next('turn'),
            }]),
            applyTweak: (tweak, value) => {
                const { operations, proposals } = tweakOperations(tweak, value);
                return record(operations, { ...(tweak.screen === undefined ? {} : { focus: tweak.screen }) })
                    .then(recorded => ({ ...recorded, proposals: [...recorded.proposals, ...proposals] }));
            },
            dismissTweak: async tweakId => append([dismissTweakEvent(tweakId)]),
            addComment: async (screen, anchor, text) => append(commentEvents(screen, anchor, text, host.user.id, ids)),
            resolveComment: async commentId => append([{ type: 'CommentResolved', commentId }]),
            reopenComment: async commentId => append([{ type: 'CommentReopened', commentId }]),
            setTemplateSet: async templates => append([templateSetEvent(templates)]),
            saveEdit: async after => {
                const state = ready();
                await append(await recordDocumentEdit({ session: state.session, before: state.workspace.document, after, author: host.user.id, turnId: ids.next('turn'), ids, bridge: host.screenplay }));
            },
            proposeToSystem: async proposal => { await host.designSystem?.propose(proposal); },
            proposeTemplate: async template => {
                const proposal = templateDraftProposal(requireSession(), template);
                if (proposal !== undefined) await host.designSystem?.proposeTemplate?.(proposal);
            },
            saveStorylines: async storylines => {
                await host.storylines?.save(storylines);
                setAuthored(storylines);
            },
        };
    }, [host, ids]);

    return { session, context, workspace, workspaceError, screenSet, actions };
}

/** The screen the canvas has focused: the one the host last chose, or the first of the session. */
export const focusedScreenOf = (session: DesignSession | undefined, chosen: string | undefined): string | undefined =>
    session === undefined ? undefined : (chosen !== undefined && session.screens.some(entry => entry.screen === chosen) ? chosen : session.screens[0]?.screen);
