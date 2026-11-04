// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
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
 * The library's `Avatar` shows an image the moment one is named, with no fallback while it loads or if it
 * fails. PrimeReact shows the label or icon in both cases, so the picture is probed first and only handed over
 * once it has loaded; until then, and for good if it fails, the label or icon shows.
 */
function useLoadedImage(image: string | undefined): string | undefined {
    const [loaded, setLoaded] = useState<string | undefined>(undefined);
    useEffect(() => {
        setLoaded(undefined);
        if (!image) return;
        let current = true;
        const probe = new Image();
        probe.onload = () => { if (current) setLoaded(image); };
        probe.src = image;
        return () => { current = false; probe.onload = null; };
    }, [image]);
    return loaded === image ? loaded : undefined;
}

/**
 * The `Cratis.Components:avatar` component - `Avatar` from `@cratis/components/Display`.
 *
 * `label`, `icon`, `image` and `size` behave as on `PrimeReact:avatar`, and so does `shape`, which is
 * `square` unless a screen says `circle`: the library has no shape of its own, so `square` is added here. The
 * label doubles as the image's alt text, and shows (as does the `icon`) while the image loads or if it fails. An `icon` is an icon-font class marked decorative.
 */
export function SceneAvatar({ element }: RegisteredComponentProps) {
    const label = stringProperty(element.properties, 'label');
    const icon = stringProperty(element.properties, 'icon');
    const image = useLoadedImage(stringProperty(element.properties, 'image'));
    const square = (unionProperty(element.properties, 'shape', shapes) ?? 'square') === 'square';
    return (
        <>
            {square && <style href='scene-avatar-square' precedence='default'>{squareShape}</style>}
            <Avatar
                label={label}
                alt={label ?? ''}
                image={image}
                icon={icon === undefined ? undefined : <i className={icon} aria-hidden='true' />}
                size={unionProperty(element.properties, 'size', sizes)}
                className={square ? 'scene-avatar-square' : undefined}
            />
        </>
    );
}
