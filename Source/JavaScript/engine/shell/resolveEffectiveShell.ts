// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    Layout,
    PackageKind,
    Screen,
    ScreenTemplate,
    TemplateReference,
    TemplateReferenceSource,
    TemplateRole,
    TemplateScope,
    UiProfile,
} from '@cratis/scene.model';
import { BlueprintPinEvaluation, defaultBlueprintPin, evaluateBlueprintPin } from '../blueprints/evaluateBlueprintPin';
import { resolveScreenTemplates } from '../resolveScreenTemplates';
import { validateLayoutApplicability, validateScreenTemplateApplicability } from '../templateApplicability';
import { incompatiblePackages } from '../themeCompatibility';
import { TemplateCatalogKind } from '../templates/TemplateCatalogKind';
import { TemplateReferenceStatus } from '../templates/TemplateReferenceResolution';
import { TemplateSource } from '../templates/TemplateSource';
import { resolveTemplateReference } from '../templates/resolveTemplateReference';
import { EffectiveShell, ShellKind, ShellOrigin, ShellSource } from './EffectiveShell';
import { ShellDiagnostic } from './ShellDiagnostic';
import { ShellDiagnosticCode } from './ShellDiagnosticCode';
import { ShellResolutionContext } from './ShellResolutionContext';

const defaultPrimaryOutlet = 'content';

/** The name of the built-in shell that is used when a profile chooses none and no blueprint offers one. */
export const bareShellName = 'Bare';

const bareShell: Layout = { name: bareShellName, slots: [{ name: defaultPrimaryOutlet }] };

interface Found {
    template: Layout | ScreenTemplate;
    kind: ShellKind;
    source: TemplateSource | undefined;
    isBlueprint: boolean;
}

/**
 * Resolves the application's shell: the one function every host (the preview host, Stage, the CLI, Studio's canvases and the
 * Screenplay validator) calls, so there is no second implementation of "what is the shell?".
 *
 * The order is the profile's root template, then its legacy layout name, then the default layout of the first installed
 * blueprint, then the built-in bare shell (one `content` outlet, no chrome). A candidate that cannot be used at all (it does not
 * exist, its blueprint is not available, it is not something an application can use as a shell) is reported and the next one is
 * tried, so there is always a shell to render. A candidate that exists but is wrong in a way the host can still show (its pin is
 * drifted, it lacks the content outlet, the blueprint is available but not added to the packages) is used and reported.
 *
 * Besides the root's own problems, the profile around it is checked: the theme against the profile's packages, the packages
 * against the available ones, and - when the screens are given - that every screen's content has an outlet to go to.
 *
 * @param profile The UI profile.
 * @param context The templates, screens, themes and packages to resolve against.
 * @returns The effective shell with its outlets, options and every diagnostic.
 */
export function resolveEffectiveShell(profile: UiProfile, context: ShellResolutionContext): EffectiveShell {
    const diagnostics: ShellDiagnostic[] = [];
    const installed = installedBlueprints(profile, context);

    let shell: EffectiveShell | undefined;
    if (profile.root !== undefined) {
        shell = fromReference(profile.root.template, ShellOrigin.Root, profile, context, diagnostics, profile.root.options);
    }

    if (shell === undefined && profile.layout !== undefined && profile.layout.trim() !== '') {
        shell = fromLegacyLayout(profile.layout, profile, context, installed, diagnostics);
    }

    shell ??= fromBlueprintDefault(installed);
    shell ??= bare();

    shell.diagnostics.push(...diagnostics);
    checkContentOutlet(shell);
    const templates = placeableScreenTemplates(profile, context);
    checkCycles(shell, templates);

    checkProfile(shell, profile, context);
    checkScreens(shell, context, templates);
    return shell;
}

function installedBlueprints(profile: UiProfile, context: ShellResolutionContext): TemplateSource[] {
    return profile.packages
        .map(name => context.library.blueprints.find(source => source.manifest.name === name && source.manifest.kind === PackageKind.Blueprint))
        .filter((source): source is TemplateSource => source !== undefined);
}

