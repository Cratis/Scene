// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, ValueSource } from '@cratis/scene.model';
import { createExposedDocument } from '../given/a_scene_document';
import { items, resolve, scalar, valueOf } from './given/resolution';

describe('when an instance contributes', () => {
    const document = createExposedDocument();
    document.instanceContributions.push(
        scalar('template:Feature', 'title', 'Billing'),
        items('template:Feature', { id: 'reports', values: { label: 'Reports', icon: { library: 'lucide', key: 'chart' } } }),
    );
    const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

    it('should apply a scalar value and say where it came from', () => {
        const title = valueOf(configuration, 'navbar', 'title')!;
        (title.value as string).should.equal('Billing');
        title.source.should.equal(ValueSource.Instance);
        title.contributedBy!.should.equal('template:Feature');
    });

    it('should remember what resetting would give back', () => {
        (valueOf(configuration, 'navbar', 'title')!.inheritedValue as string).should.equal('Menu');
    });

    it('should append contributed items after the owner\'s own', () => {
        valueOf(configuration, 'navbar', 'items')!.items!.map(item => [item.id, item.fixed, item.origin])
            .should.deep.equal([['home', true, 'owner'], ['reports', false, 'template:Feature']]);
    });

    it('should flatten items into the property bag a renderer reads', () => {
        (configuration.components[0].properties.items as unknown[]).should.deep.equal([
            { id: 'home', label: 'Home', destination: { screen: 'Home' } },
            { id: 'reports', label: 'Reports', icon: { library: 'lucide', key: 'chart' } },
        ]);
    });

    it('should keep the inherited value free of contributions', () => {
        (valueOf(configuration, 'navbar', 'items')!.inheritedValue as unknown[]).should.have.length(1);
    });

    it('should not touch the document', () => {
        document.screenTemplates[0].content!.chrome[0].properties.should.deep.equal({ items: [{ id: 'home', label: 'Home', destination: { screen: 'Home' } }] });
    });
});
