// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent } from '../storyElements';

describe('when loading an inline collection', () => {
    it('should reveal the next authored row chunk without changing the element data', () => {
        const element = sceneComponent('scroller', 'dataScroller', { items: ['One', 'Two', 'Three'], rows: 2, inline: true, scrollHeight: 100 });
        render(<SceneElementView element={element} registry={primeReactComponents} resolveBinding={() => undefined} />);

        (screen.getByText('One') !== undefined).should.equal(true);
        (screen.getByText('Two') !== undefined).should.equal(true);
        (screen.queryByText('Three') === null).should.equal(true);

        fireEvent.click(screen.getByRole('button', { name: 'Load more' }));

        (screen.getByText('Three') !== undefined).should.equal(true);
        JSON.stringify(element.properties.items).should.equal(JSON.stringify(['One', 'Two', 'Three']));
    });
});
