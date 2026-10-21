// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Font-free marks for the shell, including the legacy names authored in its navigation templates. */
const paths: Record<string, string> = {
    bars: 'M4 6h16M4 12h16M4 18h16',
    'angle-down': 'm6 9 6 6 6-6',
    'chevron-right': 'm9 6 6 6-6 6',
    times: 'm6 6 12 12M6 18 18 6',
    cog: 'm9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3ZM9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
    lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5ZM12 14v3',
    'lock-open': 'M7 10V7a5 5 0 0 1 9-3M5 10h14v11H5ZM12 14v3',
    home: 'm3 11 9-8 9 8M5 9v12h5v-7h4v7h5V9',
    box: 'm3 7 9-4 9 4v10l-9 4-9-4ZM3 7l9 4 9-4M12 11v10',
    clone: 'M8 8h13v13H8ZM16 8V3H3v13h5',
    user: 'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 21v-3a8 8 0 0 1 16 0v3',
    users: 'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 21v-3a8 8 0 0 1 16 0v3M18 3a4 4 0 0 1 0 8M2 21v-3M22 21v-3',
    receipt: 'M5 3h14v18l-3-2-4 2-4-2-3 2ZM8 7h8M8 11h8M8 15h5',
    gift: 'M3 8h18v5H3ZM5 13v8h14v-8M12 8v13M12 8C2 8 7 0 12 8c10 0 5-8 0 0',
    database: 'M3 6a9 3 0 1 0 18 0 9 3 0 0 0-18 0M3 6v12a9 3 0 0 0 18 0V6M3 12a9 3 0 0 0 18 0',
    palette: 'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h5a3 3 0 0 0 3-3c0-4-4-7-9-7ZM7 8h.01M12 6h.01M6 13h.01M17 8h.01',
    book: 'M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1ZM12 5v15',
    file: 'M5 3h9l5 5v13H5ZM14 3v5h5M8 12h8M8 16h8',
    inbox: 'M5 4h14l3 12v5H2v-5ZM2 16h6l2 3h4l2-3h6',
    'plus-circle': 'M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M7 12h10M12 7v10',
    'question-circle': 'M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01',
};

/** Draws the shell's own icons without installing a font; custom host classes remain supported. */
export function ShellIcon({ name, className = '' }: { name: string; className?: string }) {
    const key = name.split(' ').find(part => part.startsWith('pi-'))?.slice(3) ?? name.replace(/^pi-/, '');
    const path = paths[key];
    if (!path) return <i className={`${className} ${name}`} aria-hidden='true' />;
    return <svg className={`layout-icon ${className}`} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' focusable='false'><path d={path} /></svg>;
}
