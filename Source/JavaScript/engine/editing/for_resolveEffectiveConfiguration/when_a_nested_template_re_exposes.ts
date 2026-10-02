// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, ValueSource } from '@cratis/scene.model';
import { createReExposedDocument } from '../given/a_scene_document';
import { items, resolve, scalar, valueOf } from './given/resolution';

describe('when a nested template re-exposes', () => {
    const document = createReExposedDocument();
    document.instanceContributions.push(
        scalar('template:Feature', 'title', 'From the feature'),
        scalar('screen:Invoices', 'title', 'From the screen'),
        items('template:Feature', { id: 'feature-item', values: { label: 'Feature' } }),
        items('screen:Invoices', { id: 'screen-item', values: { label: 'Screen' } }),
    );
    const configuration = resolve(document, EditingScopeKind.Screen, 'Invoices');

    it('should let the innermost level win a scalar', () => {
        const title = valueOf(configuration, 'navbar', 'title')!;
        (title.value as string).should.equal('From the screen');
        title.source.should.equal(ValueSource.Instance);
        title.contributedBy!.should.equal('screen:Invoices');
    });

    it('should append items in nesting order, owner first', () => {
        valueOf(configuration, 'navbar', 'items')!.items!.map(item => item.id).should.deep.equal(['home', 'feature-item', 'screen-item']);
    });

    it('should resolve the same whatever order contributions were saved in', () => {
        const shuffled = createReExposedDocument();
        shuffled.instanceContributions.push(...[...document.instanceContributions].reverse());
        resolve(shuffled, EditingScopeKind.Screen, 'Invoices').should.deep.equal(configuration);
    });

    it('should resolve the same every time', () => {
        resolve(document, EditingScopeKind.Screen, 'Invoices').should.deep.equal(configuration);
    });
});
