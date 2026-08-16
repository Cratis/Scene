// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cratisComponentsPackageManifest } from '@cratis/scene.components';
import { BorrowedComponentName } from '../BorrowedComponentName';
import { CompositeName } from '../CompositeName';
import { primeReactComponentNames } from '../gallery';

/**
 * The names this blueprint writes into its templates belong to other packages, and this is the standing
 * check that they still exist there.
 *
 * The failure this prevents is quiet. A composite renamed upstream leaves every template that referenced it
 * rendering a dashed red box somewhere inside a page, and nothing in the box says which template wrote the
 * name. Checking the enum against the owning manifest turns that into a failed spec in this package.
 */
describe('when checking the names against the packages that declare them', () => {
    const declaredByTheLibrary = new Set(cratisComponentsPackageManifest.components);

    it('should have composite names to check', () => {
        Object.values(CompositeName).should.not.be.empty;
    });

    it('should reference only composites the component library declares', () => {
        Object.values(CompositeName)
            .filter(name => !declaredByTheLibrary.has(name))
            .should.be.empty;
    });

    it('should borrow only names PrimeReact declares', () => {
        Object.values(BorrowedComponentName)
            .filter(name => !primeReactComponentNames.includes(name))
            .should.be.empty;
    });

    it('should borrow nothing the component library already declares, since the library would win the bare name anyway', () => {
        Object.values(BorrowedComponentName)
            .filter(name => declaredByTheLibrary.has(name))
            .should.be.empty;
    });
});
