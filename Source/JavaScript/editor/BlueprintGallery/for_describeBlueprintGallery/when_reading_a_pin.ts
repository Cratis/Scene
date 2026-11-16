// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { referenceUseOfPin } from '../referenceUseOfPin';

describe('when reading the version a reference was chosen from', () => {
    it('should read the base of a caret range', () => referenceUseOfPin('Cratis.Blueprint.Crm', '^4.50.0')!.should.deep.equal({ package: 'Cratis.Blueprint.Crm', version: '4.50.0', pin: '^4.50.0' }));
    it('should read the base of a tilde range', () => referenceUseOfPin('B', '~1.2.3')!.version.should.equal('1.2.3'));
    it('should read an exact version', () => referenceUseOfPin('B', '2.0.0')!.version.should.equal('2.0.0'));
    it('should read a lower bound', () => referenceUseOfPin('B', '>=1.0.0')!.version.should.equal('1.0.0'));
    it('should say nothing of a range with no single base', () => (referenceUseOfPin('B', '>=1.0.0 <3.0.0') === undefined).should.be.true);
    it('should say nothing of a reference with no range', () => (referenceUseOfPin('B', undefined) === undefined).should.be.true);
});
