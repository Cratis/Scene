// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyEditorKind, PropertyValueType, type InspectedProperty, type PropertyDescriptor } from '@cratis/scene.model';
import type { Theme, UiProfile } from '@cratis/scene.model';
import { incompatiblePackages } from '@cratis/scene.engine';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

// The profile's property descriptors, as data, so every setting is drawn by the editor the registry names for it rather than by hand-written
// controls. Scene owns what the profile's properties are (`describeUiProfile`, Cratis/Scene#160); the designer words them for its own locale and gives the
// theme choices a disabled reason, and `for_profileDescriptors/when_comparing_with_the_engines_descriptors` keeps them from drifting from Scene's.
export const sampleDataPath = 'sampleData.activePack';
export const namePath = 'name';
export const targetPlatformPath = 'targetPlatform';
export const sizeClassPath = 'defaultSizeClass';
export const themePath = 'theme';
export const newScreenTemplatePath = 'defaults.newScreenTemplate';
export const colorSchemePath = 'appearance.colorScheme';
export const accentPath = 'appearance.accent';

export function colorSchemeDescriptor(strings: UiProfileDesignerStrings): PropertyDescriptor {
    return {
        path: colorSchemePath,
        label: strings.properties.colorScheme,
        group: strings.nodes.theme,
        valueType: PropertyValueType.Enum,
        editorKind: PropertyEditorKind.Enum,
        choices: [
            { value: 'light', label: strings.properties.light },
            { value: 'dark', label: strings.properties.dark },
        ],
        default: 'light',
        description: strings.properties.colorSchemeDescription,
    };
}

export function accentDescriptor(strings: UiProfileDesignerStrings): PropertyDescriptor {
    return {
        path: accentPath,
        label: strings.properties.accent,
        group: strings.nodes.theme,
        valueType: PropertyValueType.String,
        editorKind: PropertyEditorKind.Color,
        description: strings.properties.accentDescription,
    };
}

// A descriptor with the value the profile holds for it, in the shape the property editor host draws. The profile is always the author's own to
// edit: nothing in it is inherited.
export function inspectedProfileProperty(descriptor: PropertyDescriptor, value: unknown): InspectedProperty {
    return {
        descriptor,
        currentValue: value,
        effectiveValue: value === undefined || value === '' ? descriptor.default : value,
        source: value === undefined || value === '' ? 'default' : 'local',
        editable: true,
    };
}

export function nameDescriptor(strings: UiProfileDesignerStrings): PropertyDescriptor {
    return {
        path: namePath,
        label: strings.properties.name,
        group: strings.nodes.application,
        valueType: PropertyValueType.String,
        editorKind: PropertyEditorKind.Text,
        constraints: { required: true },
        description: strings.properties.nameDescription,
    };
}

// The platform the application is drawn for. Studio draws for the web only, so there is one choice, always chosen: it says what the profile is for
// without offering a platform that nothing could render.
export function targetPlatformDescriptor(strings: UiProfileDesignerStrings): PropertyDescriptor {
    return {
        path: targetPlatformPath,
        label: strings.properties.targetPlatform,
        group: strings.nodes.application,
        valueType: PropertyValueType.Enum,
        editorKind: PropertyEditorKind.Enum,
        choices: [{ value: 'web', label: strings.properties.web }],
        default: 'web',
        constraints: { required: true },
        description: strings.properties.targetPlatformDescription,
    };
}

// The size class the application assumes when nothing else decides one. Optional: a profile that never chose one has none, which the select shows as
// "No default" (the engine's default is regular).
export function sizeClassDescriptor(strings: UiProfileDesignerStrings): PropertyDescriptor {
    return {
        path: sizeClassPath,
        label: strings.properties.sizeClass,
        group: strings.nodes.application,
        valueType: PropertyValueType.Enum,
        editorKind: PropertyEditorKind.Enum,
        choices: [
            { value: 'compact', label: strings.properties.compact },
            { value: 'regular', label: strings.properties.regular },
            { value: 'expanded', label: strings.properties.expanded },
        ],
        description: strings.properties.sizeClassDescription,
    };
}

export function newScreenTemplateDescriptor(strings: UiProfileDesignerStrings): PropertyDescriptor {
    return {
        path: newScreenTemplatePath,
        label: strings.properties.newScreensStartFrom,
        group: strings.properties.authoring,
        valueType: PropertyValueType.String,
        editorKind: PropertyEditorKind.Template,
        description: strings.properties.newScreensStartFromDescription,
    };
}

// A theme choice the profile's packages rule out stays listed, with the packages it is not made for as its reason (`profileThemeIncompatible`).
export interface ThemeChoice {
    value: string;
    label: string;
    disabledReason?: string;
}

export function themeDescriptor(strings: UiProfileDesignerStrings, themes: readonly Theme[], profile: UiProfile): PropertyDescriptor {
    const choices: ThemeChoice[] = themes.map(theme => {
        const missing = incompatiblePackages(theme, profile);
        return {
            value: theme.name,
            label: theme.name,
            ...(missing.length > 0 ? { disabledReason: strings.properties.themeIncompatible.replace('{packages}', missing.join(', ')) } : {}),
        };
    });
    // The choosable themes first, so the ones ruled out sit together below them with their reasons.
    choices.sort((left, right) => Number(left.disabledReason !== undefined) - Number(right.disabledReason !== undefined));
    return {
        path: themePath,
        label: strings.properties.theme,
        group: strings.nodes.theme,
        valueType: PropertyValueType.Enum,
        editorKind: PropertyEditorKind.Select,
        choices,
        description: strings.properties.themeDescription,
    };
}

export function sampleDataDescriptor(strings: UiProfileDesignerStrings): PropertyDescriptor {
    return {
        path: sampleDataPath,
        label: strings.properties.activeSampleData,
        group: strings.nodes.sampleData,
        valueType: PropertyValueType.String,
        editorKind: PropertyEditorKind.SampleData,
        description: strings.properties.activeSampleDataDescription,
    };
}
