// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HTMLAttributes } from 'react';
import { Button } from 'primereact/button';
import { Popover } from 'primereact/popover';
import { MenuItem } from '../MenuItem';

/**
 * Configuration for {@link SplitButton}.
 */
export interface SplitButtonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick' | 'children'> {
    /**
     * The text on the primary half. This is the action the control is named after - the one a reader
     * takes without opening anything.
     */
    label?: string;

    /**
     * An icon class shown before the label on the primary half.
     */
    icon?: string;

    /**
     * The secondary actions, shown when the dropdown half is opened. Empty means there are none, and the
     * dropdown half is left off entirely rather than rendered as a control that opens onto nothing.
     */
    items?: MenuItem[];

    /**
     * Whether both halves are unavailable. There is no way to disable only one: a split button with a
     * dead primary action is a menu wearing the wrong shape.
     */
    disabled?: boolean;

    /**
     * The PrimeReact severity to tint both halves with, so the two read as one control.
     */
    severity?: string;

    /**
     * Invoked when the primary half is pressed. Named apart from the DOM `onClick` this component would
     * otherwise inherit, because the two are different questions - "was the action taken" against
     * "was anything in here clicked", including the dropdown toggle.
     */
    onAction?: () => void;
}

/**
 * One row of the dropdown menu.
 *
 * Kept apart from the composition below so the three shapes an entry can take - a divider, a link, a
 * command - are three plain branches rather than nested conditionals inside the JSX. An entry carrying a
 * `url` becomes a real anchor: it is a navigation, and rendering it as a button would cost the reader the
 * middle-click, the copy-link and the status bar preview that make a link a link.
 */
function SplitButtonItem({ item }: { item: MenuItem }) {
    const className = 'flex w-full items-center gap-2 border-0 bg-transparent px-3 py-2 text-left no-underline disabled:opacity-50';
    const content = (
        <>
            {item.icon !== undefined && <i className={item.icon} aria-hidden='true' />}
            {item.label}
        </>
    );

    if (item.separator === true) return <li role='separator' className='my-1 border-t' />;

    if (item.url !== undefined) {
        return (
            <li role='none'>
                <a role='menuitem' href={item.url} className={className}>
                    {content}
                </a>
            </li>
        );
    }

    return (
        <li role='none'>
            <button type='button' role='menuitem' disabled={item.disabled} onClick={item.command} className={className}>
                {content}
            </button>
        </li>
    );
}

/**
 * A primary action with a dropdown of related ones beside it.
 *
 * Cratis owns this component. PrimeReact 10 had `SplitButton`; PrimeReact 11 removed it with no
 * replacement and no headless hook, while `splitButton` remains a name this package's manifest publishes.
 * It is composed rather than reimplemented: both halves are PrimeReact `Button`s and the menu hangs off a
 * PrimeReact `Popover`, so the control is themed, positioned, portaled and dismissed by the same machinery
 * every other overlay in the application uses. What is actually ours is the arrangement and the menu
 * markup - a `menu` / `menuitem` structure over {@link MenuItem}, which is the part v10 left to chance.
 *
 * A dropdown half with nothing behind it is not rendered, so an authored but not-yet-populated item list
 * degrades to a plain button.
 *
 * What it deliberately does not carry over from v10: nested submenus - `items` is read one level deep,
 * because a split button whose menu has drawers is a menubar and should say so; the `menuButtonProps` /
 * `buttonProps` escape hatches, which existed to reach past the component and are unnecessary when the
 * halves are just Buttons; the `loading` state, which v11's Button no longer has; and `appendTo` and
 * z-index juggling, which the popover's portal makes moot.
 */
export function SplitButton({ label, icon, items = [], disabled = false, severity, onAction, className, ...rest }: SplitButtonProps) {
    return (
        <span {...rest} className={['inline-flex', className].filter(Boolean).join(' ')}>
            <Button severity={severity} disabled={disabled} onClick={onAction}>
                {icon !== undefined && <i className={icon} aria-hidden='true' />}
                {label}
            </Button>
            {items.length > 0 && (
                <Popover.Root>
                    <Popover.Trigger as={Button} severity={severity} disabled={disabled} aria-label={label === undefined ? 'More actions' : `More actions for ${label}`}>
                        <i className='pi pi-chevron-down' aria-hidden='true' />
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Positioner>
                            <Popover.Popup>
                                <Popover.Content>
                                    <ul role='menu' className='m-0 flex list-none flex-col p-0'>
                                        {items.map((item, index) => (
                                            <SplitButtonItem key={index} item={item} />
                                        ))}
                                    </ul>
                                </Popover.Content>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                </Popover.Root>
            )}
        </span>
    );
}
