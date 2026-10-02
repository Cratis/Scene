// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, ValueSource } from '@cratis/scene.model';
import { createExposedDocument } from '../given/a_scene_document';
import { resolve, valueOf } from './given/resolution';

describe('when nothing is contributed', () => {
    const configuration = resolve(createExposedDocument(), EditingScopeKind.ScreenTemplate, 'Feature');

    it('should resolve the exposed components', () => {
        configuration.components.map(component => component.component).should.deep.equal(['navbar']);
        configuration.components[0].owner.should.equal('Module');
    });

    it('should give the owner\'s value a local source', () => {
        const items = valueOf(configuration, 'navbar', 'items')!;
        items.source.should.equal(ValueSource.Local);
        items.items!.map(item => [item.id, item.fixed, item.origin]).should.deep.equal([['home', true, 'owner']]);
    });

    it('should fall back to the descriptor default', () => {
        const title = valueOf(configuration, 'navbar', 'title')!;
        (title.value as string).should.equal('Menu');
        title.source.should.equal(ValueSource.Default);
    });

    it('should put the full property bag where a renderer reads it', () => {
        configuration.components[0].properties.should.deep.equal({
            items: [{ id: 'home', label: 'Home', destination: { screen: 'Home' } }],
            title: 'Menu',
        });
    });

    it('should report nothing', () => {
        configuration.diagnostics.should.be.empty;
    });

    it('should leave components nothing is exposed on out of the result', () => {
        configuration.components.some(component => component.component === 'invoiceTable').should.be.false;
    });
});
