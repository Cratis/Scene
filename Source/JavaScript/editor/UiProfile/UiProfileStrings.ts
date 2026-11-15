// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutMode } from '@cratis/scene.blueprint.default';
import { PackageGroupId } from './PackageGroupId';
import { PackageInclusion } from './PackageInclusion';
import { ProfileBlockerKind } from './ProfileBlockerKind';
import type { TemplatePickerLabels } from '../TemplatePicker/TemplatePickerLabels';
import type { SampleDataPickerLabels } from '../SampleData/SampleDataPickerLabels';
import type { BlueprintGalleryStrings } from '../BlueprintGallery/BlueprintGalleryStrings';

/** Labels for one group of packages. */
export interface PackageGroupStrings {
    /** The group's heading. */
    title: string;

    /** One line saying what the group contributes. */
    description: string;

    /** The action that opens the group's catalog. */
    browse: string;

    /** Shown when nothing in the group is chosen. */
    none: string;
}

/**
 * Every label the UI Profile workspace shows.
 *
 * Messages that name things use `{subject}`, `{from}`, `{to}` and `{because}` placeholders, replaced by
 * `formatMessage`. It is a prop rather than an import because this package has no localization of its own:
 * the host owns the resource file, and declaring the shape here makes a missing label a compile error in
 * the host instead of an `undefined` on screen.
 */
export interface UiProfileStrings {
    /** The page title. */
    title: string;

    /** The plain-language explanation under the title. */
    explanation: string;

    /** The header's application context line. */
    context: string;

    /** The status chip. */
    status: {
        applied: string;
        draft: string;
        neverApplied: string;
        loading: string;
        saving: string;
    };

    /** Buttons and links. */
    actions: {
        packagesAndResolution: string;
        browseBlueprints: string;
        review: string;
        discard: string;
        apply: string;
        keepEditing: string;
        close: string;
        back: string;
        done: string;
        retry: string;
        templateDetails: string;
    };


    /** The preview, its controls and gallery. */
    preview: {
        heading: string;
        fixtureLabel: string;
        fixtureHint: string;
        desktop: string;
        mobile: string;
        deviceGroup: string;
        navigation: string;
        navigationModes: Record<LayoutMode, string>;
        appearance: string;
        light: string;
        dark: string;
        theme: string;
        accent: string;
        accentUnsupported: string;
        accentInvalid: string;
        resetAccent: string;
        gallery: string;
        noScreen: string;
        noTemplates: string;
        controlsLabel: string;
        defaultTemplate: string;
        noDefaultTemplate: string;
        applicationTemplate: string;
        unavailableTemplate: string;
    };

    /** The labels of the blueprint gallery the header opens. */
    blueprintGallery: BlueprintGalleryStrings;

    /** The labels of the template picker, which chooses the default screen template. */
    templatePicker: TemplatePickerLabels;

    /** The sample data: chosen once here for the whole application, and the own packs and mappings that go with it. */
    sampleData: {
        picker: SampleDataPickerLabels;
        toolbarLabel: string;
        manage: string;
        heading: string;
        intro: string;
        myDataSets: string;
        noDataSets: string;
        remove: string;
        removeConfirm: string;
        newDataSet: string;
        title: string;
        locale: string;
        shape: string;
        shapeHint: string;
        format: string;
        json: string;
        csv: string;
        paste: string;
        loadFile: string;
        save: string;
        cancel: string;
        saveFailed: string;
        mappings: string;
        mappingsIntro: string;
        mappingsEmpty: string;
        mappingsBlueprint: string;
        shapeColumn: string;
        readModelColumn: string;
        matchesByName: string;
        notMapped: string;
        chooseReadModel: string;
        bindings: string;
        bindingsIntro: string;
        packColumn: string;
        notBound: string;
        bindingStale: string;
        bindingNotIdentifier: string;
        problems: string;
    };


    /** The Packages section. */
    packages: {
        groups: Record<PackageGroupId, PackageGroupStrings>;
        allPackages: string;
        catalogTitle: string;
        emptyCatalog: string;
        version: string;
        license: string;
        inclusion: Record<PackageInclusion, string>;
        requiredBy: string;
        add: string;
        remove: string;
        removeBlocked: string;
        stillIncluded: string;
        useShell: string;
        activeShell: string;
        addTemplates: string;
        removeTemplates: string;
        shellNeedsLayout: string;
        noLayout: string;
        shellCannotBeTemplates: string;
        editFailed: string;
    };




    /** Why a draft cannot be applied, per blocker kind. */
    blockers: Record<ProfileBlockerKind, string>;



}
