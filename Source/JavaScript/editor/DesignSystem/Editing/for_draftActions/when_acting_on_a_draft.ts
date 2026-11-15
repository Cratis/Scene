// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignSystemEditorStrings } from '../../defaultDesignSystemEditorStrings';
import type { DesignSystemConfirmation, DesignSystemHost } from '../../DesignSystemHost';
import { createFakeDesignSystemHost, type FakeDesignSystemHost, type FakeDesignSystemHostOptions } from '../../Testing/createFakeDesignSystemHost';
import { wordChange } from '../../Resolving/designEdits';
import { activateDraft, discardDraft, saveChanges, startDraft, submitDraft, type DraftActionContext } from '../draftActions';

interface Scene {
    host: FakeDesignSystemHost;
    asked: DesignSystemConfirmation[];
    reloads: number;
    context: () => Promise<DraftActionContext>;
}

const scene = (options: FakeDesignSystemHostOptions = {}, answer = true, wrap?: (host: FakeDesignSystemHost) => DesignSystemHost): Scene => {
    const host = createFakeDesignSystemHost(options);
    const made: Scene = {
        host,
        asked: [],
        reloads: 0,
        context: async () => {
            const state = await host.load();
            host.calls.length = 0;
            return {
                host: wrap === undefined ? host : wrap(host),
                strings: defaultDesignSystemEditorStrings,
                draft: state.draft,
                hasActive: state.active !== undefined,
                ask: async confirmation => { made.asked.push(confirmation); return answer; },
                reload: async () => { made.reloads++; },
            };
        },
    };
    return made;
};

const members = (host: FakeDesignSystemHost) => host.calls.map(call => call.member);

