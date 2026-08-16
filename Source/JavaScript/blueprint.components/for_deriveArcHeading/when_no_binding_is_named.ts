// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingKind } from '@cratis/scene.components';
import { deriveArcHeading } from '../header';

/**
 * The third state, and the one that is easiest to conflate with the second. A template that names nothing
 * is not broken - the schema editor page genuinely has no query behind it - so this reads as a statement
 * rather than as a problem to fix.
 */
describe('when no binding is named', () => {
    const heading = deriveArcHeading({ title: 'InvoiceRegistered' }, {}, BindingKind.Query);

    it('should use the title the template gave it', () => {
        heading.title.should.equal('InvoiceRegistered');
    });

    it('should build a trail of just the title when no section was given', () => {
        heading.trail.should.deep.equal(['InvoiceRegistered']);
    });

    it('should report that it is not bound', () => {
        heading.isBound.should.be.false;
    });

    it('should state the absence plainly rather than naming a binding nobody asked for', () => {
        heading.bindingLabel.should.equal('No binding');
    });

    it('should carry no binding name', () => {
        (heading.bindingName === undefined).should.be.true;
    });

    describe('and the template gave no title either', () => {
        const untitled = deriveArcHeading({}, {}, BindingKind.Query);

        it('should fall back to something readable rather than an empty heading', () => {
            untitled.title.should.equal('Untitled page');
        });
    });
});
