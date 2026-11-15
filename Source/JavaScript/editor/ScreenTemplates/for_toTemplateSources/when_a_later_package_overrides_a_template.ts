// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { toTemplateSources } from '../toTemplateSources';

const manifest = (name: string) => ({ name, version: '1.0.0', kind: PackageKind.Blueprint, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] });
const template = (name: string, displayName: string) => ({ name, displayName, slots: [] });

describe('when a later package overrides a template of an earlier one', () => {
    const sources = toTemplateSources([
        { manifest: manifest('First'), screenTemplates: [template('Page', 'First page'), template('Own', 'Only in the first')] },
        { manifest: manifest('Second'), screenTemplates: [template('Page', 'Second page')], dialogTemplates: [template('Confirm', 'Second confirm')] },
    ]);

    it('should keep the template in the package listed last only', () => {
        sources.flatMap(source => source.screenTemplates ?? []).map(candidate => candidate.displayName).should.have.members(['Only in the first', 'Second page']);
    });

    it('should keep the packages in the order given', () => sources.map(source => source.manifest.name).should.deep.equal(['First', 'Second']));
    it('should carry the dialog templates too', () => sources[1].dialogTemplates!.map(candidate => candidate.name).should.deep.equal(['Confirm']));
});
