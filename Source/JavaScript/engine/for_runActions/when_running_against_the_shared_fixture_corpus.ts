// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { InteractionAction, InteractionActionKind, InteractionTriggerKind, NotificationLevel } from '@cratis/scene.model';
import { BehaviorAttachment, resolveBehaviors } from '../resolveBehaviors';
import { InteractionStop, runActions } from '../runActions';
import { pathEchoingContext, RecordingDispatcher } from './given/a_recording_dispatcher';

interface FixtureBehavior {
    name: string | null;
    trigger: keyof typeof InteractionTriggerKind;
    order?: number;
}

interface FixtureAttachment {
    level: string;
    depth?: number;
    behaviors: FixtureBehavior[];
}

interface ResolutionCase {
    name: string;
    trigger: keyof typeof InteractionTriggerKind;
    attachments: FixtureAttachment[];
    expected: (string | null)[];
}

interface FixtureAction {
    kind: string;
    command?: string;
    query?: string;
    screen?: string;
    dialogTemplate?: string;
    level?: keyof typeof NotificationLevel;
    text?: string;
    onSuccess?: FixtureAction[];
    onFailure?: FixtureAction[];
    onResult?: FixtureAction[];
}

interface SequencingCase {
    name: string;
    actions: FixtureAction[];
    commandSucceeds: boolean;
    confirmAnswer: boolean;
    expectedCalls: string[];
    expectedStop: keyof typeof InteractionStop;
    expectedFindings?: string[];
}

interface FixtureCorpus {
    resolutionCases: ResolutionCase[];
    sequencingCases: SequencingCase[];
}

const manifestPath = join(import.meta.dirname, '..', '..', '..', '..', 'interaction-fixtures.json');
const corpus = JSON.parse(readFileSync(manifestPath, 'utf-8')) as FixtureCorpus;

function attachment(fixture: FixtureAttachment): BehaviorAttachment {
    return {
        level: fixture.level,
        depth: fixture.depth,
        behaviors: fixture.behaviors.map(behavior => ({
            name: behavior.name ?? undefined,
            order: behavior.order,
            bindings: [
                {
                    trigger: { kind: InteractionTriggerKind[behavior.trigger] } as never,
                    actions: [],
                },
            ],
        })),
    };
}

function action(fixture: FixtureAction): InteractionAction {
    return {
        kind: InteractionActionKind[fixture.kind as keyof typeof InteractionActionKind] ?? fixture.kind,
        command: fixture.command,
        query: fixture.query,
        screen: fixture.screen,
        dialogTemplate: fixture.dialogTemplate,
        level: fixture.level === undefined ? undefined : NotificationLevel[fixture.level],
        message: fixture.text === undefined ? undefined : { text: fixture.text },
        onSuccess: (fixture.onSuccess ?? []).map(action),
        onFailure: (fixture.onFailure ?? []).map(action),
        onResult: (fixture.onResult ?? []).map(action),
    } as InteractionAction;
}

// The dispatcher records the command name without its arguments, because the corpus pins the sequencing rule
// and not how a binding resolves - that is asserted by the unit specs next to this file.
function callsWithoutArguments(calls: string[]): string[] {
    return calls.map(call => call.replace(/:\{.*\}$/, ''));
}

describe('when running against the shared fixture corpus', () => {
    for (const fixture of corpus.resolutionCases) {
        it(`should resolve the case where ${fixture.name}`, () => {
            const resolved = resolveBehaviors(
                fixture.attachments.map(attachment),
                InteractionTriggerKind[fixture.trigger]
            );

            resolved.map(candidate => candidate.behaviorName ?? null).should.eql(fixture.expected);
        });
    }

    for (const fixture of corpus.sequencingCases) {
        it(`should sequence the case where ${fixture.name}`, async () => {
            const dispatcher = new RecordingDispatcher();
            dispatcher.commandSucceeds = fixture.commandSucceeds;
            dispatcher.confirmAnswer = fixture.confirmAnswer;

            const run = await runActions(fixture.actions.map(action), dispatcher, pathEchoingContext);

            callsWithoutArguments(dispatcher.calls).should.eql(fixture.expectedCalls);
            run.stop.should.equal(InteractionStop[fixture.expectedStop]);
            run.findings.map(finding => finding.kind).should.eql(fixture.expectedFindings ?? []);
        });
    }
});
