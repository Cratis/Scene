// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

const declaration = /^(\s*)(layout|module|screen template|dialog template|ui profile|theme)\s+([A-Za-z_][\w.]*)/;

interface Heading {
    indent: number;
    kind: string;
    name: string;
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Where a component is used in a design system's Screenplay: the layouts, templates, profiles and themes whose text names it.
 * @param screenplay The Screenplay source of the version shown.
 * @param component The component's name.
 * @returns The declarations that mention it, as `layout AppShell` or `screen template Workspaces.Sheet`, each once, in the order they appear.
 */
export const whereUsed = (screenplay: string, component: string): string[] => {
    const mention = new RegExp(`(^|[^\\w])${escape(component)}([^\\w]|$)`);
    const found: string[] = [];
    let stack: Heading[] = [];

    for (const line of screenplay.split('\n')) {
        const match = declaration.exec(line);
        if (match) {
            const indent = match[1].length;
            stack = [...stack.filter((heading) => heading.indent < indent), { indent, kind: match[2], name: match[3] }];
            continue;
        }

        if (line.trim() === '' || !mention.test(line)) continue;
        const indent = line.length - line.trimStart().length;
        const enclosing = stack.filter((heading) => heading.indent < indent);
        const owner = enclosing[enclosing.length - 1];
        if (!owner) continue;
        const module = enclosing.find((heading) => heading.kind === 'module');
        const label = `${owner.kind} ${module && module !== owner ? `${module.name}.` : ''}${owner.name}`;
        if (!found.includes(label)) found.push(label);
    }

    return found;
};
