// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { collectIconUsages, createDescriptorCatalog } from '@cratis/scene.engine';
import { SceneDocument } from '@cratis/scene.model';
import { primeReactPackage } from '../primeReactPackage';
import { sceneComponent } from '../storyElements';

const reference = { library: '@fortawesome/free-solid', key: 'check' };

/** A document with one screen holding the given components; icon collection only scans for components. */
function documentWith(...components: ReturnType<typeof sceneComponent>[]): SceneDocument {
    return {
        layouts: [], screenTemplates: [], dialogTemplates: [], instanceContributions: [],
        screens: [{ name: 'Review', content: { main: components } }],
    } as unknown as SceneDocument;
}

describe('when collecting the icons of legacy controls', () => {
    const catalog = createDescriptorCatalog(primeReactPackage.descriptors);

    it('should track the empty state icon, so removing its library is reported', () => {
        const checkbox = sceneComponent('review', 'multiStateCheckbox', { emptyIcon: reference, options: ['A'] });
        collectIconUsages(documentWith(checkbox), catalog).map(usage => [usage.value, usage.location])
            .should.deep.equal([[reference, 'Review:review:emptyIcon']]);
    });

    // Icons nested inside the free-form JSON of `options` and `icons` are not found by the icon tooling,
    // which reads Icon properties and the icon fields of collection items. This records that limit, so a
    // change that starts tracking them is a deliberate one.
    it('should not track icons nested in the JSON options and icons', () => {
        const checkbox = sceneComponent('review', 'multiStateCheckbox', {
            options: [{ label: 'A', value: 'a', icon: reference }], icons: [reference],
        });
        collectIconUsages(documentWith(checkbox), catalog).should.deep.equal([]);
    });

    it('should find no icons in a chart', () => {
        collectIconUsages(documentWith(sceneComponent('sales', 'chart', { data: { datasets: [{ data: [1] }] } })), catalog).should.deep.equal([]);
    });
});
