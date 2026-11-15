// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** A reference to a template, as the application stores it. */
export interface StoredTemplateReference {
    source: string;
    blueprint: string;
    id: string;
    version: string;
    isNone: boolean;
}

/** The root template (the shell) and its options, as the application stores them. */
export interface StoredUiProfileRoot {
    template: StoredTemplateReference;
    optionsJson: string;
}

/** The defaults for new work, as the application stores them. */
export interface StoredUiProfileDefaults {
    newScreenTemplate: StoredTemplateReference;
}

/** The complete profile in the root-template shape: what the designer saves. */
/** The application's name and logo as stored; every member empty takes Scene's default. */
export interface StoredUiProfileIdentity {
    name: string;
    logoKind: string;
    initials: string;
    icon: string;
    image: string;
    showName: boolean;
}

/** The members Scene added for the designer, stored beside the root, appearance and defaults. */
export interface StoredUiProfileStyle {
    identity: StoredUiProfileIdentity;
    corners: string;
    font: string;
}

export interface UiProfileDocumentValue {
    packages: string[];
    templatePacks: string[];
    resolvedPackages: string[];
    theme: string;
    root: StoredUiProfileRoot;
    appearance: { colorScheme: string; accent: string };
    defaults: StoredUiProfileDefaults;
    style: StoredUiProfileStyle;
}

/** What was stored before the designer opened, so what it does not edit is saved back as it was. */
export interface StoredUiProfileShape {
    settings: import('./UiProfileSettings').UiProfileSettings;
    root?: StoredUiProfileRoot;
    defaults?: StoredUiProfileDefaults;
    style?: StoredUiProfileStyle;
}
