// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createDesignContext, currentRevisionOf } from '@cratis/scene.design';
import { aStartedDesign, sessionOf } from '../../given/aStartedDesign';
import { createFakeDesignHost } from '../../Testing/createFakeDesignHost';

const names = createDesignContext(createFakeDesignHost().host.catalogue.input()).catalogue.templates.map(template => template.name);
const allowed = [names[names.length - 1]!];

describe('when the session is limited to some templates', () => {
    const fake = aStartedDesign({ templateSet: allowed });

    beforeAll(async () => {
        await fake.host.ai!.runTurn(
            { turnId: 't1', sessionId: 'session-1', subject: fake.host.subject, mode: 'screens', prompt: 'Add a screen called Limited', author: 'ada', templateSet: allowed },
            () => undefined, new AbortController().signal);
    });

    it('should build the screen only on an allowed template', () => JSON.parse(currentRevisionOf(sessionOf(fake), 'Limited')!.text).screen.screenTemplate.should.equal(allowed[0]));

    describe('and other layouts are asked for', () => {
        it('should offer none on a template outside the set', async () => {
            const answer = await fake.host.ai!.runTurn(
                { turnId: 't2', sessionId: 'session-1', subject: fake.host.subject, mode: 'screens', prompt: 'Make other layouts', author: 'ada', focus: { screen: 'Limited' }, templateSet: allowed },
                () => undefined, new AbortController().signal);
            // With one template allowed there is nothing else to lay the screen out on.
            answer.refusals.should.be.empty;
            (sessionOf(fake).variationGroups[0]?.candidates ?? []).every(candidate => JSON.parse(candidate.text).screen.screenTemplate === allowed[0]).should.equal(true);
        });
    });
});
