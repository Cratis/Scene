// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The icons the foundation components draw themselves, so none of them depends on an icon font being loaded. */
export type FoundationIconName =
    | 'check' | 'close' | 'arrow-up' | 'arrow-down' | 'minus' | 'alert' | 'info' | 'lock' | 'clock' | 'inbox' | 'refresh'
    | 'plus' | 'chevron-right' | 'chevron-down' | 'upload' | 'file' | 'user' | 'columns' | 'filter' | 'star' | 'circle' | 'cart' | 'bell';

const paths: Record<FoundationIconName, string> = {
    check: 'M5 13l4 4L19 7',
    close: 'M6 6l12 12M18 6L6 18',
    'arrow-up': 'M12 19V5M5 12l7-7 7 7',
    'arrow-down': 'M12 5v14M5 12l7 7 7-7',
    minus: 'M5 12h14',
    alert: 'M12 8v5M12 16.5v.5M10.3 3.9L2.5 17.5A2 2 0 004.2 20.5h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
    info: 'M12 11v6M12 7.5v.5M12 21a9 9 0 100-18 9 9 0 000 18z',
    lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z',
    clock: 'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z',
    inbox: 'M3 13l3-8h12l3 8M3 13v6a1 1 0 001 1h16a1 1 0 001-1v-6M3 13h5l1 3h6l1-3h5',
    refresh: 'M20 11a8 8 0 10-2.3 6.3M20 4v7h-7',
    plus: 'M12 5v14M5 12h14',
    'chevron-right': 'M9 5l7 7-7 7',
    'chevron-down': 'M5 9l7 7 7-7',
    upload: 'M12 16V4M7 9l5-5 5 5M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2',
    file: 'M14 3H7a1 1 0 00-1 1v16a1 1 0 001 1h10a1 1 0 001-1V7l-4-4zM14 3v4h4',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
    columns: 'M4 5h16v14H4zM9.5 5v14M14.5 5v14',
    filter: 'M4 5h16l-6 8v6l-4-2v-4L4 5z',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z',
    circle: 'M12 20a8 8 0 100-16 8 8 0 000 16z',
    cart: 'M3 4h2.2l2.1 10.2a1 1 0 001 .8h8.6a1 1 0 001-.8L19.6 8H6.2M9.5 19.5a.5.5 0 100-1 .5.5 0 000 1zM16.5 19.5a.5.5 0 100-1 .5.5 0 000 1z',
    bell: 'M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 20.5a2 2 0 004 0',
};

/** Whether a name is one of the icons drawn here. */
export function isFoundationIcon(name: string): name is FoundationIconName {
    return name in paths;
}

/**
 * One icon. It is decorative unless given a label: the meaning an icon carries is always repeated in text, so no status is
 * conveyed by color or shape alone (WCAG 1.4.1).
 */
export function FoundationIcon({ name, label }: { name: FoundationIconName; label?: string }) {
    return (
        <svg className='foundation-icon' viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' strokeWidth='2'
            strokeLinecap='round' strokeLinejoin='round' aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}>
            <path d={paths[name]} />
        </svg>
    );
}
