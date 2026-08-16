// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingKind } from '@cratis/scene.components';
import { deriveArcHeading } from '../header';

describe('when the binding is not registered', () => {
    const heading = deriveArcHeading({ section: 'Billing' }, { name: 'RecordAdjustment' }, BindingKind.Command);

    it('should fall back to the binding name read as a sentence, so the page is legible before anyone writes a title', () => {
        heading.title.should.equal('Record adjustment');
    });

    it('should build the trail from the derived title', () => {
        heading.trail.should.deep.equal(['Billing', 'Record adjustment']);
    });

    it('should report that it is not bound', () => {
        heading.isBound.should.be.false;
    });

    it('should say which name a host has to register, which is the only actionable part', () => {
        heading.bindingLabel.should.equal('No command registered as RecordAdjustment');
    });
});
