// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor } from '@cratis/scene.model';
import { DesignTimeHost, ScenePackageBundle, resolveDesignTimeHost } from '@cratis/scene.react';
import { inspectionsDesignTime, inspectionsDesignTimePackage } from '../../designTime';
import { inspectionChecklistDescriptor } from '../../inspectionsDescriptors';
import { designTimeConfiguration } from '../given/a_design_time_host';

describe('when loading through the design-time host and descriptors ask for unknown extensions', () => {
    const descriptor: ComponentDescriptor = {
        ...inspectionChecklistDescriptor,
        previewKind: 'heatmapPreview',
        editorKind: 'Other.Package:floorPlanDesigner',
        properties: [{ ...inspectionChecklistDescriptor.properties[0], editorKind: 'richText' }],
        actions: [{ id: 'Acme.Inspections.checklist.exportPdf', label: 'Export PDF' }],
    };
    const bundle: ScenePackageBundle = {
        ...inspectionsDesignTimePackage,
        descriptors: [descriptor],
        designTime: { ...inspectionsDesignTime, propertyDisplays: {}, designers: { ...inspectionsDesignTime.designers, undeclaredDesigner: inspectionsDesignTime.designers!.checklistDesigner } },
    };
    let host: DesignTimeHost;

    beforeEach(() => (host = resolveDesignTimeHost(designTimeConfiguration([bundle]))));

    it('should report declared extensions the bundle lacks and provided ones the manifest does not declare', () =>
        host.diagnostics.should.deep.equal([
            "Package 'Acme.Inspections' provides the designer 'undeclaredDesigner', which its manifest does not declare; it is not loaded",
            "Package 'Acme.Inspections' declares the property display 'severityBadge', but its design-time bundle does not provide it",
        ]));

    it('should report every unknown extension the descriptors ask for', () =>
        host.diagnoseDescriptors().should.deep.equal([
            "'Acme.Inspections:inspectionChecklist' asks for the preview 'heatmapPreview', which package 'Acme.Inspections' does not provide; the host uses its generic preview",
            "'Acme.Inspections:inspectionChecklist' asks for the designer 'Other.Package:floorPlanDesigner', but package 'Other.Package' is not approved by this host; the host uses its generic designer",
            "'Acme.Inspections:inspectionChecklist' asks for the property display 'severityBadge', which package 'Acme.Inspections' does not provide; the host uses its generic property display",
            "'Acme.Inspections:inspectionChecklist' asks for the property editor 'richText', which package 'Acme.Inspections' does not provide; the host uses its generic property editor",
            "'Acme.Inspections:inspectionChecklist' asks for the action 'Acme.Inspections.checklist.exportPdf', which package 'Acme.Inspections' does not provide; the host shows it disabled",
        ]));

    it('should not load an undeclared contribution', () =>
        (host.designer({ ...descriptor, editorKind: 'undeclaredDesigner' }).contribution === undefined).should.be.true);
});
