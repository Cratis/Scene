// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

// What a control received as props: handlers a spec calls as the user would, and the attributes it reads.
export interface Props {
    [name: string]: unknown;
    onChange: (event: { target: { value: string; checked?: boolean } }) => void;
    onClick: () => void;
    disabled: boolean;
    value: unknown;
    type: string;
}

export interface Node {
    type: string;
    props: Props;
    children: Node[];
    text: string;
}

// Draws a tree of function components without a DOM: every component is called with its props and replaced by what it returns, so a
// spec can find a control by what it is and invoke the handler a user would trigger. Only for components that use no hooks.
export function expand(element: ReactNode): Node[] {
    if (element === null || element === undefined || typeof element === 'boolean') return [];
    if (typeof element === 'string' || typeof element === 'number') return [{ type: '#text', props: {} as Props, children: [], text: String(element) }];
    if (Array.isArray(element)) return element.flatMap(expand);
    if (!isValidElement(element)) return [];

    const candidate = element as ReactElement<{ children?: ReactNode } & Record<string, unknown>>;
    if (typeof candidate.type === 'function') return expand((candidate.type as (props: unknown) => ReactNode)(candidate.props));
    const children = Children.toArray(candidate.props.children).flatMap(expand);
    return [{ type: String(candidate.type), props: candidate.props as unknown as Props, children, text: children.map(child => child.text).join('') }];
}

export const find = (nodes: readonly Node[], predicate: (node: Node) => boolean): Node[] =>
    nodes.flatMap(node => [...(predicate(node) ? [node] : []), ...find(node.children, predicate)]);

export const byLabel = (nodes: readonly Node[], label: string): Node => {
    const found = find(nodes, node => node.props['aria-label'] === label);
    if (found.length !== 1) throw new Error(`Expected one control labelled '${label}' but found ${found.length}`);
    return found[0];
};

// The control inside the label whose caption is the text.
export const fieldOf = (nodes: readonly Node[], caption: string): Node => {
    const labels = find(nodes, node => node.type === 'label' && node.children[0]?.text === caption);
    if (labels.length !== 1) throw new Error(`Expected one field captioned '${caption}' but found ${labels.length}`);
    return find(labels[0].children, node => node.type === 'input' || node.type === 'select')[0];
};

export const buttonsOf = (nodes: readonly Node[]): string[] => find(nodes, node => node.type === 'button').map(button => button.text);
