// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Layout, UiProfile } from '@cratis/scene.model';
import type { DesignCatalogueInput, DesignSessionEvent, DesignSubject, DesignSystemProposal, Storyline } from '@cratis/scene.design';
import { screenEditorRuntimeForProfile, type ScreenEditorRuntime } from '@cratis/scene.editor';
import type { DesignCanvasHost, DesignIds, DesignTurnTransport, TemplateDraftProposal } from '../Host/DesignCanvasHost';
import { catalogueInputFromRuntime } from '../Host/catalogueInputFromRuntime';
import { countingDesignIds } from '../Host/randomDesignIds';
import { createInMemorySessionStore, type InMemoryDesignSessionStore } from './createInMemorySessionStore';
import { jsonScreenplayBridge } from './jsonScreenplayBridge';
import { defaultScriptedRules, scriptedDesignTurns, type ScriptedRule } from './scriptedDesignTurns';
import { createDesignContext, foldDesignSession } from '@cratis/scene.design';

export interface FakeDesignHostOptions {
    subject?: DesignSubject;
    /** The events the session starts with. */
    events?: readonly DesignSessionEvent[];
    runtime?: ScreenEditorRuntime;
    catalogue?: Partial<DesignCatalogueInput>;
    /** Scripted turns of the fake AI; the defaults when absent. `false` leaves the host without an AI. */
    ai?: readonly ScriptedRule[] | false;
    /** How long each step of a scripted turn takes. */
    stepMs?: number;
    storylines?: readonly Storyline[];
    ids?: DesignIds;
}

/** A fake host and what it recorded: the proposals that were sent to the design system, and the storylines that were saved. */
export interface FakeDesignHost {
    host: DesignCanvasHost;
    store: InMemoryDesignSessionStore;
    runtime: ScreenEditorRuntime;
    proposals: DesignSystemProposal[];
    templateProposals: TemplateDraftProposal[];
    profile: { current: UiProfile };
    storylines: Storyline[];
}

/**
 * A host with nothing behind it: an in-memory session, a bridge that stores screens as JSON, a fake AI that performs scripted turns through the real
 * design engine, and recorders for what the host would receive. It is what the stories mount and what the specifications start from.
 */
export function createFakeDesignHost(options: FakeDesignHostOptions = {}): FakeDesignHost {
    const runtime = options.runtime ?? screenEditorRuntimeForProfile(undefined);
    const store = createInMemorySessionStore(options.events);
    const subject = options.subject ?? { kind: 'story', id: 'story-1' };
    const ids = options.ids ?? countingDesignIds();
    const templates = runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? []);
    const layouts: Layout[] = runtime.bundles.flatMap(bundle => bundle.layouts ?? []);
    const bridge = jsonScreenplayBridge(layouts, templates);
    const proposals: DesignSystemProposal[] = [];
    const templateProposals: TemplateDraftProposal[] = [];
    const storylines: Storyline[] = [...(options.storylines ?? [])];
    const profile = { current: runtime.profile };

    const input = (): DesignCatalogueInput => catalogueInputFromRuntime(runtime, { profile: profile.current, ...options.catalogue });
    // The AI's catalogue honours the session's template set, as a server's would from the request.
    const limited = (): DesignCatalogueInput => {
        const templateSet = foldDesignSession(store.getEvents())?.templateSet;
        return templateSet === undefined ? input() : { ...input(), templateSet };
    };
    const ai: DesignTurnTransport | undefined = options.ai === false ? undefined : scriptedDesignTurns({
        store, bridge, context: () => createDesignContext(limited()), profile: () => profile.current,
        rules: options.ai ?? defaultScriptedRules(), ids, ...(options.stepMs === undefined ? {} : { stepMs: options.stepMs }),
    });

    const catalogue: DesignCanvasHost['catalogue'] = {
        runtime, input,
        profile: { get current() { return profile.current; }, change: async next => { profile.current = next; } },
    };

    const host: DesignCanvasHost = {
        session: store, subject, screenplay: bridge, catalogue, ids, user: { id: 'ada', name: 'Ada' },
        designSystem: {
            propose: async proposal => { proposals.push(proposal); },
            proposeTemplate: async proposal => { templateProposals.push(proposal); },
        },
        storylines: {
            storylines: () => storylines,
            save: async next => { storylines.splice(0, storylines.length, ...next); },
        },
        ...(ai === undefined ? {} : { ai }),
    };
    return { host, store, runtime, proposals, templateProposals, profile, storylines };
}
