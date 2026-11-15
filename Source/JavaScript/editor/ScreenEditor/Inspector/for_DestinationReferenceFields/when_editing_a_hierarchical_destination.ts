// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React, { type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { DestinationReference } from '@cratis/scene.model';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import { DestinationReferenceFields } from '../DestinationReferenceFields';

const strings = defaultScreenEditorStrings.properties.destination;
const destinations = [{ id: 'Orders', label: 'Orders', group: 'Sales' }];
const props = (onChange: (destination: DestinationReference | undefined) => void = () => undefined) => ({
    id: 'orders-destination',
    label: 'Orders',
    value: { screen: 'Orders', route: '/orders/:id', slot: 'details', dialog: 'OrderDialog' },
    destinations,
    slots: ['details', 'summary'],
    dialogTemplates: ['OrderDialog'],
    disabled: false,
    strings,
    onChange,
});

describe('when editing a hierarchical destination', () => {
    let markup: string;

    beforeEach(() => {
        markup = renderToStaticMarkup(React.createElement(DestinationReferenceFields, props()));
    });

    it('should draw the screen route slot and dialog controls', () => {
        markup.should.contain(strings.screen);
        markup.should.contain(strings.route);
        markup.should.contain(strings.slot);
        markup.should.contain(strings.dialog);
    });

    it('should offer the current screen, slot and dialog choices', () => {
        markup.should.contain('Sales / Orders');
        markup.should.contain('value="details"');
        markup.should.contain('value="OrderDialog"');
    });

    it('should preserve the other destination metadata when the route changes through the control', () => {
        let changed: DestinationReference | undefined;
        const route = controlFor(DestinationReferenceFields(props(destination => { changed = destination; })) as ReactElement<{ children: ReactNode }>, strings.route);
        route.props.onChange({ target: { value: '/customers/:id' } });
        if (!changed) throw new Error('Destination was not changed');
        changed.should.deep.equal({ screen: 'Orders', route: '/customers/:id', slot: 'details', dialog: 'OrderDialog' });
    });
});

function controlFor(element: ReactElement<{ children: ReactNode }>, label: string): ReactElement<{ onChange: (event: { target: { value: string } }) => void }> {
    const labelElement = findLabel(element, label);
    const children = asArray(labelElement.props.children);
    const control = children.find(child => isElement(child) && (child.type === 'input' || child.type === 'select'));
    if (!isElement<{ onChange: (event: { target: { value: string } }) => void }>(control)) throw new Error(`Missing control for ${label}`);
    return control;
}

function findLabel(element: ReactElement<{ children: ReactNode }>, label: string): ReactElement<{ children: ReactNode }> {
    const found = tryFindLabel(element, label);
    if (!found) throw new Error(`Missing label ${label}`);
    return found;
}

function tryFindLabel(element: ReactElement<{ children: ReactNode }>, label: string): ReactElement<{ children: ReactNode }> | undefined {
    const children = asArray(element.props.children);
    for (const child of children) {
        if (!isElement<{ children: ReactNode }>(child)) continue;
        if (child.type === 'label' && asArray(child.props.children).some(grandchild => isElement<{ children: ReactNode }>(grandchild) && grandchild.props.children === label)) return child;
        const found = tryFindLabel(child as ReactElement<{ children: ReactNode }>, label);
        if (found) return found;
    }
    return undefined;
}

function asArray(children: ReactNode): ReactNode[] {
    return Array.isArray(children) ? children : [children];
}

function isElement<TProps = { children?: ReactNode }>(value: ReactNode): value is ReactElement<TProps> {
    return React.isValidElement(value);
}
