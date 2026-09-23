// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Behavior, InteractionActionKind, InteractionTriggerKind } from '@cratis/scene.model';
import { BehaviorAttachment, resolveApplicationTriggerBehaviors, resolveBehaviors } from '../resolveBehaviors';

const behavior = (name: string | undefined, kind: InteractionTriggerKind, order?: number): Behavior => ({
    name,
    order,
    bindings: [
        {
            trigger: { kind } as never,
            actions: [{ kind: InteractionActionKind.RefreshQuery, query: name ?? 'inline' } as never],
        },
    ],
});

describe('when resolving additive attachments', () => {
    const attachments: BehaviorAttachment[] = [
        { level: 'layout', behaviors: [behavior('LayoutWide', InteractionTriggerKind.Click)] },
        { level: 'module', behaviors: [behavior('ModuleWide', InteractionTriggerKind.Click)] },
        { level: 'element', behaviors: [behavior(undefined, InteractionTriggerKind.Click)] },
    ];

    // The point of the additive rule: a module saying 'confirm every destructive action' does not need every
    // screen beneath it to cooperate, and an element attaching its own does not silently cancel it.
    it('should run every matching attachment rather than only the most specific', () => {
        const resolved = resolveBehaviors(attachments, InteractionTriggerKind.Click);

        resolved.should.have.lengthOf(3);
    });

    it('should run the outermost attachment first', () => {
        const resolved = resolveBehaviors(attachments, InteractionTriggerKind.Click);

        resolved.map(candidate => candidate.level).should.eql(['layout', 'module', 'element']);
    });

    it('should keep an inline behavior anonymous', () => {
        const resolved = resolveBehaviors(attachments, InteractionTriggerKind.Click);

        (resolved[2].behaviorName === undefined).should.be.true;
    });

    it('should ignore bindings for a different trigger', () => {
        const resolved = resolveBehaviors(
            [{ level: 'element', behaviors: [behavior('OnSubmitOnly', InteractionTriggerKind.Submit)] }],
            InteractionTriggerKind.Click
        );

        resolved.should.be.empty;
    });

    it('should let an explicit order win over position', () => {
        const resolved = resolveBehaviors(
            [
                { level: 'layout', behaviors: [behavior('LayoutWide', InteractionTriggerKind.Click)] },
                { level: 'element', behaviors: [behavior('RunsFirst', InteractionTriggerKind.Click, 1)] },
            ],
            InteractionTriggerKind.Click
        );

        resolved.map(candidate => candidate.behaviorName).should.eql(['RunsFirst', 'LayoutWide']);
    });

    // Determinism is the reason this is a pure function over an ordered list: the same document has to produce
    // the same order on every run, or an interaction becomes intermittently wrong rather than wrong.
    it('should order deterministically across repeated resolutions', () => {
        const once = resolveBehaviors(attachments, InteractionTriggerKind.Click).map(c => c.level);
        const twice = resolveBehaviors(attachments, InteractionTriggerKind.Click).map(c => c.level);

        once.should.eql(twice);
    });

    it('should resolve a named application trigger separately from the built-in kinds', () => {
        const resolved = resolveApplicationTriggerBehaviors(
            [
                {
                    level: 'screen',
                    behaviors: [
                        {
                            name: undefined,
                            bindings: [
                                { trigger: { triggerName: 'InvoiceImported' } as never, actions: [] },
                                { trigger: { triggerName: 'SomethingElse' } as never, actions: [] },
                            ],
                        },
                    ],
                },
            ],
            'InvoiceImported'
        );

        resolved.should.have.lengthOf(1);
    });

    it('should tolerate an attachment with no behaviors at all', () => {
        resolveBehaviors([{ level: 'element', behaviors: [] }], InteractionTriggerKind.Click).should.be.empty;
    });
});
