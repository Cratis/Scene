// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeHost, ScenePackageBundle, resolveDesignTimeHost } from '@cratis/scene.react';
import { inspectionsDesignTimePackage } from '../../designTime';
import { generateChecklistItemsActionId, inspectionChecklistDescriptor } from '../../inspectionsDescriptors';
import { aChecklist, aDesignTimeContext, designTimeConfiguration } from '../given/a_design_time_host';

describe('when loading through the design-time host and the contract version is incompatible', () => {
    const futurePackage: ScenePackageBundle = {
        ...inspectionsDesignTimePackage,
        manifest: { ...inspectionsDesignTimePackage.manifest, designTime: { ...inspectionsDesignTimePackage.manifest.designTime!, contractVersion: '2.0' } },
    };
    let host: DesignTimeHost;

    beforeEach(() => (host = resolveDesignTimeHost(designTimeConfiguration([futurePackage]))));

    it('should keep the runtime package approved', () => host.host.blocked.should.be.false);

    it('should report the incompatible contract', () =>
        host.diagnostics.should.deep.equal(["Package 'Acme.Inspections' targets design-time contract 2.0, but this host implements 1.0; none of its contributions are loaded"]));

    it('should fall back to the generic designer with the reason', () => {
        const resolution = host.designer(inspectionChecklistDescriptor);
        (resolution.contribution === undefined).should.be.true;
        resolution.diagnostic!.should.equal(
            "'Acme.Inspections:inspectionChecklist' asks for the designer 'checklistDesigner', but design-time contributions from package 'Acme.Inspections' are not loaded; the host uses its generic designer",
        );
    });

    it('should show Generate fields disabled and refuse to run it', () => {
        const { context, submittedActions } = aDesignTimeContext(aChecklist({ command: 'RecordInspection' }), [futurePackage]);
        host.actions(inspectionChecklistDescriptor, context).map(action => [action.visible, action.enabled]).should.deep.equal([[true, false]]);
        host.runAction(inspectionChecklistDescriptor, generateChecklistItemsActionId, context).submitted.should.be.false;
        submittedActions.should.be.empty;
    });
});
