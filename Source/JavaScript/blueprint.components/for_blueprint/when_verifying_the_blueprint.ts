// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultBlueprint } from '@cratis/scene.blueprint.default';
import { componentsBlueprint } from '../componentsBlueprint';
import { asLibrary, blueprintOnDisk, catalogOnDisk, describedCatalog, verifyBlueprintPackage } from './given/the_blueprint_on_disk';

// The components blueprint layers Arc-bound pages on the default blueprint's shell. It provides foundation-style templates and no business
// domain of its own, so the domain rules do not apply - but it is held to the rest of the definition of done, with the default blueprint
// as the library its templates are placed into.
describe('when verifying the components blueprint', () => {
    const source = blueprintOnDisk(componentsBlueprint);
    const library = asLibrary(defaultBlueprint);

    it('should be done', () => verifyBlueprintPackage(source, library).should.deep.equal([]));

    it('should not be listed as a domain blueprint', () => describedCatalog(source).blueprints.should.deep.equal([]));

    it('should ship no catalog of its own', () => (catalogOnDisk(describedCatalog(source)) === undefined).should.equal(true));
});
