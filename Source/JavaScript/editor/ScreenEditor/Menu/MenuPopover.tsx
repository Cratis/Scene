// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { placeMenu } from './menuPlacement';
import './MenuPopover.css';

export interface MenuPopoverProps {
    // The icon on the button, the name the button and the menu carry, and the words on the menu's close action.
    icon: ReactNode;
    title: string;
    heading: string;
    closeLabel: string;
    className?: string;
    // Words drawn beside the icon, so the button reads as a named toolbar action.
    label?: string;
    // The menu cannot be opened; the reason is the button's title.
    disabled?: boolean;
    disabledReason?: string;
    children: ReactNode;
}

const gap = 8;
const margin = 8;

// A menu that opens from its button: below it when there is room and above it when there is not, never wider or taller than the window - what does not
// fit scrolls inside the menu. It is drawn in the browser's top layer, so no dialog's edge clips it and nothing is drawn over it.
export const MenuPopover = ({ icon, title, heading, closeLabel, className = '', label, disabled = false, disabledReason, children }: MenuPopoverProps) => {
    const [open, setOpen] = useState(false);
    const container = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const titleId = useId();

    const close = useCallback((restoreFocus: boolean) => {
        setOpen(false);
        if (restoreFocus) window.setTimeout(() => trigger.current?.focus(), 0);
    }, []);

    // A menu that is open when it becomes disabled closes with it.
    const isOpen = open && !disabled;
    const place = useCallback(() => {
        const element = panel.current;
        const anchor = trigger.current;
        const body = content.current;
        if (!element || !anchor || !body) return;

        // The menu is measured as it would be with the whole window to itself, then given the place the window leaves it.
        const scrolled = body.scrollTop;
        element.style.width = '';
        element.style.maxHeight = 'none';
        const natural = { width: element.offsetWidth, height: element.offsetHeight };
        const rectangle = anchor.getBoundingClientRect();
        const placement = placeMenu({
            trigger: { left: rectangle.left, top: rectangle.top, right: rectangle.right, bottom: rectangle.bottom },
            content: natural,
            viewport: { width: window.innerWidth, height: window.innerHeight },
            gap,
            margin,
        });
        element.style.left = `${placement.left}px`;
        element.style.top = `${placement.top}px`;
        element.style.width = `${placement.width}px`;
        element.style.maxHeight = `${placement.height}px`;
        element.dataset.side = placement.side;
        body.scrollTop = scrolled;
    }, []);

    useLayoutEffect(() => {
        const element = panel.current;
        if (!isOpen || !element) return;
        if (typeof element.showPopover === 'function' && !element.matches(':popover-open')) element.showPopover();
        place();

        // Placing the menu resizes what is observed, so it is done between frames rather than from inside the observer's own delivery.
        let frame = 0;
        const observer = typeof ResizeObserver === 'undefined' || !content.current ? undefined : new ResizeObserver(() => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(place);
        });
        if (content.current) observer?.observe(content.current);
        // The page scrolling moves the button; the menu's own scrolling does not.
        const reposition = (event: Event) => {
            if (!element.contains(event.target as Node)) place();
        };
        window.addEventListener('resize', place);
        window.addEventListener('scroll', reposition, true);
        return () => {
            window.cancelAnimationFrame(frame);
            observer?.disconnect();
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', reposition, true);
            if (typeof element.hidePopover === 'function' && element.matches(':popover-open')) element.hidePopover();
        };
    }, [isOpen, place]);

    useEffect(() => {
        if (!isOpen) return;
        const outside = (event: Event) => {
            if (container.current && !container.current.contains(event.target as Node)) setOpen(false);
        };
        const escape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            event.stopPropagation();
            close(true);
        };
        document.addEventListener('pointerdown', outside);
        document.addEventListener('keydown', escape, true);
        return () => {
            document.removeEventListener('pointerdown', outside);
            document.removeEventListener('keydown', escape, true);
        };
    }, [isOpen, close]);

    return (
        <div ref={container} className={`studio-menu-popover ${className}`.trim()} data-open={isOpen || undefined}>
            <button
                ref={trigger} type='button' className={`toolbar-button studio-menu-popover__trigger${label ? ' studio-menu-popover__trigger--labelled' : ''}${isOpen ? ' toolbar-button--active' : ''}`} aria-label={title}
                title={disabled && disabledReason ? disabledReason : title} aria-expanded={isOpen} aria-controls={panelId} disabled={disabled} onClick={() => setOpen(current => !current)}>
                {icon}
                {label && <span className='studio-menu-popover__label'>{label}</span>}
            </button>
            <div ref={panel} id={panelId} popover='manual' role='group' aria-labelledby={titleId} className='studio-menu-popover__panel' data-open={isOpen || undefined}>
                <div className='studio-menu-popover__header'>
                    <span id={titleId} className='studio-menu-popover__title'>{heading}</span>
                    <button type='button' className='toolbar-button studio-menu-popover__close' aria-label={closeLabel} onClick={() => close(true)}>×</button>
                </div>
                <div ref={content} className='studio-menu-popover__body'>{children}</div>
            </div>
        </div>
    );
};
