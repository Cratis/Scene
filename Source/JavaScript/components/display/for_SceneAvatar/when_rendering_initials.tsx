// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { SceneElementView } from '@cratis/scene.react';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';

const renderAvatar = (properties: Record<string, unknown>) => {
    const { container } = render(<SceneElementView element={externalComponent('Cratis.Components:avatar', properties)} registry={cratisComponents} resolveBinding={() => undefined} />);
    return container.querySelector<HTMLElement>('.cratis-avatar')!;
};

describe('when rendering an avatar from initials', () => {
    afterEach(cleanup);

    it('should show the initials', () => renderAvatar({ label: 'AN' }).textContent!.should.equal('AN'));
    it('should pass the size on', () => renderAvatar({ label: 'AN', size: 'xlarge' }).getAttribute('data-size')!.should.equal('xlarge'));
    it('should ignore a size it does not know', () => renderAvatar({ label: 'AN', size: 'huge' }).getAttribute('data-size')!.should.equal('normal'));
    it('should be square by default, as PrimeReact avatars are', () => renderAvatar({ label: 'AN' }).classList.contains('scene-avatar-square').should.equal(true));
    it('should be square when asked to', () => renderAvatar({ label: 'AN', shape: 'square' }).classList.contains('scene-avatar-square').should.equal(true));
    it('should stay round when the shape is circle', () => renderAvatar({ label: 'AN', shape: 'circle' }).classList.contains('scene-avatar-square').should.equal(false));
    it('should carry the square rule only once however many avatars are square', () => {
        render(<>
            <SceneElementView element={externalComponent('Cratis.Components:avatar', { label: 'AN' })} registry={cratisComponents} resolveBinding={() => undefined} />
            <SceneElementView element={externalComponent('Cratis.Components:avatar', { label: 'BO' })} registry={cratisComponents} resolveBinding={() => undefined} />
        </>);
        document.querySelectorAll('style[data-href="scene-avatar-square"]').length.should.equal(1);
    });
    it('should use the label as the alternative text of a picture', () => {
        renderAvatar({ label: 'Ada North', image: 'https://example.test/ada.png' });
        screen.getByRole('img', { name: 'Ada North' }).getAttribute('src')!.should.equal('https://example.test/ada.png');
    });
});
