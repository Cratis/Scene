// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createDesignContext, createScreenSet, type DesignWorkspace } from '@cratis/scene.design';
import { aSession } from '../../given/aSession';
import { createFakeDesignHost } from '../../Testing/createFakeDesignHost';
import { accentForHue, activeTweaks, dismissTweakEvent, hueForAccent, hueOf, tweakOperations } from '../tweakControls';

const fake = createFakeDesignHost();
const context = createDesignContext(fake.host.catalogue.input());
const workspace: DesignWorkspace = { document: { layouts: [], screenTemplates: [], dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] }, screenSet: createScreenSet(), profile: fake.runtime.profile };

const cornersControl = { id: 'tw-1', label: 'Corners', kind: 'choice' as const, address: { kind: 'profile' as const, key: 'corners' as const } };

describe('when asking what tweaks are on offer', () => {
    const session = aSession([
        { type: 'TweaksProposed', tweaks: [cornersControl, { id: 'tw-2', label: 'Bad', kind: 'choice', address: { kind: 'profile', key: 'font' } }] },
        { type: 'TweaksProposed', screen: 'Other', tweaks: [{ ...cornersControl, id: 'tw-3' }] },
        { type: 'TweakDismissed', tweakId: 'tw-1' },
    ]);

    it('should leave out a tweak that was dismissed', () => activeTweaks(session, 'Home', workspace, context).some(tweak => tweak.record.id === 'tw-1').should.equal(false));
    it('should leave out a tweak that is for another screen', () => activeTweaks(session, 'Home', workspace, context).some(tweak => tweak.record.id === 'tw-3').should.equal(false));
    it('should keep a tweak that is for another screen on that screen', () => activeTweaks(session, 'Other', workspace, context).map(tweak => tweak.record.id).should.include('tw-3'));

    describe('and the design has everything a tweak needs', () => {
        const live = aSession([{ type: 'TweaksProposed', tweaks: [cornersControl] }]);
        const tweaks = activeTweaks(live, 'Home', workspace, context);

        it('should offer the choices the design system has', () => tweaks[0]!.resolved.options.should.deep.equal(['Sharp', 'Default', 'Round']));
        it('should show the value in use', () => tweaks[0]!.resolved.value.should.be.a('string'));
    });
});

describe('when moving a tweak', () => {
    it('should become a profile change for a profile key', () => tweakOperations({ ...cornersControl, dismissed: false }, 'Round').operations.should.deep.equal([{ op: 'profile', key: 'corners', value: 'Round' }]));
    it('should become an edit of the property for an element', () => {
        const { operations } = tweakOperations({ id: 'tw', label: 'Variant', kind: 'choice', dismissed: false, address: { kind: 'property', screen: 'Home', element: 'save', prop: 'variant' } }, 'primary');
        operations.should.deep.equal([{ op: 'set', screen: 'Home', element: 'save', prop: 'variant', value: 'primary' }]);
    });
    it('should become a proposal for a token, which is the design system\'s', () => {
        const { operations, proposals } = tweakOperations({ id: 'tw', label: 'Brand', kind: 'choice', dismissed: false, address: { kind: 'token', token: 'color.brand' } }, '#112233');
        operations.should.be.empty;
        proposals[0]!.should.include({ kind: 'token', address: 'color.brand', value: '#112233' });
    });
    it('should be dismissed with one event', () => dismissTweakEvent('tw-1').should.deep.equal({ type: 'TweakDismissed', tweakId: 'tw-1' }));
});

describe('when moving a hue slider', () => {
    const accents = ['#e11d48', '#16a34a', '#2563eb'];

    it('should read the hue of a hex colour', () => hueOf('#ff0000')!.should.equal(0));
    it('should read the hue of a short hex colour', () => hueOf('#00f')!.should.equal(240));
    it('should have no hue for a grey', () => (hueOf('#888888') === undefined).should.equal(true));
    it('should have no hue for a name', () => (hueOf('brand') === undefined).should.equal(true));

    it('should pick the accent nearest the hue', () => accentForHue(130, accents)!.should.equal('#16a34a'));
    it('should wrap round the wheel', () => accentForHue(355, accents)!.should.equal('#e11d48'));
    it('should spread named accents round the wheel in order', () => accentForHue(250, ['brand', 'ocean', 'forest'])!.should.equal('forest'));
    it('should have no accent when the design has none', () => (accentForHue(10, []) === undefined).should.equal(true));

    it('should place the slider where the accent in use is', () => hueForAccent('#16a34a', accents).should.equal(142));
    it('should place the slider at a named accent\'s part of the wheel', () => hueForAccent('ocean', ['brand', 'ocean', 'forest']).should.equal(180));
});
