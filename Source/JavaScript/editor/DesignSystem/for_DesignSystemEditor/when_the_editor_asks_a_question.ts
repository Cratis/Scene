// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultDesignSystemEditorStrings } from '../defaultDesignSystemEditorStrings';
import { ConfirmationBar } from '../Editing/useConfirmation';
import { createFakeDesignSystemHost } from '../Testing/createFakeDesignSystemHost';
import { DesignSystemEditor } from '../DesignSystemEditor';

const strings = defaultDesignSystemEditorStrings.prompts;

describe('when the editor asks a question', () => {
    describe('and one is pending', () => {
        const markup = renderToStaticMarkup(createElement(ConfirmationBar, { pending: { title: 'Start a draft?', message: 'Nothing changes yet.' }, strings, onRespond: () => {} }));

        it('should say what is being decided', () => markup.should.contain('Start a draft?'));
        it('should say what answering yes does', () => markup.should.contain('Nothing changes yet.'));
        it('should offer a yes and a no', () => [strings.yes, strings.no].forEach(text => markup.should.contain(`>${text}<`)));
        it('should be announced as a dialog', () => markup.should.contain('role="alertdialog"'));
    });

    describe('and none is pending', () => {
        it('should draw nothing', () => renderToStaticMarkup(createElement(ConfirmationBar, { pending: undefined, strings, onRespond: () => {} })).should.equal(''));
    });
});

describe('when the editor opens before the host has answered', () => {
    const host = createFakeDesignSystemHost();
    const markup = renderToStaticMarkup(createElement(DesignSystemEditor, { host }));

    it('should say it is loading', () => markup.should.contain('Loading the design system'));
    it('should draw no section', () => markup.should.not.contain('Design system sections'));
    it('should still title itself', () => markup.should.contain('<h2'));
});

describe('when the editor is given the host\'s own words', () => {
    it('should use them in place of the English ones', () => {
        const markup = renderToStaticMarkup(createElement(DesignSystemEditor, {
            host: createFakeDesignSystemHost(),
            strings: { ...defaultDesignSystemEditorStrings, title: 'Designsystem', loading: 'Laster' },
        }));
        markup.should.contain('Designsystem');
        markup.should.contain('Laster');
    });
});
