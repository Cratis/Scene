// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { UiProfile } from '@cratis/scene.model';
import {
    type DesignContext, type DesignOperation, type DesignSession, type DesignWorkspace, acceptsComponent, colourTokenValues, foldDesignSession, profileKeyValues, tokenProposal,
} from '@cratis/scene.design';
import type { DesignIds, DesignSessionStore, DesignTurnProgress, DesignTurnRefusal, DesignTurnRequest, DesignTurnResult, DesignTurnTransport, ScreenplayBridge } from '../Host/DesignCanvasHost';
import { randomDesignIds } from '../Host/randomDesignIds';
import { type RecordedDesignOperations, recordDesignOperations } from '../State/recordDesignOperations';
import { screenSetOf } from '../State/storylines';

/** What a scripted turn can do: say what it is doing, apply design operations the way the server's tool loop does, and look at the design. */
export interface ScriptedTurnContext {
    request: DesignTurnRequest;
    context: DesignContext;
    progress(message: string): void;
    session(): DesignSession;
    /** Applies the operations through the design engine and records the turn's revisions on the session. */
    apply(operations: readonly DesignOperation[]): Promise<RecordedDesignOperations>;
}

export type ScriptedAnswer = Partial<Omit<DesignTurnResult, 'reply'>> & { reply: string };
export type ScriptedTurn = (turn: ScriptedTurnContext) => Promise<ScriptedAnswer>;

/** A turn the fake AI performs when the prompt matches. */
export interface ScriptedRule {
    match: RegExp;
    turn: ScriptedTurn;
}

export interface ScriptedDesignTurnsOptions {
    store: DesignSessionStore;
    bridge: ScreenplayBridge;
    context(): DesignContext;
    profile?(): UiProfile | undefined;
    rules?: readonly ScriptedRule[];
    ids?: DesignIds;
    /** How long each step takes, so a story can show a turn in flight. */
    stepMs?: number;
    /** Who the revisions are recorded as. */
    author?: string;
}

const pause = (ms: number, signal: AbortSignal): Promise<void> => new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
});

/** A fake AI transport: it performs scripted turns on the in-memory session, through the real design engine, so a story shows what a server would. */
export function scriptedDesignTurns(options: ScriptedDesignTurnsOptions): DesignTurnTransport {
    const ids = options.ids ?? randomDesignIds;
    const rules = options.rules ?? defaultScriptedRules();
    const author = options.author ?? 'design-ai';
    const step = options.stepMs ?? 0;

    return {
        async runTurn(request, onProgress, signal) {
            const touched = new Set<string>();
            const refusals: DesignTurnRefusal[] = [];
            const proposals: DesignTurnResult['proposals'] = [];
            const session = (): DesignSession => {
                const folded = foldDesignSession(options.store.getEvents());
                if (folded === undefined) throw new Error('The design has not started.');
                return folded;
            };
            const emit = (progress: DesignTurnProgress) => { if (!signal.aborted) onProgress(progress); };

            const turn: ScriptedTurnContext = {
                request,
                context: options.context(),
                progress: message => emit({ kind: 'status', message }),
                session,
                apply: async operations => {
                    await pause(step, signal);
                    const current = session();
                    const texts = current.screens.flatMap(entry => {
                        const revision = current.revisions.find(candidate => candidate.id === entry.currentRevision);
                        return revision === undefined ? [] : [{ screen: entry.screen, text: revision.text }];
                    });
                    const profile = options.profile?.();
                    const workspace: DesignWorkspace = { document: await options.bridge.toDocument(texts, current.mode), screenSet: screenSetOf(current), ...(profile === undefined ? {} : { profile }) };
                    const recorded = await recordDesignOperations({
                        session: current, workspace, context: options.context(), operations, author, turnId: request.turnId, ids, bridge: options.bridge, prompt: request.prompt,
                        ...(request.focus?.screen === undefined ? {} : { focus: request.focus.screen }),
                    });
                    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
                    await options.store.append(recorded.events);
                    for (const event of recorded.events) if (event.type === 'ScreenRevisionRecorded') { touched.add(event.screen); emit({ kind: 'screen', screen: event.screen }); }
                    refusals.push(...recorded.refusals);
                    proposals.push(...recorded.proposals);
                    return recorded;
                },
            };

            const rule = rules.find(candidate => candidate.match.test(request.prompt));
            emit({ kind: 'status', message: 'Reading the design' });
            await pause(step, signal);
            const answer = rule === undefined
                ? { reply: 'I can add screens, offer other layouts, offer tweaks and change a screen. Tell me which.' }
                : await rule.turn(turn);
            return { refusals: [...refusals, ...(answer.refusals ?? [])], proposals: [...proposals, ...(answer.proposals ?? [])], touched: [...new Set([...touched, ...(answer.touched ?? [])])], reply: answer.reply };
        },
    };
}

