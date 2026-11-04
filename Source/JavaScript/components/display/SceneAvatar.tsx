// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Avatar } from '@cratis/components/Display';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty, unionProperty } from '../properties';

const sizes = ['normal', 'large', 'xlarge'] as const;
const shapes = ['square', 'circle'] as const;

/**
 * `Avatar` is always round, so a square avatar is a rule on top of it. The `<style>` carries an `href` and a
 * `precedence`, which React 19 hoists to the head once however many avatars render, so no stylesheet has to be
 * imported for the property to work. The doubled class outranks the library's own `.cratis-avatar` radius.
 */
const squareShape = '.cratis-avatar.scene-avatar-square { border-radius: 0.375rem; }';

/**
 * The `Cratis.Components:avatar` component - `Avatar` from `@cratis/components/Display`.
 *
 * `label`, `icon`, `image` and `size` behave as on `PrimeReact:avatar`, and so does `shape`, which is
 * `square` unless a screen says `circle`: the library has no shape of its own, so `square` is added here. The
 * label doubles as the image's alt text, and an `icon` is an icon-font class marked decorative.
 */
export function SceneAvatar({ element }: RegisteredComponentProps) {
    const label = stringProperty(element.properties, 'label');
    const icon = stringProperty(element.properties, 'icon');
    const square = (unionProperty(element.properties, 'shape', shapes) ?? 'square') === 'square';
    return (
        <>
            {square && <style href='scene-avatar-square' precedence='default'>{squareShape}</style>}
            <Avatar
                label={label}
                alt={label ?? ''}
                image={stringProperty(element.properties, 'image')}
                icon={icon === undefined ? undefined : <i className={icon} aria-hidden='true' />}
                size={unionProperty(element.properties, 'size', sizes)}
                className={square ? 'scene-avatar-square' : undefined}
            />
        </>
    );
}
