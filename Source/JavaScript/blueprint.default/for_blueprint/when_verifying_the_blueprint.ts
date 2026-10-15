// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultBlueprint } from '../defaultBlueprint';
import { asLibrary, blueprintOnDisk, catalogOnDisk, describedCatalog, verifyBlueprintPackage } from './given/the_blueprint_on_disk';

// The default blueprint provides the foundation layouts and templates every domain blueprint builds on, and no business domain: it
// declares no blueprint metadata, so the domain rules do not apply - but its manifest, its templates and their placement are held to
// the same definition of done as everyone else's (spec Part B 6).
describe('when verifying the default blueprint', () => {
    const source = blueprintOnDisk(defaultBlueprint);

    it('should be done', () => verifyBlueprintPackage(source, asLibrary()).should.deep.equal([]));

    it('should not be listed as a domain blueprint', () => describedCatalog(source).blueprints.should.deep.equal([]));

    it('should ship no catalog of its own', () => (catalogOnDisk(describedCatalog(source)) === undefined).should.equal(true));
});
