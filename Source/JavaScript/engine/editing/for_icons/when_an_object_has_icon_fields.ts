// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, DiagnosticSeverity, PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';
import { alphaName, betaName, defaultSources, openCatalog } from '../../icons/for_iconFixtures/iconFixtures';
import { iconProblemsOfProperty } from '../iconDiagnostics';

const descriptor: PropertyDescriptor = {
    path: 'empty', label: 'Empty state', group: 'Content', valueType: PropertyValueType.Object,
    properties: [
        { path: 'caption', label: 'Caption', group: 'Content', valueType: PropertyValueType.String },
        { path: 'icon', label: 'Icon', group: 'Content', valueType: PropertyValueType.Icon },
    ],
};

describe('when an object has icon fields', () => {
    it('should report an icon whose library is not in the profile, with the field in the message', async () => {
        const icons = openCatalog([betaName], defaultSources());
        await icons.load();
        const problems = iconProblemsOfProperty(icons, descriptor, { caption: 'None', icon: { library: alphaName, key: 'trash' } }, DiagnosticSeverity.Warning, { nodeId: 'n' });
        problems.map(problem => problem.code).should.deep.equal([DiagnosticCode.MissingIconLibrary]);
        problems[0].message.should.contain('Icon');
    });

    it('should have nothing to report for an object without icons set', async () => {
        const icons = openCatalog([betaName], defaultSources());
        await icons.load();
        iconProblemsOfProperty(icons, descriptor, { caption: 'None' }, DiagnosticSeverity.Warning, { nodeId: 'n' }).should.be.empty;
    });
});
