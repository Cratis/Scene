// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultDesignSystemEditorStrings } from '../defaultDesignSystemEditorStrings';
import { drawEditor } from './given/draw';
import { OffStandard } from '../Standard/OffStandard';
import { offStandardEntries, type OffStandardScreen } from '../Standard/offStandardEntries';
import type { OffStandardState } from '../Standard/useOffStandard';

const screens: OffStandardScreen[] = [
    { id: 'a', title: 'Orders', values: [{ kind: 'color', value: '#123456', suggestion: '--color-primary', count: 2 }, { kind: 'component', value: 'Chip', suggestion: '', count: 1 }] },
];

const none = async () => undefined;

const state = (overrides: Partial<OffStandardState> = {}): OffStandardState => ({
    entries: offStandardEntries(screens),
    isReady: true,
    canRaiseIssue: true,
    canUseToken: true,
    canPropose: true,
    raiseIssue: none,
    useToken: none,
    propose: none,
    ...overrides,
});

const draw = (standard: OffStandardState, hasStandard = true) =>
    renderToStaticMarkup(createElement(OffStandard, { standard, hasStandard, strings: defaultDesignSystemEditorStrings }));

describe('when the host finds what is off the standard', () => {
    describe('and the section is drawn', () => {
        const markup = draw(state());

        it('should list each value with how often and where it is used', () => markup.should.contain('2 times in Orders'));
        it('should say what the system has instead', () => {
            markup.should.contain('the system has');
            markup.should.contain('--color-primary');
        });
        it('should say what kind of thing it is', () => ['Color', 'Component'].forEach(kind => markup.should.contain(kind)));
        it('should offer to fix them all in one issue', () => markup.should.contain('Fix all 2 in an issue'));
        it('should offer each way of bringing a value back', () => ['Fix in an issue', 'Use token', 'Propose to system'].forEach(text => markup.should.contain(text)));
        it('should not let a token be used for a component or a value with nothing to use instead', () => (markup.match(/disabled=""/g) ?? []).should.have.length(1));
    });

    describe('and the host cannot raise an issue, write a token or propose', () => {
        const markup = draw(state({ canRaiseIssue: false, canUseToken: false, canPropose: false }));

        it('should still list the values', () => markup.should.contain('#123456'));
        it('should offer no way of bringing them back', () => ['Fix in an issue', 'Use token', 'Propose to system', 'Fix all'].forEach(text => markup.should.not.contain(text)));
    });

    describe('and there is no active version', () => {
        it('should say there is no standard to hold designs to', () => draw(state(), false).should.contain('No design system to hold designs to'));
    });

    describe('and the designs have not been read yet', () => {
        it('should say it is reading them', () => draw(state({ isReady: false, entries: [] })).should.contain('Reading the designs'));
    });

    describe('and everything keeps to the standard', () => {
        it('should say so', () => draw(state({ entries: [] })).should.contain('Everything keeps to the design system'));
    });

    describe('and the editor is drawn', () => {
        it('should offer the section when the host can find it', async () => {
            const drawn = await drawEditor({ section: 'standard' }, { standard: screens });
            drawn.markup.should.contain('Reading the designs');
            drawn.markup.should.contain('Off the standard');
        });
        it('should offer no section when the host cannot', async () => {
            const drawn = await drawEditor({ section: 'standard' });
            drawn.markup.should.not.contain('Off the standard');
        });
    });
});
