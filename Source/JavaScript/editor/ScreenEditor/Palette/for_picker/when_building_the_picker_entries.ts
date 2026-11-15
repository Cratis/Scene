// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory, type ComponentDescriptor } from '@cratis/scene.model';
import { buildPickerEntries, uncategorised } from '../componentPickerModel';

const described: ComponentDescriptor[] = [
    { component: 'Acme:dataTable', displayName: 'Data table', category: ComponentCategory.DataDisplay, keywords: ['grid'], badge: 'Tb', properties: [] },
    { component: 'Acme:topbar', displayName: 'Topbar', category: ComponentCategory.Navigation, properties: [] },
];
const entries = buildPickerEntries(
    [{ package: 'Acme', components: ['dataTable', 'topbar', 'mystery', 'column'], descriptors: described }],
    [{ item: 'Stack', label: 'Stack' }],
    { Acme: 'Acme blocks' });
const byKey = (key: string) => entries.find(entry => entry.key === key)!;

describe('when building the picker entries from descriptors', () => {
    it('should list layout containers and components, leaving out structural components', () => entries.map(entry => entry.key).should.deep.equal(['layout:Stack', 'Acme:dataTable', 'Acme:topbar', 'Acme:mystery']));
    it('should take the label, category and keywords from the descriptor', () => {
        byKey('Acme:dataTable').label.should.equal('Data table');
        byKey('Acme:dataTable').category.should.equal('Data display');
        byKey('Acme:dataTable').keywords.should.deep.equal(['grid']);
    });
    it('should take an explicit badge and derive the others', () => {
        byKey('Acme:dataTable').badge.should.equal('Tb');
        byKey('Acme:topbar').badge.should.equal('Tp');
    });
    it('should show a component nothing describes, by its readable name, in a group of its own', () => {
        byKey('Acme:mystery').label.should.equal('Mystery');
        byKey('Acme:mystery').category.should.equal(uncategorised);
    });
    it('should list layout containers under Layout', () => byKey('layout:Stack').category.should.equal('Layout'));
    it('should show the package under the name the host gave it', () => byKey('Acme:topbar').packageTitle!.should.equal('Acme blocks'));
    it('should hand back what adding the entry means', () => {
        byKey('Acme:topbar').payload.should.deep.equal({ kind: 'component', componentName: 'topbar', package: 'Acme' });
        byKey('layout:Stack').payload.should.deep.equal({ kind: 'layout', item: 'Stack' });
    });
});
