// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef, type KeyboardEvent } from 'react';
import type { InspectedProperty } from '@cratis/scene.model';
import type { Rect } from '../Surface/dropRegionRects';
import type { EditorContext } from '../PropertyEditors/Registry/PropertyEditorProps';
import type { PropertyEditorRegistry } from '../PropertyEditors/Registry/PropertyEditorRegistry';
import { PropertyEditorHost } from '../PropertyEditors/Registry/PropertyEditorHost';
import type { DesignModeStrings } from './DesignModeStrings';
import './DesignModeChrome.css';

export interface DesignModePopoverProps {
    registry: PropertyEditorRegistry;
    property: InspectedProperty;
    context: EditorContext;

    // The element the property belongs to, for the editor's identity.
    componentId: string;

    // The chip it opened from, in the surface's pixels, and the chip itself, which takes focus back when the popover closes.
    anchor: Rect;
    opener: HTMLElement;
    bounds: Rect;
    title: string;
    strings: DesignModeStrings;
    onChange: (property: InspectedProperty, value: unknown) => void;
    onClose: () => void;
}

const focusable = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
const width = 440;

// A choice of the floating toolbar - the target, the slot, the slice - as a popover under the chip that opened it. What is drawn inside is the
// registry's own editor for the property, the one the Properties tab draws (DM5, PE3): there is one editor per kind of property, and this is
// only another place to put it. Focus is held inside while it is open and goes back to the chip when it closes; Esc closes it.
export const DesignModePopover = ({ registry, property, context, componentId, anchor, opener, bounds, title, strings, onChange, onClose }: DesignModePopoverProps) => {
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const first = root.current?.querySelector<HTMLElement>(focusable);
        (first ?? root.current)?.focus({ preventScroll: true });
        return () => { if (opener.isConnected) opener.focus({ preventScroll: true }); };
    }, [opener]);

    // A press outside the popover - and outside the chip that opened it, which toggles it - closes it.
    useEffect(() => {
        const away = (event: PointerEvent) => {
            const target = event.target as Node | null;
            if (root.current?.contains(target) || opener.contains(target)) return;
            onClose();
        };
        document.addEventListener('pointerdown', away, true);
        return () => document.removeEventListener('pointerdown', away, true);
    }, [opener, onClose]);

    const keys = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); return; }
        if (event.key !== 'Tab') return;
        const inside = Array.from(root.current?.querySelectorAll<HTMLElement>(focusable) ?? []);
        if (inside.length === 0) { event.preventDefault(); return; }
        const first = inside[0];
        const last = inside[inside.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    const left = Math.max(bounds.left, Math.min(anchor.left, bounds.left + bounds.width - width));
    return (
        <div
            ref={root} role='dialog' aria-label={strings.choiceLabel(title)} tabIndex={-1} className='studio-design-popover' data-property={property.descriptor.path}
            style={{ left, top: anchor.top + anchor.height + 6, width }} onKeyDown={keys}>
            <PropertyEditorHost presentation='popover' registry={registry} property={property} context={context} componentId={componentId} onChange={onChange} diagnostics={[]} />
        </div>
    );
};
