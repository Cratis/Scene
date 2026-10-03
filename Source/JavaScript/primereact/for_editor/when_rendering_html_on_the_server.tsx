// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { renderToString } from 'react-dom/server';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent } from '../storyElements';

describe('when rendering HTML on the server', () => {
    it('should expose the authored HTML and read-only status without loading the browser editor', () => {
        const element = sceneComponent('editor', 'editor', { value: '<p>Release <strong>notes</strong></p>', readOnly: true, showHeader: false });
        const html = renderToString(<SceneElementView element={element} registry={primeReactComponents} resolveBinding={() => undefined} />);

        html.should.contain('Release');
        html.should.contain('notes');
        html.should.contain('Read only');
    });
});
