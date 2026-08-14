// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { render, screen } from '@testing-library/react';
import { Control, ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { SceneElementView } from '../SceneElementView';
import { coreComponents } from '../core';

function control(id: string): Control {
    return {
        id,
        name: id,
        properties: {},
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
        borderThickness: { left: 0, top: 0, right: 0, bottom: 0 },
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        tabIndex: 0,
    };
}

describe('when rendering a tree', () => {
    describe('and every component resolves', () => {
        const text: ExternalComponent = { ...control('greeting'), componentName: 'core:text', properties: { text: 'Hello Scene' }, slots: {} };
        const card: ExternalComponent = { ...control('card'), componentName: 'core:card', slots: { content: [text] } };

        beforeEach(() => {
            render(<SceneElementView element={card} registry={coreComponents} resolveBinding={() => undefined} />);
        });

        it('should render the nested core:text content', () => expect(screen.getByText('Hello Scene')).to.exist);
    });

    describe('and a component does not resolve', () => {
        const missing: ExternalComponent = { ...control('missing'), componentName: 'vendor:fancy-widget', slots: {} };

        beforeEach(() => {
            render(<SceneElementView element={missing} registry={coreComponents} resolveBinding={() => undefined} />);
        });

        it('should render a visible unresolved-component placeholder', () =>
            expect(screen.getByText('Unresolved component: vendor:fancy-widget')).to.exist);
    });
});