describe('when acting on a draft', () => {
    describe('and starting one', () => {
        describe('and the person says yes', () => {
            let made: Scene;
            let outcome: Awaited<ReturnType<typeof startDraft>>;

            beforeEach(async () => {
                made = scene();
                outcome = await startDraft(await made.context());
            });

            it('should ask first', () => made.asked[0].title.should.equal('Start a draft?'));
            it('should ask the host to start it', () => members(made.host).should.deep.equal(['startDraft']));
            it('should read the design system again', () => made.reloads.should.equal(1));
            it('should say it started', () => [outcome.result, outcome.message].should.deep.equal(['done', 'Started a draft']));
        });

        describe('and the person says no', () => {
            let made: Scene;
            let outcome: Awaited<ReturnType<typeof startDraft>>;

            beforeEach(async () => {
                made = scene({}, false);
                outcome = await startDraft(await made.context());
            });

            it('should not ask the host to do anything', () => members(made.host).should.deep.equal([]));
            it('should be declined', () => outcome.result.should.equal('declined'));
        });

        describe('and the host refuses', () => {
            let made: Scene;
            let outcome: Awaited<ReturnType<typeof startDraft>>;

            beforeEach(async () => {
                made = scene({ refuse: 'A draft is open elsewhere.' });
                outcome = await startDraft(await made.context());
            });

            it('should say why', () => [outcome.result, outcome.message].should.deep.equal(['refused', 'A draft is open elsewhere.']));
            it('should not read the design system again', () => made.reloads.should.equal(0));
        });

        describe('and the host fails', () => {
            let made: Scene;
            let outcome: Awaited<ReturnType<typeof startDraft>>;

            beforeEach(async () => {
                made = scene({}, true, host => ({ ...host, startDraft: () => Promise.reject(new Error('offline')) }));
                outcome = await startDraft(await made.context());
            });

            it('should refuse in words a person can read', () => [outcome.result, outcome.message].should.deep.equal(['refused', 'That did not work. Try again.']));
        });

        it('should start from the starter when there is no active version', async () => {
            const made = scene({ state: { history: [] } });
            await startDraft(await made.context());
            made.asked[0].title.should.equal('Start from the starter?');
        });
    });

    describe('and saving changes', () => {
        const changes = [wordChange('voice', 'tone', 'Warm')];

        describe('and there is no draft', () => {
            let made: Scene;
            let outcome: Awaited<ReturnType<typeof saveChanges>>;

            beforeEach(async () => {
                made = scene();
                outcome = await saveChanges(await made.context(), changes);
            });

            it('should do nothing', () => [outcome.result, members(made.host)].should.deep.equal(['nothing', []]));
        });

        describe('and there is a draft', () => {
            let made: Scene;
            let outcome: Awaited<ReturnType<typeof saveChanges>>;

            beforeEach(async () => {
                made = scene();
                await made.host.startDraft();
                outcome = await saveChanges(await made.context(), changes);
            });

            it('should send the changes against the revision that was loaded', () => made.host.calls[0].args.should.deep.equal([2, 1, changes]));
            it('should read the design system again', () => made.reloads.should.equal(1));
            it('should be done', () => outcome.result.should.equal('done'));
            it('should have changed the draft', () => made.host.state.draft!.designSystem!.words!.voice!.tone.should.equal('Warm'));
        });

        describe('and the draft moved on since it was loaded', () => {
            let made: Scene;
            let outcome: Awaited<ReturnType<typeof saveChanges>>;

            beforeEach(async () => {
                made = scene();
                await made.host.startDraft();
                const stale = await made.context();
                await made.host.changeDraft(2, 1, [wordChange('voice', 'tone', 'Elsewhere')]);
                outcome = await saveChanges(stale, changes);
            });

            it('should be refused with the host\'s reason', () => [outcome.result, outcome.message].should.deep.equal(['refused', 'The draft changed since you loaded it. Reload and try again.']));
            it('should still read the design system again', () => made.reloads.should.equal(1));
        });

        describe('and the host refuses without a reason', () => {
            it('should say the change could not be saved', async () => {
                const made = scene({}, true, host => ({ ...host, changeDraft: () => Promise.resolve('') }));
                await made.host.startDraft();
                const outcome = await saveChanges(await made.context(), changes);
                outcome.message.should.equal('The change could not be saved');
            });
        });

        it('should do nothing when there are no changes', async () => {
            const made = scene();
            await made.host.startDraft();
            (await saveChanges(await made.context(), [])).result.should.equal('nothing');
        });
    });

    describe('and discarding it', () => {
        it('should ask, then discard, and say which draft', async () => {
            const made = scene();
            await made.host.startDraft();
            const outcome = await discardDraft(await made.context());
            [made.asked[0].title, members(made.host), outcome.message, made.host.state.draft === undefined].should.deep.equal(['Discard draft v2?', ['discardDraft'], 'Discarded draft v2', true]);
        });
        it('should keep the draft when the person says no', async () => {
            const made = scene({}, false);
            await made.host.startDraft();
            const outcome = await discardDraft(await made.context());
            [outcome.result, made.host.state.draft !== undefined].should.deep.equal(['declined', true]);
        });
        it('should do nothing when there is no draft', async () => {
            const made = scene();
            (await discardDraft(await made.context())).result.should.equal('nothing');
        });
    });

    describe('and submitting it for review', () => {
        it('should ask the host and say so', async () => {
            const made = scene();
            await made.host.startDraft();
            const outcome = await submitDraft(await made.context());
            [outcome.message, made.host.calls[0].args].should.deep.equal(['Submitted draft v2 for review', [2, 1]]);
        });
        it('should do nothing when the host has no review step', async () => {
            const made = scene({ review: false });
            await made.host.startDraft();
            (await submitDraft(await made.context())).result.should.equal('nothing');
        });
    });

    describe('and activating it', () => {
        it('should be refused for the person who wrote it', async () => {
            const made = scene();
            await made.host.startDraft();
            const outcome = await activateDraft(await made.context());
            [outcome.result, made.host.state.active!.number].should.deep.equal(['refused', 1]);
        });
        it('should make it the design system for someone else', async () => {
            const made = scene();
            await made.host.startDraft();
            made.host.actAs('grace');
            const outcome = await activateDraft(await made.context());
            [made.asked[0].title, outcome.message, made.host.state.active!.number].should.deep.equal(['Make v2 the design system?', 'v2 is the design system', 2]);
        });
        it('should keep the active version when the person says no', async () => {
            const made = scene({}, false);
            await made.host.startDraft();
            made.host.actAs('grace');
            const outcome = await activateDraft(await made.context());
            [outcome.result, made.host.state.active!.number].should.deep.equal(['declined', 1]);
        });
    });
});
