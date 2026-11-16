// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef, useState } from 'react';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { PreparedSceneScreenDraft, SceneScreenDraftAgent } from './SceneScreenDraft';
import { sceneScreenDraftGenerationProblem } from './sceneScreenDraftGenerationProblem';
import { sceneScreenDraftRequest } from './sceneScreenDraftRequest';
import type { SceneScreenDraftStrings } from './SceneScreenDraftStrings';
import { defaultSceneScreenDraftStrings } from './defaultSceneScreenDraftStrings';

// Cancellation is advisory to the transport; identity is the final authority for accepting a completion.
export function createSceneScreenDraftRequestGate() {
    let active: AbortController | undefined;
    return {
        start: () => {
            if (active) return undefined;
            active = new AbortController();
            return active;
        },
        current: (request: AbortController) => active === request && !request.signal.aborted,
        finish: (request: AbortController) => { if (active === request) active = undefined; },
        invalidate: () => { active?.abort(); active = undefined; },
    };
}

interface Latest {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    agent: SceneScreenDraftAgent;
}

type DraftOutcome = { prepared: PreparedSceneScreenDraft; problem?: never } | { problem: string; prepared?: never };

const unchanged = (latest: Latest, base: PreparedSceneScreenDraft['base'], environment: ScreenEditorEnvironment, agent: SceneScreenDraftAgent) =>
    latest.controller.document === base && latest.environment === environment && latest.agent === agent;

function prepareAnswer(latest: Latest, answer: string, base: PreparedSceneScreenDraft['base'], changed: string): DraftOutcome {
    const result = latest.controller.prepareSceneScreenDraft?.(answer, latest.agent.parameterlessQueryIds);
    return result?.prepared && result.prepared.base === base ? { prepared: result.prepared } : { problem: result?.problem ?? changed };
}

const isCurrentDraft = (latest: Latest, prepared: PreparedSceneScreenDraft, origin?: { environment: ScreenEditorEnvironment; agent: SceneScreenDraftAgent }) =>
    !!latest.controller.isSceneScreenDraftCurrent?.(prepared) && latest.environment === origin?.environment && latest.agent === origin?.agent;

export function useSceneScreenDraft(controller: ScreenEditorController, environment: ScreenEditorEnvironment, agent: SceneScreenDraftAgent, text: SceneScreenDraftStrings = defaultSceneScreenDraftStrings) {
    const [instruction, setInstruction] = useState('');
    const [prepared, setPrepared] = useState<PreparedSceneScreenDraft>();
    const [problem, setProblem] = useState<string>();
    const [busy, setBusy] = useState(false);
    const gate = useRef<ReturnType<typeof createSceneScreenDraftRequestGate>>(undefined);
    gate.current ??= createSceneScreenDraftRequestGate();
    const origin = useRef<{ environment: ScreenEditorEnvironment; agent: SceneScreenDraftAgent }>(undefined);
    const latest = useRef({ controller, environment, agent });
    latest.current = { controller, environment, agent };

    function discard() {
        gate.current!.invalidate();
        origin.current = undefined;
        setPrepared(undefined);
        setProblem(undefined);
        setBusy(false);
    }

    useEffect(() => {
        discard();
        return () => { gate.current!.invalidate(); };
    }, [controller.document, environment, agent]);

    function accept(outcome: DraftOutcome) {
        if (outcome.prepared) {
            origin.current = { environment, agent };
            setPrepared(outcome.prepared);
        } else {
            setProblem(outcome.problem);
        }
    }

    async function generate() {
        const request = gate.current!.start();
        if (!request) return;
        const base = controller.document;
        setBusy(true);
        setPrepared(undefined);
        setProblem(undefined);
        try {
            const answer = await agent.generate(sceneScreenDraftRequest(instruction, base, environment.runtime), request.signal);
            if (gate.current!.current(request) && unchanged(latest.current, base, environment, agent)) accept(prepareAnswer(latest.current, answer, base, text.changed));
        } catch (error) {
            if (gate.current!.current(request)) setProblem(sceneScreenDraftGenerationProblem(error, text));
        } finally {
            if (gate.current!.current(request)) {
                gate.current!.finish(request);
                setBusy(false);
            }
        }
    }

    function currentDraft() {
        return !busy && prepared && isCurrentDraft(latest.current, prepared, origin.current) ? prepared : undefined;
    }

    function preview() {
        return currentDraft()?.document;
    }

    function apply() {
        if (!currentDraft()) {
            setProblem(text.changed);
            return false;
        }
        const result = latest.current.controller.applySceneScreenDraft?.(prepared!);
        if (result?.applied) {
            discard();
            return true;
        }
        setProblem(result?.problem ?? text.applyFailed);
        return false;
    }

    return { instruction, setInstruction: (value: string) => { discard(); setInstruction(value); }, prepared: currentDraft(), problem, busy, generate, preview, apply, discard };
}
