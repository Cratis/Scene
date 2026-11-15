// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackageName, insertedComponentName } from '../insertedComponentName';

describe('when naming a component that is inserted', () => {
    it('should store a component with the package that offers it', () => insertedComponentName('button', 'PrimeReact').should.equal('PrimeReact:button'));
    it('should store the modeled command action as the core one', () => insertedComponentName('action', corePackageName).should.equal('core:action'));
    it('should keep an action another package offers with that package', () => insertedComponentName('action', 'PrimeReact').should.equal('PrimeReact:action'));
    it('should store the command form with its package', () => insertedComponentName('commandForm', 'Cratis.Components').should.equal('Cratis.Components:commandForm'));
    it('should keep a dotted component name whole', () => insertedComponentName('web.DataGrid', 'scene').should.equal('scene:web.DataGrid'));
    it('should not qualify a name twice', () => insertedComponentName('core:text', corePackageName).should.equal('core:text'));
});
