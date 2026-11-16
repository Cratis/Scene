// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { fitOverlay } from './fitOverlay';
import './ScreenEditorOverlayChrome.css';
import './ScreenEditorOverlayFrame.css';

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 640;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 300;

// The width of the inspector that slides in beside the window.
export const inspectorWidth = 360;

export interface OverlaySize {
    width: number;
    height: number;
}

const normalizeOverlaySize = (size?: OverlaySize): OverlaySize => {
    if (!size) {
        return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
    }

    return {
        width: size.width > 0 ? size.width : DEFAULT_WIDTH,
        height: size.height > 0 ? size.height : DEFAULT_HEIGHT,
    };
};

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const resizeHandles: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

// What the frame tells what it frames.
export interface ScreenEditorOverlayFrameState {
    size: OverlaySize;
    setSize: (size: OverlaySize) => void;
    isInspectorOpen: boolean;
    toggleInspector: () => void;

    // Closes the window the way clicking the backdrop does: the closing animation, then onClosed.
    close: () => void;

    // Closes the window without asking canClose first - leaving a draft that cannot be saved. The closing animation, then onClosed.
    closeWithoutSaving: () => void;
}

export interface ScreenEditorOverlayFrameProps {

    // Where the zoom animation grows out of - the cell the editor was opened from.
    sourceRect: DOMRect;
    initialSize?: OverlaySize;

    // Shifts the centred window sideways, for a host with a side panel of its own.
    centerOffsetX?: number;

    // The window, drawn inside the frame at the frame's size.
    children: (state: ScreenEditorOverlayFrameState) => ReactNode;

    // The inspector, slid in from the right edge. Studio chrome: never part of the designed screen.
    renderInspector?: (state: ScreenEditorOverlayFrameState) => ReactNode;

    // Called before closing. Returning false keeps the editor open.
    canClose?: (size: OverlaySize) => Promise<boolean>;

    // Called once the closing animation has finished, with the size the window ended at.
    onClosed: (size: OverlaySize) => void;
}

// The floating window's frame: the zoom in and out, the dimmed backdrop, resizing from every edge and corner, and the
// inspector that slides in beside it. It knows nothing about what is edited - the legacy element editor and the Scene
// editor both draw inside it.
export const ScreenEditorOverlayFrame = ({ sourceRect, initialSize, centerOffsetX = 0, children, renderInspector, canClose, onClosed }: ScreenEditorOverlayFrameProps) => {
    const [animState, setAnimState] = useState<'entering' | 'visible' | 'closing'>('entering');
    const [size, setSize] = useState(() => normalizeOverlaySize(initialSize));
    const sizeRef = useRef(size);
    sizeRef.current = size;
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
    useEffect(() => {
        const follow = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', follow);
        return () => window.removeEventListener('resize', follow);
    }, []);
    const toggleInspector = useCallback(() => setIsInspectorOpen(open => !open), []);
    const resizeRef = useRef<{ direction: ResizeDirection; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

    useEffect(() => {
        // Give the browser one frame to paint the initial (scaled-down) state before animating in.
        const frameId = requestAnimationFrame(() => setAnimState('visible'));
        return () => cancelAnimationFrame(frameId);
    }, []);

    const handleClose = useCallback(async (withoutSaving = false) => {
        if (!withoutSaving && canClose && !await canClose(sizeRef.current)) return;
        setAnimState('closing');
        setTimeout(() => onClosed(sizeRef.current), 300);
    }, [canClose, onClosed]);

    const handleResizePointerDown = (direction: ResizeDirection, event: React.PointerEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.preventDefault();
        resizeRef.current = { direction, startX: event.clientX, startY: event.clientY, startWidth: size.width, startHeight: size.height };
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    };

    const handleResizePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const state = resizeRef.current;
        if (!state) return;

        const { direction } = state;
        let width = state.startWidth;
        let height = state.startHeight;

        // The window is centred, so growing one side moves both margins: the change counts twice.
        if (direction.includes('e') || direction.includes('w')) {
            const delta = direction.includes('e') ? event.clientX - state.startX : state.startX - event.clientX;
            width = Math.max(MIN_WIDTH, state.startWidth + delta * 2);
        }

        if (direction.includes('s') || direction.includes('n')) {
            const delta = direction.includes('s') ? event.clientY - state.startY : state.startY - event.clientY;
            height = Math.max(MIN_HEIGHT, state.startHeight + delta * 2);
        }

        setSize({ width, height });
    }, []);

    const handleResizePointerUp = useCallback(() => {
        resizeRef.current = null;
    }, []);

    // The inspector slides in over the right edge, so the window shifts left by half its width to stay uncovered.
    // What is drawn is the most of the window's size the display has room for, kept inside it; the size itself is not changed.
    const fitted = fitOverlay(size, viewport, centerOffsetX - (isInspectorOpen ? inspectorWidth / 2 : 0));
    const windowOffsetX = fitted.offsetX;
    const state: ScreenEditorOverlayFrameState = { size, setSize, isInspectorOpen, toggleInspector, close: () => { void handleClose(); }, closeWithoutSaving: () => { void handleClose(true); } };

    // `transform-origin` is expressed in the element's own coordinates, so the source cell's viewport position is
    // converted to be relative to the content element's top-left corner.
    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;
    const elementLeft = viewport.width / 2 + windowOffsetX - fitted.width / 2;
    const elementTop = viewport.height / 2 - fitted.height / 2;
    const transformOrigin = `${sourceCenterX - elementLeft}px ${sourceCenterY - elementTop}px`;

    const contentClassName = [
        'prototype-editor-overlay-content',
        animState === 'visible' ? 'prototype-editor-overlay-content--visible' : '',
        animState === 'closing' ? 'prototype-editor-overlay-content--closing' : '',
    ].join(' ');

    const backdropClassName = [
        'prototype-editor-overlay-backdrop',
        animState === 'visible' ? 'prototype-editor-overlay-backdrop--visible' : '',
    ].join(' ');

    return (
        <div className={backdropClassName} data-testid='studio-screen-editor-backdrop' onClick={() => { void handleClose(); }}>
            <div
                className={contentClassName}
                data-testid='studio-screen-editor-frame'
                style={{ transformOrigin, width: fitted.width, height: fitted.height, marginLeft: -(fitted.width / 2) + windowOffsetX, marginTop: -(fitted.height / 2) }}
                onClick={event => event.stopPropagation()}
                onPointerDown={event => event.stopPropagation()}
            >
                {animState === 'visible' && resizeHandles.map(direction => (
                    <div
                        key={direction}
                        className={`prototype-editor-overlay-resize prototype-editor-overlay-resize--${direction}`}
                        onPointerDown={event => handleResizePointerDown(direction, event)}
                        onPointerMove={handleResizePointerMove}
                        onPointerUp={handleResizePointerUp}
                        onPointerCancel={handleResizePointerUp}
                    />
                ))}
                {children(state)}
            </div>
            {renderInspector && (
                <aside
                    className={`prototype-editor-overlay-inspector${isInspectorOpen && animState === 'visible' ? ' prototype-editor-overlay-inspector--open' : ''}`}
                    style={{ width: inspectorWidth }}
                    aria-hidden={!isInspectorOpen}
                    inert={!isInspectorOpen}
                    onClick={event => event.stopPropagation()}
                    onPointerDown={event => event.stopPropagation()}
                >
                    {renderInspector(state)}
                </aside>
            )}
        </div>
    );
};
