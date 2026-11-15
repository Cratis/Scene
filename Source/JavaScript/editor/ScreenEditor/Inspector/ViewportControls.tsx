// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import { IconButton } from '@cratis/components/Common';
import { FaDesktop, FaMobileAlt, FaThLarge, FaWindowMaximize } from 'react-icons/fa';
import { detectViewportPreset } from '../Viewport/detectViewportPreset';
import { resolveViewportSizeClass } from '../Viewport/resolveViewportSizeClass';
import { toViewport, toWindowSize } from '../Viewport/toWindowSize';
import { viewportPresetSizes } from '../Viewport/viewportPresets';
import { ViewportPreset } from '../Viewport/ViewportPreset';
import type { ViewportSize } from '../Viewport/ViewportSize';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import './ViewportControls.css';

export interface ViewportControlsProps {

    // The window's actual size.
    windowSize: ViewportSize;

    // The room the display has for the window.
    available: ViewportSize;

    strings: ScreenEditorStrings;

    // The application's shell around the screen: offered where there is one to draw.
    shell?: { shown: boolean; toggle: () => void };

    // What the screen opens as when it is a dialog or a drawer: said in place of the shell toggle, because a popup opens over the application and is
    // drawn as itself, with no shell to show.
    opensAs?: string;

    // The template the screen is built from, around the slice's own content: offered where the screen has one.
    template?: { shown: boolean; toggle: () => void };
    onResize: (size: ViewportSize) => void;
}

// The desktop and mobile presets for the window chrome, with the size class Scene evaluates for the current size.
// A preset only resizes the window; continuous resizing goes through exactly the same evaluation.
export const ViewportControls = ({ windowSize, available, strings, shell, opensAs, template, onResize }: ViewportControlsProps) => {
    const active = detectViewportPreset(windowSize, available);
    const viewport = toViewport(windowSize);
    const sizeClass = resolveViewportSizeClass(windowSize);

    const preset = (viewportPreset: ViewportPreset, icon: ReactNode, label: string) => (
        <IconButton
            icon={icon}
            aria-label={label}
            aria-pressed={active === viewportPreset}
            title={label}
            variant='ghost'
            size='small'
            onClick={() => onResize(toWindowSize(viewportPresetSizes[viewportPreset], available))}
        />
    );

    return (
        <div className='studio-editor-viewport-controls' role='group' aria-label={strings.sizeClass(sizeClass.width, sizeClass.height)}>
            {preset(ViewportPreset.Desktop, <FaDesktop aria-hidden='true' />, strings.desktopPreview)}
            {preset(ViewportPreset.Mobile, <FaMobileAlt aria-hidden='true' />, strings.mobilePreview)}
            {template && (
                <IconButton
                    icon={<FaThLarge aria-hidden='true' />}
                    aria-label={template.shown ? strings.hideTemplate : strings.showTemplate}
                    aria-pressed={template.shown}
                    title={template.shown ? strings.hideTemplate : strings.showTemplate}
                    variant='ghost'
                    size='small'
                    data-studio-template-toggle=''
                    onClick={template.toggle}
                />
            )}
            {opensAs && <span className='studio-editor-viewport-controls__opens-as' data-studio-opens-as=''>{opensAs}</span>}
            {shell && (
                <IconButton
                    icon={<FaWindowMaximize aria-hidden='true' />}
                    aria-label={shell.shown ? strings.hideApplicationShell : strings.showApplicationShell}
                    aria-pressed={shell.shown}
                    title={shell.shown ? strings.hideApplicationShell : strings.showApplicationShell}
                    variant='ghost'
                    size='small'
                    onClick={shell.toggle}
                />
            )}
            <span className='studio-editor-viewport-controls__size' role='status'>
                {strings.viewportSize(viewport.width, viewport.height)} · {strings.sizeClass(sizeClass.width, sizeClass.height)}
            </span>
        </div>
    );
};
