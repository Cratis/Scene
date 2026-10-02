// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isIconReference } from '../iconReferences';

describe('when checking whether a value is a reference', () => {
    it('should accept a library and key', () => isIconReference({ library: 'acme', key: 'home' }).should.be.true);
    it('should accept a reference with a variant', () => isIconReference({ library: 'acme', key: 'home', variant: 'solid' }).should.be.true);
    it('should reject a legacy icon class string', () => isIconReference('pi pi-home').should.be.false);
    it('should reject null', () => isIconReference(null).should.be.false);
    it('should reject a missing key', () => isIconReference({ library: 'acme' }).should.be.false);
    it('should reject an empty variant', () => isIconReference({ library: 'acme', key: 'home', variant: '' }).should.be.false);
});
