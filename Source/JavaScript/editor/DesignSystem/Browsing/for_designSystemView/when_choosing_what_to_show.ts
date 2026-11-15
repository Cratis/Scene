// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignSystemEditorStrings } from '../../defaultDesignSystemEditorStrings';
import type { DesignSystemState } from '../../DesignSystemHost';
import { createFakeDesignSystemHost, sampleState } from '../../Testing/createFakeDesignSystemHost';
import { sectionEntries } from '../designSystemSections';
import { showDesignSystem } from '../designSystemView';

const entriesFor = (state: DesignSystemState) => sectionEntries(defaultDesignSystemEditorStrings, state.draft !== undefined, false);

const withDraft = async (): Promise<DesignSystemState> => {
    const host = createFakeDesignSystemHost();
    await host.startDraft();
    return host.load();
};

describe('when choosing what to show', () => {
    describe('and there is only the active version', () => {
        const state = sampleState();
        const shown = showDesignSystem(state, {}, entriesFor(state));

        it('should show the active version', () => shown.shown.should.equal('active'));
        it('should not let it be edited', () => shown.editable.should.be.false);
        it('should show the default theme in the first mode', () => [shown.theme, shown.mode].should.deep.equal(['Acme', 'light']));
        it('should know the theme is the default', () => shown.isDefaultTheme.should.be.true);
        it('should show the overview', () => shown.section.should.equal('overview'));
        it('should still show the active version when the draft is asked for', () => showDesignSystem(state, { version: 'draft' }, entriesFor(state)).shown.should.equal('active'));
    });

    describe('and a draft is open', () => {
        let state: DesignSystemState;

        beforeEach(async () => { state = await withDraft(); });

        it('should show the active version unless the draft is asked for', () => showDesignSystem(state, {}, entriesFor(state)).shown.should.equal('active'));
        it('should show the draft when it is asked for', () => showDesignSystem(state, { version: 'draft' }, entriesFor(state)).shown.should.equal('draft'));
        it('should let the draft be edited', () => showDesignSystem(state, { version: 'draft' }, entriesFor(state)).editable.should.be.true);
        it('should show the theme asked for', () => {
            const shown = showDesignSystem(state, { theme: 'Brand', mode: 'dark' }, entriesFor(state));
            [shown.theme, shown.mode, shown.isDefaultTheme].should.deep.equal(['Brand', 'dark', false]);
        });
        it('should show the section asked for', () => showDesignSystem(state, { section: 'changes' }, entriesFor(state)).section.should.equal('changes'));
    });

    describe('and there is no active version', () => {
        it('should show the draft without being asked', async () => {
            const host = createFakeDesignSystemHost({ state: { history: [] } });
            await host.startDraft();
            const state = await host.load();
            showDesignSystem(state, {}, entriesFor(state)).shown.should.equal('draft');
        });
        it('should show no version when there is no draft either', () => {
            const state: DesignSystemState = { history: [] };
            (showDesignSystem(state, {}, entriesFor(state)).version === undefined).should.be.true;
        });
    });

    describe('and the version declares no design system', () => {
        it('should show no design system', () => {
            const state = sampleState();
            state.active = { ...state.active!, designSystem: undefined };
            (showDesignSystem(state, {}, entriesFor(state)).design === undefined).should.be.true;
        });
    });
});