const nameFrom = (prompt: string, existing: readonly string[]): string => {
    const named = /(?:called|named)\s+["']?([A-Za-z][\w ]*?)["']?(?:\s+(?:on|with|using|for)\b|[.!?]|$)/i.exec(prompt)?.[1]?.trim().replace(/\s+/g, '');
    if (named !== undefined && named !== '' && !existing.includes(named)) return named;
    let index = existing.length + 1;
    while (existing.includes(`Screen${index}`)) index += 1;
    return `Screen${index}`;
};

/** The turns a story can show: adding a screen, layouts, tweaks, and a refusal with alternatives. A prompt with "fail" fails. */
export function defaultScriptedRules(): ScriptedRule[] {
    return [
        {
            match: /\bfail\b/i,
            turn: async () => { throw new Error('The design service did not answer.'); },
        },
        {
            match: /(red|pink|neon|gradient|shadow|font size)/i,
            turn: async turn => {
                turn.progress('Checking the request against the design system');
                const recorded = await turn.apply([{
                    op: 'refuse', code: 'freeStylingNotAllowed',
                    reason: 'The design system has no red that suits this: free colors are not allowed on a screen.',
                    alternatives: [
                        { label: 'Use sharp corners instead', operations: [{ op: 'profile', key: 'corners', value: profileKeyValues(turn.context.catalogue, 'corners')?.[0] ?? '' }] },
                        { label: 'Propose a red token to the design system', proposal: tokenProposal('#e11d48') },
                    ],
                }]);
                return { reply: recorded.refusals.length > 0 ? 'I could not do that as asked.' : 'Done.' };
            },
        },
        {
            match: /(variation|layouts?|alternative)/i,
            turn: async turn => {
                const screen = turn.request.focus?.screen ?? turn.session().screens[0]?.screen;
                if (screen === undefined) return { reply: 'There is no screen to offer layouts of yet.' };
                turn.progress(`Laying ${screen} out on other templates`);
                await turn.apply([{ op: 'variations', screen }]);
                return { reply: `Here are other layouts of ${screen}. Choose the one you like.` };
            },
        },
        {
            match: /tweak/i,
            turn: async turn => {
                const catalogue = turn.context.catalogue;
                const controls: Extract<DesignOperation, { op: 'tweaks' }>['controls'] = [];
                if (colourTokenValues(catalogue).length > 1) controls.push({ label: 'Accent', kind: 'hue', address: { kind: 'profile', key: 'accent' } });
                if ((profileKeyValues(catalogue, 'corners') ?? []).length > 1) controls.push({ label: 'Corners', kind: 'choice', address: { kind: 'profile', key: 'corners' } });
                turn.progress('Choosing what is worth tweaking');
                await turn.apply([{ op: 'tweaks', controls }]);
                return { reply: controls.length === 0 ? 'The design system leaves nothing to tweak.' : 'Try the controls in the Tweaks tab.' };
            },
        },
        {
            match: /\b(add|create|new|design)\b.*\bscreen\b/i,
            turn: async turn => {
                const session = turn.session();
                const name = nameFrom(turn.request.prompt, session.screens.map(entry => entry.screen));
                const templates = turn.context.catalogue.templates;
                const template = templates.find(candidate => candidate.type === 'List') ?? templates[0];
                if (template === undefined) return { reply: 'The design system has no template to build a screen on.' };
                turn.progress(`Creating ${name} on ${template.displayName ?? template.name}`);
                const operations: DesignOperation[] = [{ op: 'addScreen', name, template: template.name }];
                const outlet = template.outlets.find(candidate => turn.context.catalogue.components.some(component => acceptsComponent(candidate, component)));
                const component = outlet === undefined ? undefined : turn.context.catalogue.components.find(candidate => acceptsComponent(outlet, candidate));
                if (outlet !== undefined && component !== undefined) operations.push({ op: 'insert', screen: name, outlet: outlet.name, component: component.name });
                await turn.apply(operations);
                return { reply: `I added ${name}.` };
            },
        },
    ];
}
