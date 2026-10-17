// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    ColorScheme,
    ComponentCategory,
    ComponentDescriptor,
    CornerStyle,
    LogoKind,
    PropertyChoice,
    PropertyDescriptor,
    PropertyEditorKind,
    PropertyValueType,
    TargetSizeClass,
    Theme,
    UiProfile,
} from '@cratis/scene.model';
import { EffectiveShell } from '../shell/EffectiveShell';
import { incompatiblePackages } from '../themeCompatibility';
import { fontCatalog, fontSampleLine } from './fontCatalog';
import { shellOptionDescriptors } from './shellOptions';
import { UiProfileNodeKind } from './UiProfileNodeKind';

/** What a UI profile's descriptors are built from: the choices the application has. Everything is optional; an absent list leaves the property free-form. */
export interface UiProfileDescriptorContext {
    /** The themes available. Each one the profile's packages do not support is marked as such, not hidden. */
    themes?: readonly Theme[];

    /** The names of the packages that can be added to the profile. */
    packages?: readonly string[];

    /** The target platforms the application can be built for. */
    targetPlatforms?: readonly string[];

    /** The sample-data packs available, by id and title. */
    sampleDataPacks?: readonly { id: string; title: string }[];

    /** The shell in place, from `resolveEffectiveShell`. Absent, the shell node offers the root template only. */
    shell?: EffectiveShell;

    /** The options the shell declares, as descriptors whose `path` is the option's name. A blueprint's shell declares them next to its exposure. */
    shellOptions?: readonly PropertyDescriptor[];

    /** The navigation modes the shell offers. When given, `navigationMode` is a choice of these; otherwise it is free text. */
    navigationModes?: readonly string[];
}

const id = (node: UiProfileNodeKind, displayName: string, description: string, properties: PropertyDescriptor[]): ComponentDescriptor =>
    ({ component: node, displayName, description, category: ComponentCategory.Layout, properties });

const choicesOf = (values: readonly string[]): PropertyChoice[] => values.map(value => ({ value, label: value }));

const enumChoices = (enumObject: Record<string, string>): PropertyChoice[] => choicesOf(Object.values(enumObject));

/** The path of a shell option in a profile: `root.options.<name>`. */
export const shellOptionPath = (name: string): string => `root.options.${name}`;

/**
 * Describes the nodes of a UI profile - Application, Shell, Theme, Packages, Sample data - as component descriptors in the existing format, so a
 * host renders them with the property-editor registry it already has for every other node. Each property's `path` is its path in the
 * profile (`appearance.colorScheme`, `root.options.navigationMode`), so the value is read and written with the same path access as any property.
 *
 * Nothing here is Studio's: the labels, groups, choices, defaults, constraints and the explanation of why a theme does not fit are the engine's.
 *
 * @param profile The profile being edited; the theme choices say which themes its packages do not support.
 * @param context The choices the application has.
 * @returns One descriptor per node, in the order a designer lists them.
 */
export function describeUiProfile(profile: UiProfile, context: UiProfileDescriptorContext = {}): ComponentDescriptor[] {
    return [
        describeApplication(context),
        describeShell(context),
        describeTheme(profile, context),
        describePackages(context),
        describeSampleData(context),
    ];
}

function describeApplication(context: UiProfileDescriptorContext): ComponentDescriptor {
    return id(UiProfileNodeKind.Application, 'Application', 'The name, platform and defaults of the application.', [
        {
            path: 'name', label: 'Name', group: 'General', valueType: PropertyValueType.String,
            description: 'The name of the UI profile; it is how the application refers to this set of choices.',
            constraints: { required: true, minimumLength: 1 },
        },
        {
            path: 'targetPlatform', label: 'Target platform', group: 'General', valueType: PropertyValueType.String,
            ...(context.targetPlatforms === undefined
                ? {}
                : { valueType: PropertyValueType.Enum, choices: choicesOf(context.targetPlatforms) }),
            description: 'What the application is built for.',
            constraints: { required: true },
        },
        {
            path: 'defaultSizeClass', label: 'Default size class', group: 'General', valueType: PropertyValueType.Enum, choices: enumChoices(TargetSizeClass),
            default: TargetSizeClass.Regular,
            description: 'The size class the designer starts previewing in.',
        },
        {
            path: 'defaults.newScreenTemplate', label: 'Template for new screens', group: 'Defaults', valueType: PropertyValueType.Object,
            editorKind: PropertyEditorKind.Template, editorOptions: { kinds: ['screenTemplate'] },
            description: 'The screen template a new screen starts from. Leave it out to start from an empty screen.',
        },
        ...identityProperties(),
    ]);
}