function fromReference(
    reference: TemplateReference,
    origin: ShellOrigin,
    profile: UiProfile,
    context: ShellResolutionContext,
    diagnostics: ShellDiagnostic[],
    options: Record<string, unknown> | undefined,
): EffectiveShell | undefined {
    const resolution = resolveTemplateReference(reference, context.library);
    const label = referenceLabel(reference);

    switch (resolution.status) {
        case TemplateReferenceStatus.Malformed:
        case TemplateReferenceStatus.UnknownTemplate:
            diagnostics.push({ code: ShellDiagnosticCode.RootTemplateUnknown, subject: reference.id, message: `Root template ${label} cannot be used: ${resolution.message}` });
            return undefined;
        case TemplateReferenceStatus.UnknownBlueprint:
            diagnostics.push({ code: ShellDiagnosticCode.RootTemplateBlueprintNotInstalled, subject: reference.blueprint, message: `Root template ${label} comes from blueprint '${reference.blueprint}', which is not installed` });
            return undefined;
        default:
            break;
    }

    const source = reference.source === TemplateReferenceSource.Own
        ? context.library.own
        : context.library.blueprints.find(candidate => candidate.manifest.name === reference.blueprint);
    const found = source === undefined ? undefined : findShell(reference.id, source, reference.source === TemplateReferenceSource.Blueprint);
    if (found === undefined) {
        if (resolution.status === TemplateReferenceStatus.Resolved) {
            diagnostics.push({
                code: ShellDiagnosticCode.RootTemplateNotApplicable,
                subject: reference.id,
                message: `Root template ${label} cannot be the application's shell: it is a ${kindName(resolution.kind)}, and only a layout or a screen template with the root role can be a shell`,
            });
        } else {
            diagnostics.push({ code: ShellDiagnosticCode.RootTemplateVersionNotSatisfied, subject: reference.id, message: `Root template ${label} cannot be used: ${resolution.message}` });
        }
        return undefined;
    }

    const problems = found.kind === ShellKind.Layout
        ? validateLayoutApplicability(found.template as Layout, TemplateScope.Application)
        : validateScreenTemplateApplicability(found.template as ScreenTemplate, TemplateScope.Application);
    if (problems.length > 0) {
        diagnostics.push({ code: ShellDiagnosticCode.RootTemplateNotApplicable, subject: reference.id, message: `Root template ${label} cannot be the application's shell: ${problems.join('; ')}` });
        return undefined;
    }

    if (resolution.status === TemplateReferenceStatus.VersionNotSatisfied) {
        diagnostics.push({ code: ShellDiagnosticCode.RootTemplateVersionNotSatisfied, subject: reference.id, message: resolution.message! });
    }

    if (found.isBlueprint && !profile.packages.includes(reference.blueprint!)) {
        diagnostics.push({
            code: ShellDiagnosticCode.RootTemplateBlueprintNotInstalled,
            subject: reference.blueprint,
            message: `Root template ${label} comes from blueprint '${reference.blueprint}', which is available but not among the packages of profile '${profile.name}'`,
        });
    }

    return build(found, origin, reference, options);
}

function fromLegacyLayout(
    name: string,
    profile: UiProfile,
    context: ShellResolutionContext,
    installed: TemplateSource[],
    diagnostics: ShellDiagnostic[],
): EffectiveShell | undefined {
    const own = context.library.own === undefined ? undefined : findLayout(name, context.library.own, false);
    if (own !== undefined) return build(own, ShellOrigin.LegacyLayout, { source: TemplateReferenceSource.Own, id: name });

    for (const blueprint of installed) {
        const found = findLayout(name, blueprint, true);
        if (found !== undefined) return build(found, ShellOrigin.LegacyLayout, blueprintReference(blueprint, name));
    }

    diagnostics.push({ code: ShellDiagnosticCode.RootTemplateUnknown, subject: name, message: `Layout '${name}' named by profile '${profile.name}' does not exist in the application or in any installed blueprint` });
    return undefined;
}

function fromBlueprintDefault(installed: TemplateSource[]): EffectiveShell | undefined {
    for (const blueprint of installed) {
        const layout = (blueprint.layouts ?? []).find(candidate => validateLayoutApplicability(candidate, TemplateScope.Application).length === 0);
        if (layout !== undefined) {
            return build({ template: layout, kind: ShellKind.Layout, source: blueprint, isBlueprint: true }, ShellOrigin.BlueprintDefault, blueprintReference(blueprint, layout.name));
        }

        const root = (blueprint.screenTemplates ?? []).find(candidate => candidate.metadata?.role === TemplateRole.Root && validateScreenTemplateApplicability(candidate, TemplateScope.Application).length === 0);
        if (root !== undefined) {
            return build({ template: root, kind: ShellKind.ScreenTemplate, source: blueprint, isBlueprint: true }, ShellOrigin.BlueprintDefault, blueprintReference(blueprint, root.name));
        }
    }

    return undefined;
}

