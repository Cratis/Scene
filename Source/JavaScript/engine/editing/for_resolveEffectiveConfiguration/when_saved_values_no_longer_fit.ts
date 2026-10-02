// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, EditingScopeKind, ExposedProperty } from '@cratis/scene.model';
import { createExposedDocument } from '../given/a_scene_document';
import { codes, items, resolve, scalar, valueOf } from './given/resolution';

describe('when saved values no longer fit', () => {
    it('should preserve values when the exposure is removed, and use them again when it returns', () => {
        const document = createExposedDocument();
        document.instanceContributions.push(scalar('template:Feature', 'title', 'Billing'));
        const exposure = document.exposures[0].properties.splice(1, 1)[0] as ExposedProperty;
        const saved = JSON.stringify(document.instanceContributions);

        const without = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');
        valueOf(without, 'navbar', 'title')?.should.equal(undefined);
        codes(without).should.deep.equal([DiagnosticCode.ContributionNotExposed]);
        JSON.stringify(document.instanceContributions).should.equal(saved);

        document.exposures[0].properties.push(exposure);
        (valueOf(resolve(document, EditingScopeKind.ScreenTemplate, 'Feature'), 'navbar', 'title')!.value as string).should.equal('Billing');
    });

    it('should ignore a value whose type changed and keep it', () => {
        const document = createExposedDocument();
        document.instanceContributions.push(scalar('template:Feature', 'title', 42));
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

        (valueOf(configuration, 'navbar', 'title')!.value as string).should.equal('Menu');
        codes(configuration).should.deep.equal([DiagnosticCode.ContributionTypeMismatch]);
        document.instanceContributions[0].value!.should.equal(42);
    });

    it('should ignore an item field whose type changed', () => {
        const document = createExposedDocument();
        document.instanceContributions.push(items('template:Feature', { id: 'x', values: { label: 'X', icon: 'not-an-icon-reference' } }));
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

        valueOf(configuration, 'navbar', 'items')!.items![1].values.should.deep.equal({ label: 'X' });
        codes(configuration).should.deep.equal([DiagnosticCode.ContributionTypeMismatch]);
    });

    it('should drop an item field the collection no longer has', () => {
        const document = createExposedDocument();
        document.instanceContributions.push(items('template:Feature', { id: 'x', values: { label: 'X', badge: 3 } }));
        const configuration = resolve(document, EditingScopeKind.ScreenTemplate, 'Feature');

        codes(configuration).should.deep.equal([DiagnosticCode.ContributionOperationNotPermitted]);
    });

    it('should report values saved for a component that is gone', () => {
        const document = createExposedDocument();
        document.instanceContributions.push(scalar('template:Feature', 'title', 'Ghost', 'removed'));
        codes(resolve(document, EditingScopeKind.ScreenTemplate, 'Feature')).should.deep.equal([DiagnosticCode.ContributionTargetMissing]);
    });

    it('should report an exposure of a component that is gone', () => {
        const document = createExposedDocument();
        document.exposures[0].properties.push({ component: 'removed', path: 'title' });
        codes(resolve(document, EditingScopeKind.ScreenTemplate, 'Feature')).should.deep.equal([DiagnosticCode.ExposureTargetMissing]);
    });

    it('should report an exposure of a property the component no longer has', () => {
        const document = createExposedDocument();
        document.exposures[0].properties.push({ component: 'navbar', path: 'oldProperty' });
        codes(resolve(document, EditingScopeKind.ScreenTemplate, 'Feature')).should.deep.equal([DiagnosticCode.ExposureTargetMissing]);
    });

    it('should report a component nothing describes any more', () => {
        const document = createExposedDocument();
        document.screenTemplates[0].content!.chrome[0] = { ...document.screenTemplates[0].content!.chrome[0], componentName: 'test:unknown' } as never;
        document.instanceContributions.push(scalar('template:Feature', 'title', 'Billing'));
        codes(resolve(document, EditingScopeKind.ScreenTemplate, 'Feature')).should.deep.equal([
            DiagnosticCode.MissingComponentDescriptor, DiagnosticCode.MissingComponentDescriptor, DiagnosticCode.MissingComponentDescriptor,
        ]);
    });

    it('should not report contributions that belong to another chain', () => {
        const document = createExposedDocument();
        document.instanceContributions.push(scalar('screen:Customers', 'title', 'Elsewhere'));
        resolve(document, EditingScopeKind.ScreenTemplate, 'Feature').diagnostics.should.be.empty;
    });
});
