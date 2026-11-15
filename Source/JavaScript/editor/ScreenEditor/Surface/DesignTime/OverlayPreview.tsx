// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement, type ComponentType, type ReactNode } from 'react';
import type { ExternalComponent } from '@cratis/scene.model';
import type { RegisteredComponentProps } from '@cratis/scene.react';
import { OverlayKind } from './overlayKinds';
import './OverlayPreview.css';

export interface OverlayPreviewProps {
    kind: OverlayKind;

    // What the overlay says it is, drawn on its frame so it is not mistaken for a part of the screen.
    tag: string;
    element: ExternalComponent;
    slots: Record<string, ReactNode[]>;

    // The registry's own message component, so a toast is previewed with the real thing.
    message?: ComponentType<RegisteredComponentProps>;
}

const text = (element: ExternalComponent, ...names: string[]): string | undefined => {
    for (const name of names) {
        const value = element.properties?.[name];
        if (typeof value === 'string' && value.length > 0) return value;
    }

    return undefined;
};

// An overlay drawn in place of the control that opens it: its own content, inside a frame that says it is an overlay. The content is the
// real thing - the slots the author filled, and for a toast the registry's own message - so what is framed looks as it will when opened.
export function OverlayPreview({ kind, tag, element, slots, message }: OverlayPreviewProps) {
    const content = slots.content ?? [];
    const title = text(element, 'header', 'title', 'summary') ?? element.name ?? element.componentName;
    const body = text(element, 'message', 'detail', 'text', 'label');

    const inner = (): ReactNode => {
        switch (kind) {
            case OverlayKind.Toast:
                return message
                    ? createElement(message, { element: { ...element, componentName: 'message', properties: { severity: element.properties?.severity ?? 'success', text: [text(element, 'summary'), text(element, 'detail')].filter(Boolean).join(' - ') || title } }, slots: {} })
                    : <div className='studio-overlay-preview__body'>{title}</div>;
            case OverlayKind.Tooltip:
                return (
                    <div className='studio-overlay-preview__tooltip'>
                        <span className='studio-overlay-preview__trigger'>{content.length > 0 ? content : (text(element, 'label') ?? title)}</span>
                        <span className='studio-overlay-preview__bubble' role='tooltip'>{text(element, 'text') ?? title}</span>
                    </div>
                );
            case OverlayKind.Mask:
                return (
                    <div className='studio-overlay-preview__masked'>
                        <div className='studio-overlay-preview__body'>{content.length > 0 ? content : title}</div>
                        <div className='studio-overlay-preview__mask'><i className='pi pi-lock' aria-hidden='true' /></div>
                    </div>
                );
            case OverlayKind.Busy:
                return (
                    <div className='studio-overlay-preview__busy'>
                        <i className='pi pi-spin pi-spinner' aria-hidden='true' />
                        <span>{body ?? title}</span>
                    </div>
                );
            default:
                return (
                    <div className='studio-overlay-preview__window'>
                        <div className='studio-overlay-preview__header'><strong>{title}</strong><i className='pi pi-times' aria-hidden='true' /></div>
                        <div className='studio-overlay-preview__body'>{content.length > 0 ? content : body}</div>
                    </div>
                );
        }
    };

    return (
        <div className='studio-overlay-preview' data-overlay={kind} data-scene-id={element.id}>
            <span className='studio-overlay-preview__tag'>{tag}</span>
            {inner()}
        </div>
    );
}