function bare(): EffectiveShell {
    return {
        origin: ShellOrigin.Bare,
        template: bareShell,
        kind: ShellKind.Layout,
        source: ShellSource.BuiltIn,
        name: bareShell.name,
        outlets: bareShell.slots.map(slot => slot.name),
        primaryOutlet: defaultPrimaryOutlet,
        options: {},
        diagnostics: [],
    };
}

function build(found: Found, origin: ShellOrigin, reference: TemplateReference, options?: Record<string, unknown>): EffectiveShell {
    const template = found.template;
    const primaryOutlet = (found.kind === ShellKind.Layout ? (template as Layout).metadata?.primaryOutlet : (template as ScreenTemplate).metadata?.primaryOutlet) ?? defaultPrimaryOutlet;
    let pin: BlueprintPinEvaluation | undefined;
    if (found.isBlueprint && found.source !== undefined) {
        pin = evaluateBlueprintPin(reference.version, found.source.manifest.version);
    }

    return {
        origin,
        reference,
        template,
        kind: found.kind,
        source: found.isBlueprint ? ShellSource.Blueprint : ShellSource.Own,
        name: template.name,
        ...(found.isBlueprint && found.source !== undefined ? { package: found.source.manifest.name, packageVersion: found.source.manifest.version } : {}),
        ...(pin === undefined ? {} : { pin }),
        outlets: template.slots.map(slot => slot.name),
        primaryOutlet,
        options: { ...(options ?? {}) },
        diagnostics: [],
    };
}

function findShell(name: string, source: TemplateSource, isBlueprint: boolean): Found | undefined {
    return findLayout(name, source, isBlueprint) ?? findRootScreenTemplate(name, source, isBlueprint);
}

function findLayout(name: string, source: TemplateSource, isBlueprint: boolean): Found | undefined {
    const layout = source.layouts?.find(candidate => candidate.name === name);
    return layout === undefined ? undefined : { template: layout, kind: ShellKind.Layout, source, isBlueprint };
}

function findRootScreenTemplate(name: string, source: TemplateSource, isBlueprint: boolean): Found | undefined {
    const template = source.screenTemplates?.find(candidate => candidate.name === name && candidate.metadata?.role === TemplateRole.Root);
    return template === undefined ? undefined : { template, kind: ShellKind.ScreenTemplate, source, isBlueprint };
}

function blueprintReference(blueprint: TemplateSource, id: string): TemplateReference {
    return { source: TemplateReferenceSource.Blueprint, id, blueprint: blueprint.manifest.name, version: defaultBlueprintPin(blueprint.manifest.version) };
}

function referenceLabel(reference: TemplateReference): string {
    return `'${reference.id}'`;
}

function kindName(kind: TemplateCatalogKind | undefined): string {
    switch (kind) {
        case TemplateCatalogKind.DialogTemplate: return 'dialog template';
        case TemplateCatalogKind.ScreenTemplate: return 'screen template without the root role';
        default: return 'template';
    }
}

function checkContentOutlet(shell: EffectiveShell): void {
    if (!shell.outlets.includes(shell.primaryOutlet)) {
        shell.diagnostics.push({
            code: ShellDiagnosticCode.RootTemplateMissingContentSlot,
            subject: shell.name,
            message: `Shell '${shell.name}' has no '${shell.primaryOutlet}' outlet, so no screen can be placed in it`,
        });
    }
}

/**
 * The screen templates a screen can be built from while a shell is in place: the application's own and those of the installed
 * blueprints, without the root templates (those are shells, not parts of one). A name the application and a blueprint share is the application's.
 *
 * @param profile The profile whose installed blueprints are searched.
 * @param context The library (and the rest) the shell is resolved against.
 * @returns The templates, in the order own then installed blueprints.
 */
export function placeableScreenTemplates(profile: UiProfile, context: ShellResolutionContext): ScreenTemplate[] {
    const sources = [context.library.own, ...installedBlueprints(profile, context)];
    const templates: ScreenTemplate[] = [];
    for (const source of sources) {
        for (const template of source?.screenTemplates ?? []) {
            if (template.metadata?.role !== TemplateRole.Root && !templates.some(candidate => candidate.name === template.name)) templates.push(template);
        }
    }

    return templates;
}

function checkCycles(shell: EffectiveShell, templates: readonly ScreenTemplate[]): void {
    const nested = templates.filter(template => template.name !== shell.name);
    const resolution = resolveScreenTemplates({ name: shell.name, slots: shell.template.slots } as Layout, nested);
    for (const cycle of resolution.cycles) {
        const names = [...cycle, cycle[0]].map(name => `'${name}'`).join(' -> ');
        shell.diagnostics.push({
            code: ShellDiagnosticCode.RootTemplateCycle,
            subject: cycle[0],
            message: `Templates ${names} contain each other and can never be placed inside shell '${shell.name}'`,
        });
    }
}

