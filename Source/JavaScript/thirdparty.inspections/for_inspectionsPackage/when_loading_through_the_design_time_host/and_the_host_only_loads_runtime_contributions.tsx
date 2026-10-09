// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { PackageHostView, resolveDesignTimeHost } from '@cratis/scene.react';
import { inspectionsDesignTimePackage } from '../../designTime';
import { inspectionChecklistDescriptor } from '../../inspectionsDescriptors';
import { aChecklist, designTimeConfiguration } from '../given/a_design_time_host';

describe('when loading through the design-time host and the host only loads runtime contributions', () => {
    const configuration = designTimeConfiguration([inspectionsDesignTimePackage], false);
    const host = resolveDesignTimeHost(configuration);

    it('should approve the package for rendering', () => host.diagnostics.should.be.empty);

    it('should resolve no design-time contribution', () =>
        [host.preview(inspectionChecklistDescriptor), host.designer(inspectionChecklistDescriptor), host.propertyDisplay(inspectionChecklistDescriptor)]
            .every(resolution => resolution.contribution === undefined && resolution.diagnostic !== undefined).should.be.true);

    it('should render the runtime component through the public package host', () => {
        const { container } = render(<PackageHostView configuration={configuration} element={aChecklist({ title: 'Kitchen', items: [{ id: 'a', label: 'Fridge below 5°C', required: true }] })} />);
        container.querySelector('[data-acme-checklist="checklist"] legend')!.textContent!.should.equal('Kitchen');
        container.textContent!.should.contain('Fridge below 5°C');
    });
});