function identityProperties(): PropertyDescriptor[] {
    return [
        {
            path: 'identity.name', label: 'Application name', group: 'Identity', valueType: PropertyValueType.String,
            description: 'The name shown next to the logo. Leave it out to use the profile name.',
        },
        {
            path: 'identity.showName', label: 'Show the name', group: 'Identity', valueType: PropertyValueType.Boolean, default: true,
            description: 'Whether the name is drawn next to the logo where there is room.',
        },
        {
            path: 'identity.logo.kind', label: 'Logo', group: 'Identity', valueType: PropertyValueType.Enum, choices: enumChoices(LogoKind),
            description: 'Initials, one of the built-in icons, or an image you provide.',
        },
        {
            path: 'identity.logo.initials', label: 'Initials', group: 'Identity', valueType: PropertyValueType.String,
            description: 'One or two letters drawn as the logo.', constraints: { maximumLength: 2 },
        },
        {
            path: 'identity.logo.icon', label: 'Icon', group: 'Identity', valueType: PropertyValueType.Icon,
            description: 'One of the built-in logo icons.',
        },
        {
            path: 'identity.logo.image', label: 'Image', group: 'Identity', valueType: PropertyValueType.String,
            description: 'An inline PNG, JPG, SVG or WebP image, up to 400 KB.',
        },
    ];
}

function describeShell(context: UiProfileDescriptorContext): ComponentDescriptor {
    const properties: PropertyDescriptor[] = [
        {
            path: 'root.template', label: 'Shell', group: 'Shell', valueType: PropertyValueType.Object,
            editorKind: PropertyEditorKind.Template, editorOptions: { kinds: ['layout', 'rootScreenTemplate'] },
            description: 'The template that frames every screen: the chrome, the navigation and where a screen\'s content goes.',
        },
    ];

    const typed = shellOptionDescriptors();
    for (const option of typed) {
        const choices = option.path === 'navigationMode' && context.navigationModes !== undefined ? choicesOf(context.navigationModes) : option.choices;
        properties.push({ ...option, path: shellOptionPath(option.path), group: 'Menu', choices });
    }

    for (const option of context.shellOptions ?? []) {
        if (option.path === 'navigationMode' || option.path === 'menuTheme') continue;
        properties.push({ ...option, path: shellOptionPath(option.path), group: option.group || 'Shell options' });
    }

    const shell = context.shell;
    return id(UiProfileNodeKind.Shell, 'Shell', shell === undefined
        ? 'The template that frames every screen, and the options it offers.'
        : `The template that frames every screen - now '${shell.name}' - and the options it offers.`, properties);
}

function describeTheme(profile: UiProfile, context: UiProfileDescriptorContext): ComponentDescriptor {
    const themeChoices = context.themes?.map((theme): PropertyChoice => {
        const missing = incompatiblePackages(theme, profile);
        return {
            value: theme.name,
            label: theme.name,
            description: missing.length === 0
                ? theme.description
                : `Theme '${theme.name}' is not marked compatible with ${missing.map(name => `'${name}'`).join(', ')}, which this profile uses`,
        };
    });

    return id(UiProfileNodeKind.Theme, 'Theme', 'How the application looks.', [
        {
            path: 'theme', label: 'Theme', group: 'Appearance',
            valueType: themeChoices === undefined ? PropertyValueType.String : PropertyValueType.Enum,
            ...(themeChoices === undefined ? {} : { choices: themeChoices }),
            description: 'The theme the application uses. A theme not marked compatible with every package in the profile is still offered, with the reason.',
        },
        {
            path: 'appearance.colorScheme', label: 'Colour scheme', group: 'Appearance', valueType: PropertyValueType.Enum, choices: enumChoices(ColorScheme),
            description: 'Light, dark, or follow the system. Leave it out to use the theme\'s own default.',
        },
        {
            path: 'appearance.accent', label: 'Accent', group: 'Appearance', valueType: PropertyValueType.String, editorKind: PropertyEditorKind.Color,
            description: 'The accent colour. Leave it out to keep the theme\'s accent.',
            constraints: { pattern: '^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$' },
        },
        {
            path: 'appearance.corners', label: 'Corners', group: 'Appearance', valueType: PropertyValueType.Enum, choices: enumChoices(CornerStyle),
            description: 'Sharp, the theme\'s own corners, or round. Leave it out to use the theme\'s own.',
        },
        {
            path: 'appearance.font', label: 'Font', group: 'Appearance', valueType: PropertyValueType.Enum,
            choices: fontCatalog.map((font): PropertyChoice => ({ value: font.id, label: font.displayName, description: fontSampleLine })),
            description: 'The font the application uses. Leave it out to use the theme\'s own.',
        },
    ]);
}

function describePackages(context: UiProfileDescriptorContext): ComponentDescriptor {
    return id(UiProfileNodeKind.Packages, 'Packages', 'The packages the application takes its components, templates and themes from.', [
        {
            path: 'packages', label: 'Packages', group: 'Packages', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [],
            ...(context.packages === undefined ? {} : { choices: choicesOf(context.packages) }),
            description: 'Listed in order: when two packages provide the same component, the later one wins.',
            constraints: { required: true, minimumItems: 1 },
        },
    ]);
}

function describeSampleData(context: UiProfileDescriptorContext): ComponentDescriptor {
    return id(UiProfileNodeKind.SampleData, 'Sample data', 'The demo data the preview shows. It never ships to production.', [
        {
            path: 'sampleData.activePack', label: 'Active pack', group: 'Sample data',
            valueType: context.sampleDataPacks === undefined ? PropertyValueType.String : PropertyValueType.Enum,
            ...(context.sampleDataPacks === undefined ? {} : { choices: context.sampleDataPacks.map((pack): PropertyChoice => ({ value: pack.id, label: pack.title })) }),
            description: 'The pack the preview reads its rows from. Leave it out to preview with generated values.',
        },
    ]);
}
