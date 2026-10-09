// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describeTemplateCatalog } from '@cratis/scene.engine';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { componentsBlueprint } from '../componentsBlueprint';

describe('when describing its template catalog', () => {
    const entries = describeTemplateCatalog([cratisComponentsPackage, defaultBlueprint, componentsBlueprint], '4.13.0')
        .filter(entry => entry.package === componentsBlueprint.manifest.name);
    const { manifest } = componentsBlueprint;

    it('should describe every template the manifest declares', () =>
        entries.map(entry => entry.name).should.deep.equal([...manifest.layouts, ...manifest.screenTemplates, ...manifest.dialogTemplates]));

    it('should find every template compatible with the shipped package versions', () =>
        entries.filter(entry => !entry.compatible).map(entry => entry.problems).should.deep.equal([]));

    it('should attribute and license every template', () =>
        entries.every(entry => entry.attribution?.author === 'Cratis' && entry.license === 'MIT' && entry.licenseUrl === manifest.licenseUrl).should.be.true);

    it('should report the missing package when the default blueprint is not available', () =>
        describeTemplateCatalog([cratisComponentsPackage, componentsBlueprint], '4.13.0')
            .every(entry => entry.problems.some(problem => problem.includes("'Cratis.Blueprint.Default', which is not available"))).should.be.true);
});
