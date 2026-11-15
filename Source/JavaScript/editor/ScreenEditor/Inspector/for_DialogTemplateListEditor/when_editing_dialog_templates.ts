// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React, { type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DialogTemplate } from '@cratis/scene.model';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import { DialogTemplateListEditor } from '../DialogTemplateListEditor';

const strings = defaultScreenEditorStrings.properties.dialogTemplates;
const templates: DialogTemplate[] = [
    { name: 'OrderDialog', slots: [{ name: 'content' }], displayName: 'Order details', description: 'Shows an order', behaviors: [] },
];

describe('when editing dialog templates', () => {
    let changed: DialogTemplate[] | undefined;
    let element: ReactElement<{ children: ReactNode }>;
    let markup: string;

    beforeEach(() => {
        changed = undefined;
        element = DialogTemplateListEditor({
            templates,
            referencedTemplates: new Set(['OrderDialog']),
            disabled: false,
            strings,
            onChange: next => { changed = next; },
        }) as ReactElement<{ children: ReactNode }>;
        markup = renderToStaticMarkup(element);
    });

    it('should draw dialog template fields through the authoring control', () => {
        markup.should.contain(strings.label);
        markup.should.contain(strings.name);
        markup.should.contain(strings.displayName);
        markup.should.contain(strings.description);
    });

    it('should block removing a dialog template that a destination uses', () => {
        markup.should.contain(strings.removeBlocked);
        markup.should.contain('disabled=""');
    });

    it('should update the display name without changing the dialog identity', () => {
        const displayName = inputFor(element, strings.displayName);
        displayName.props.onChange({ target: { value: 'Order summary' } });
        if (!changed) throw new Error('Dialog templates were not changed');
        changed[0].should.deep.include({ name: 'OrderDialog', displayName: 'Order summary', description: 'Shows an order' });
    });
});

function inputFor(element: ReactElement<{ children: ReactNode }>, label: string): ReactElement<{ onChange: (event: { target: { value: string } }) => void }> {
    const labelElement = findLabel(element, label);
    const control = asArray(labelElement.props.children).find(child => isElement(child) && child.type === 'input');
    if (!isElement<{ onChange: (event: { target: { value: string } }) => void }>(control)) throw new Error(`Missing input for ${label}`);
    return control;
}

function findLabel(element: ReactElement<{ children: ReactNode }>, label: string): ReactElement<{ children: ReactNode }> {
    const found = tryFindLabel(element, label);
    if (!found) throw new Error(`Missing label ${label}`);
    return found;
}

function tryFindLabel(element: ReactElement<{ children: ReactNode }>, label: string): ReactElement<{ children: ReactNode }> | undefined {
    for (const child of asArray(element.props.children)) {
        if (!isElement<{ children: ReactNode }>(child)) continue;
        if (child.type === 'label' && textOf(child.props.children) === label) return child;
        const found = tryFindLabel(child as ReactElement<{ children: ReactNode }>, label);
        if (found) return found;
    }
    return undefined;
}

function asArray(children: ReactNode): ReactNode[] {
    if (!Array.isArray(children)) return [children];
    return children.flatMap(child => asArray(child));
}

function textOf(children: ReactNode): string {
    return asArray(children).map(child => {
        if (typeof child === 'string') return child;
        if (isElement<{ children: ReactNode }>(child)) return textOf(child.props.children);
        return '';
    }).join('');
}

function isElement<TProps = { children?: ReactNode }>(value: ReactNode): value is ReactElement<TProps> {
    return React.isValidElement(value);
}