function checkProfile(shell: EffectiveShell, profile: UiProfile, context: ShellResolutionContext): void {
    const theme = profile.theme === undefined ? undefined : context.themes?.find(candidate => candidate.name === profile.theme);
    if (theme !== undefined) {
        const incompatible = incompatiblePackages(theme, profile);
        if (incompatible.length > 0) {
            shell.diagnostics.push({
                code: ShellDiagnosticCode.ProfileThemeIncompatible,
                subject: theme.name,
                message: `Theme '${theme.name}' does not support ${incompatible.length === 1 ? 'package' : 'packages'} ${incompatible.map(name => `'${name}'`).join(', ')} of profile '${profile.name}'`,
            });
        }
    }

    if (context.availablePackages !== undefined) {
        for (const name of profile.packages.filter(candidate => !context.availablePackages!.includes(candidate))) {
            shell.diagnostics.push({
                code: ShellDiagnosticCode.ProfilePackageMissing,
                subject: name,
                message: `Package '${name}' of profile '${profile.name}' is not available`,
            });
        }
    }
}

function checkScreens(shell: EffectiveShell, context: ShellResolutionContext, templates: readonly ScreenTemplate[]): void {
    for (const screen of context.screens ?? []) {
        for (const outlet of outletsUsedBy(screen, shell.name, templates)) {
            if (!shell.outlets.includes(outlet)) {
                shell.diagnostics.push({
                    code: ShellDiagnosticCode.ProfileSlotUnplaced,
                    subject: screen.name,
                    message: `Screen '${screen.name}' places content in outlet '${outlet}', which shell '${shell.name}' does not have`,
                });
            }
        }
    }
}

/** Where a screen template sits in the shell: the outermost template of its chain and the outlet that template fits. */
export interface TemplatePlacement {
    /** The name of the outermost template of the chain - the one whose `fitsSlot` names the outlet. */
    template: string;

    /** The outlet of the shell it fits (a name the shell may not have). */
    outlet: string;

    /** The qualifier of its `fitsSlot` (`Shell.outlet`), when it has one. */
    qualifier?: string;
}

/**
 * Where a screen template lands in the shell: follows `fitsSlot` from template to containing template until the slot is an outlet of the
 * shell - qualified with the shell's name, or one no template of the chain declares. A template without `fitsSlot` is placed explicitly
 * and has no placement.
 *
 * @param templateName The screen template the chain starts at.
 * @param shellName The name of the shell the template is placed in.
 * @param templates The screen templates a screen can be built from ({@link placeableScreenTemplates}).
 * @returns The placement, or undefined when the chain is placed explicitly, is cyclic or starts at an unknown template.
 */
export function templatePlacement(templateName: string, shellName: string, templates: readonly ScreenTemplate[]): TemplatePlacement | undefined {
    let current = templates.find(template => template.name === templateName);
    const visited = new Set<string>();
    while (current !== undefined && !visited.has(current.name)) {
        visited.add(current.name);
        if (current.fitsSlot === undefined) return undefined;
        const separator = current.fitsSlot.lastIndexOf('.');
        const qualifier = separator < 0 ? undefined : current.fitsSlot.slice(0, separator);
        const slot = separator < 0 ? current.fitsSlot : current.fitsSlot.slice(separator + 1);
        if (qualifier === shellName) return { template: current.name, outlet: slot, qualifier };
        const self: ScreenTemplate = current;
        const container = templates.find(template => template !== self && (qualifier === undefined || template.name === qualifier) && template.slots.some(candidate => candidate.name === slot));
        if (container === undefined) return { template: current.name, outlet: slot, qualifier };
        current = container;
    }

    return undefined;
}

/**
 * The outlets of a shell a screen puts content in: its own slots with content, or the slot its outermost template fits.
 *
 * @param screen The screen.
 * @param shellName The name of the shell the screen is placed in.
 * @param templates The screen templates a screen can be built from ({@link placeableScreenTemplates}).
 * @returns The outlet names, which may include names the shell does not have.
 */
export function outletsUsedBy(screen: Screen, shellName: string, templates: readonly ScreenTemplate[]): string[] {
    if (screen.screenTemplate === undefined) {
        return Object.entries(screen.slotContent ?? {}).filter(([, content]) => content.length > 0).map(([slot]) => slot);
    }

    const placement = templatePlacement(screen.screenTemplate, shellName, templates);
    return placement === undefined ? [] : [placement.outlet];
}
