// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { renderToString } from 'react-dom/server';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent } from '../storyElements';
import { forbiddenInOutput, hostileHtml } from './given/hostile_html';

describe('when rendering html on the server', () => {
    const render = (value: string) => renderToString(
        <SceneElementView element={sceneComponent('editor', 'editor', { value, readOnly: true, showHeader: false })} registry={primeReactComponents} resolveBinding={() => undefined} />
    );

    describe('and the value is ordinary rich text', () => {
        const html = render('<p>Release <strong>notes</strong> &amp; more</p>');

        it('should show the words as plain text, with no DOM to build markup from', () => {
            html.should.contain('Release notes &amp; more');
            html.should.not.contain('<strong>');
        });

        it('should say that editing is not available, rather than showing a placeholder control', () => {
            html.should.contain('not available');
            html.should.not.contain('contenteditable');
        });
    });

    describe('and the value is hostile', () => {
        const html = render(hostileHtml).toLowerCase();

        for (const forbidden of forbiddenInOutput) {
            it(`should not emit '${forbidden.replace('\t', '<tab>')}'`, () => {
                html.should.not.contain(forbidden.toLowerCase());
            });
        }

        it('should still show the harmless words', () => {
            html.should.contain('hi');
            html.should.contain('styled');
        });
    });
});
