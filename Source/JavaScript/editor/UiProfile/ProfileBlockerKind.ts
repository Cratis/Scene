// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Why a draft cannot be applied. */
export enum ProfileBlockerKind {
    MissingDependency = 'missingDependency',
    VersionConflict = 'versionConflict',
    DependencyCycle = 'dependencyCycle',
    NoShell = 'noShell',
    ShellSuppliesNoLayout = 'shellSuppliesNoLayout',
    ThemeIncompatible = 'themeIncompatible',
    DefaultScreenTemplateUnavailable = 'defaultScreenTemplateUnavailable',
    DefaultScreenTemplateIncompatible = 'defaultScreenTemplateIncompatible',
    UsedLayoutUnavailable = 'usedLayoutUnavailable',
    UsedScreenTemplateUnavailable = 'usedScreenTemplateUnavailable',
    UsedDialogTemplateUnavailable = 'usedDialogTemplateUnavailable',
    UsedComponentUnavailable = 'usedComponentUnavailable',
    UsedSlotUnavailable = 'usedSlotUnavailable',
    UsageInspectionPending = 'usageInspectionPending',
    UsageInspectionFailed = 'usageInspectionFailed',
    IconUsageInspectionPending = 'iconUsageInspectionPending',
    IconUsageInspectionFailed = 'iconUsageInspectionFailed',
    UsedIconUnavailable = 'usedIconUnavailable',
    SampleDataInvalid = 'sampleDataInvalid',
}
