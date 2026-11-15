// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignChange } from '../../Resolving/designEdits';
import { createDesignEdits } from '../createDesignEdits';

describe('when editing by hand', () => {
    let saved: DesignChange[][];
    const answer: { value: string | undefined } = { value: undefined };
    const save = async (changes: readonly DesignChange[]) => { saved.push([...changes]); return answer.value; };

    beforeEach(() => {
        saved = [];
        answer.value = undefined;
    });

    describe('in the default theme and the dark mode', () => {
        const edits = () => createDesignEdits('Acme', true, 'dark', save);

        it('should set a color in the mode shown', async () => {
            await edits().setValue('color', 'primary', '#fff');
            saved.should.deep.equal([[{ path: 'dark.color.primary', value: '#fff' }]]);
        });
        it('should set anything else in every mode', async () => {
            await edits().setValue('radius', 'content', '2px');
            saved.should.deep.equal([[{ path: 'values.radius.content', value: '2px' }]]);
        });
        it('should add a token as its role and a value in every mode, saved together', async () => {
            await edits().addToken('color', 'accent', 'links', '#00f');
            saved.should.deep.equal([[{ path: 'tokens.color.accent', value: 'links' }, { path: 'values.color.accent', value: '#00f' }]]);
        });
        it('should set a part of a variant in a state', async () => {
            await edits().setPart('Button', 'primary', 'hover', 'text', 'color.text');
            saved[0][0].path.should.equal('components.Button.variants.primary.states.hover.text');
        });
        it('should set a word', async () => {
            await edits().setWord('naming', 'customer', 'Client');
            saved.should.deep.equal([[{ path: 'words.naming.customer', value: 'Client' }]]);
        });
        it('should add a theme as a copy', async () => {
            await edits().addTheme('Partner', 'Acme');
            saved.should.deep.equal([[{ path: 'themes.Partner', value: 'Acme' }]]);
        });
        it('should remove a theme', async () => {
            await edits().removeTheme('Partner');
            saved.should.deep.equal([[{ path: 'themes.Partner', value: '' }]]);
        });
        it('should make a theme the default', async () => {
            await edits().makeDefault('Brand');
            saved.should.deep.equal([[{ path: 'default-theme', value: 'Brand' }]]);
        });
        it('should answer why a change was not saved', async () => {
            answer.value = 'Not now.';
            ((await edits().setWord('voice', 'tone', 'x')) ?? '').should.equal('Not now.');
        });
        it('should answer nothing when it was saved', async () => (await edits().setWord('voice', 'tone', 'x') === undefined).should.be.true);
    });

    describe('in another theme', () => {
        it('should set a color of that theme in the mode shown', async () => {
            await createDesignEdits('Brand', false, 'light', save).setValue('color', 'primary', '#fff');
            saved[0][0].path.should.equal('theme.Brand.light.color.primary');
        });
    });
});
