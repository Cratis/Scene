// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, render, screen } from '@testing-library/react';
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
    describe('with a picture', () => {
        const probes: { onload: (() => void) | null; onerror: (() => void) | null; src: string }[] = [];
        const originalImage = globalThis.Image;
        beforeEach(() => {
            probes.length = 0;
            globalThis.Image = class { onload: (() => void) | null = null; onerror: (() => void) | null = null; src = ''; constructor() { probes.push(this); } } as unknown as typeof Image;
        });
        afterEach(() => { globalThis.Image = originalImage; });

        it('should show the label while the picture loads', () => {
            const avatar = renderAvatar({ label: 'AN', image: 'https://example.test/ada.png' });
            avatar.textContent!.should.equal('AN');
            (avatar.querySelector('img') === null).should.equal(true);
        });
        it('should show the label when the picture fails to load', async () => {
            const avatar = renderAvatar({ label: 'AN', image: 'https://example.test/missing.png' });
            await act(async () => probes[0].onerror?.());
            avatar.textContent!.should.equal('AN');
            (avatar.querySelector('img') === null).should.equal(true);
        });
        it('should use the label as the alternative text once the picture has loaded', async () => {
            renderAvatar({ label: 'Ada North', image: 'https://example.test/ada.png' });
            await act(async () => probes[0].onload?.());
            screen.getByRole('img', { name: 'Ada North' }).getAttribute('src')!.should.equal('https://example.test/ada.png');
        });
    });
});
