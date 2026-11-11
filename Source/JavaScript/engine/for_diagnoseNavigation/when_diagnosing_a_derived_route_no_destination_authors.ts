// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationDiagnosticCode, diagnoseNavigation } from '../index';

describe('when diagnosing a derived route no destination authors', () => {
    const diagnostics = diagnoseNavigation(
        { entries: [{ id: 'one', destination: { screen: 'A' } }, { id: 'two', destination: { screen: 'B' } }], screens: [] },
        () => 'shared');

    it('should show the derived route when two destinations that open different targets claim it', () =>
        diagnostics
            .filter(diagnostic => diagnostic.code === NavigationDiagnosticCode.DuplicateRoute)
            .map(diagnostic => diagnostic.message)
            .should.deep.equal(['Route \'shared\' is used by destinations \'one\' and \'two\', which open different targets.']));
});
