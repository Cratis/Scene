// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import type { BindingResolver } from '@cratis/scene.engine';
import type { SceneDocument } from '@cratis/scene.model';
import { PlayScreenView } from '../Play/PlayScreen';
import { profileColorSchemeClasses } from '../Runtime/profileColorScheme';
import { profileTheme } from '../Runtime/profileTheme';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import type { ViewportSize } from '../Viewport/ViewportSize';
import { miniatureRegistry } from './miniatureRegistry';
import { thumbnailGeometry, thumbnailMaxBodyHeight, thumbnailWidth } from './thumbnailGeometry';
import { useIsNearViewport } from './useIsNearViewport';
import './ScreenThumbnail.css';

// The three lights of a window's title bar. They are drawn here, not borrowed from the board's older miniature, so the editor's package stands alone.
const trafficLights = ['#f66', '#fa0', '#3c3'] as const;

const noBinding: BindingResolver = () => undefined;

// The height of the miniature's own title bar, which does not scale with the screen, so its traffic lights stay legible.
const titleBarHeight = 16;

export interface ScreenThumbnailProps {
    // The screen to draw: the document the editor saved, read and ready.
    document: SceneDocument;

    // The packages the screen is built from and the host's look for it. One runtime serves every thumbnail on a board.
    runtime: ScreenEditorRuntime;

    // The size of the editor window the screen was designed in, so the miniature has the same shape. The desktop preview when left out.
    windowSize?: ViewportSize;

    // The miniature's width. The board's miniature when left out; a larger preview passes its own.
    width?: number;

    // Words for the frame. The window title the earlier miniature showed, when left out there is none.
    title?: string;
    openTitle?: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;

    // What stands in while the screen is far from the part of the board being looked at: the miniature's frame, empty. Nothing is drawn there.
    placeholder?: ReactNode;

    // Whether the screen's slice is opened over a page (a State Change slice's): a screen that states no fit is then drawn as a dialog, else as a page.
    opensOverPage?: boolean;
}

// A faithful miniature of a screen: the screen itself, drawn by the renderer and in the theme Play uses, laid out at the size of the window it was
// designed in and scaled down - not an approximation made of boxes. It takes no part in interaction (nothing in it can be pressed, focused
// or tabbed to) and it is only drawn while it is near what is on screen, so a board of many slices pays for the few it shows.
export const ScreenThumbnail = ({ document, runtime, windowSize, width, title, openTitle, onClick, placeholder, opensOverPage }: ScreenThumbnailProps) => {
    const frame = useRef<HTMLElement>(null);
    const near = useIsNearViewport(frame);
    const geometry = useMemo(() => thumbnailGeometry(windowSize, width ?? thumbnailWidth, width === undefined ? thumbnailMaxBodyHeight : undefined), [windowSize?.width, windowSize?.height, width]);
    const theme = useMemo(() => profileTheme(runtime), [runtime]);
    const registry = useMemo(() => miniatureRegistry(runtime.registry), [runtime.registry]);
    const style = { width: geometry.width, height: titleBarHeight + geometry.bodyHeight };

    const content = (
        <>
            <div className='screen-thumbnail__title-bar' style={{ height: titleBarHeight }}>
                {trafficLights.map(color => <span key={color} className='screen-thumbnail__light' style={{ borderColor: color }} />)}
                {title && <span className='screen-thumbnail__title'>{title}</span>}
            </div>
            <div className={`screen-thumbnail__body ${profileColorSchemeClasses(theme)}`} data-screen-thumbnail-body='' inert>
                {near
                    ? (
                        <div
                            className='screen-thumbnail__canvas'
                            style={{
                                width: geometry.canvasWidth,
                                height: geometry.canvasHeight,
                                transform: `scale(${geometry.scale})`,
                                ['--studio-surface-viewport-height' as string]: `${geometry.canvasHeight}px`,
                            }}
                            data-studio-viewport=''>
                            <PlayScreenView document={document} runtime={runtime} resolveBinding={noBinding} registry={registry} opensOverPage={opensOverPage} />
                        </div>
                    )
                    : placeholder}
            </div>
        </>
    );

    // Not a `<button>`: the screen inside holds buttons of its own, and a button cannot hold a button.
    const press = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.currentTarget.click();
    };

    return onClick
        ? <div ref={frame as never} role='button' tabIndex={0} className='screen-thumbnail screen-thumbnail--clickable' style={style} title={openTitle} aria-label={openTitle} onClick={onClick} onKeyDown={press}>{content}</div>
        : <div ref={frame as never} className='screen-thumbnail' style={style} role='img' aria-label={title}>{content}</div>;
};
