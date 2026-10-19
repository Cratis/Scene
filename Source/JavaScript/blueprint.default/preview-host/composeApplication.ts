// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DestinationReference, DialogTemplate, EditingScopeKind, Form, Layout, PackageKind, SceneElement, Screen, ScreenTemplate, UiProfile,
    type ApplicationLogo, type EffectiveConfiguration,
} from '@cratis/scene.model';
import {
    DescriptorCatalog, EffectiveShell, PackageCatalog, ResolvedProfileIdentity, ShellKind, ShellOrigin, ShellSource, TemplateLibrary, resolveEffectiveConfiguration, resolveEffectiveShell,
    resolveScreenTemplates, resolveTemplateChain,
} from '@cratis/scene.engine';
import { defaultBlueprintManifest } from '../defaultBlueprint';
import { ComponentName } from '../ComponentName';
import { externalComponent } from '../gallery/elements';
import { resolveElementComponentNames } from '../gallery/resolveElementNames';
import { galleryScreenTemplates } from '../gallery/screens';
import { LayoutName, SlotName, defaultLayouts, shellComponentForLayout } from '../layouts';
import { ApplicationDocument, completeDocument } from './ApplicationDocument';
import { defaultApplicationChrome } from './defaultApplicationChrome';
import { previewTemplateComponent } from './PreviewTemplate';
import { blueprintPackageCatalog, previewProfile } from './previewProfile';

/** What a host decides about how a screen is composed; everything else is the document's. */
export interface CompositionOptions {
    /** The profile names are resolved with; {@link previewProfile} of the document's profiles when absent. */
    profile?: UiProfile;

    /** What each package declares; the core and default blueprint packages when absent. */
    catalog?: PackageCatalog;

    /**
     * The chrome the shell is given in its slots - topbar, sidebar, menu, breadcrumb, footer. Absent, the shell shows the
     * application's navigation regions (`defaultApplicationChrome`). A full-page shell gets none of it unless the host says so.
     */
    chrome?(screen: Screen, shell: string): Record<string, SceneElement[]>;

    /** The element a screen's form becomes; the Cratis `commandForm` component when absent. */
    form?(screenName: string, form: Form): SceneElement;

    /** Elements placed after the screen's content in the shell's content slot - Stage's status line. */
    trailing?: SceneElement[];

    /** A last pass over the composed tree before names are resolved - Stage binds data sources here. */
    decorate?(element: SceneElement): SceneElement;

    /** The templates the blueprint provides, for a screen that names one the document does not declare; the gallery's when absent. */
    blueprintTemplates?: ScreenTemplate[];

    /** The layouts the blueprint provides; the default blueprint's when absent. */
    blueprintLayouts?: Layout[];

    /** What each component exposes, so the templates' instance contributions can be resolved; without it no configuration is resolved. */
    descriptors?: DescriptorCatalog;

    /** The application's logo, shown in the default chrome's topbar. */
    logo?: ApplicationLogo;

    /** The resolved identity of the profile - name and logo - which the default chrome draws in place of `logo` when given. */
    identity?: ResolvedProfileIdentity;

    /**
     * Outlets the shell declares that navigation renders screens into - a navigation item authored with `slot side`. Each one the shell
     * has, other than its primary outlet, holds a closable `core:outlet` so the screen placed there is drawn beside the primary screen.
     * {@link ApplicationHost} fills it from the destinations; a host that composes on its own names the outlets it wants.
     */
    hostedOutlets?: string[];

    /**
     * The templates the shell is resolved against: the application's own and the blueprints that are installed. Absent, the
     * document's own layouts and templates, and the default blueprint's.
     */
    templateLibrary?: TemplateLibrary;
}

/** One screen composed for the application shell. */
export interface ComposedScreen {
    /** The shell with its chrome, the screen's template chain and the screen, names resolved. */
    element: SceneElement;

    /** What each scope configured on the components the templates contribute; absent when nothing was configured. */
    configuration?: EffectiveConfiguration;

    /** The templates around the screen, outermost first. */
    templates: string[];
}

function previewCatalog(options: CompositionOptions): PackageCatalog {
    return options.catalog ?? blueprintPackageCatalog;
}

function profileOf(application: ApplicationDocument, options: CompositionOptions): UiProfile {
    return options.profile ?? previewProfile(application.uiProfiles);
}

/** The library the effective shell is resolved from: the document's own templates and the blueprint's. */
function libraryOf(application: ApplicationDocument, options: CompositionOptions): TemplateLibrary {
    return options.templateLibrary ?? {
        own: {
            manifest: { name: 'Application', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] },
            layouts: application.layouts,
            screenTemplates: application.screenTemplates,
            dialogTemplates: application.dialogTemplates ?? [],
        },
        blueprints: [{
            manifest: defaultBlueprintManifest,
            layouts: options.blueprintLayouts ?? defaultLayouts,
            screenTemplates: options.blueprintTemplates ?? galleryScreenTemplates,
        }],
    };
}

/**
 * The shell a screen is composed in. When the profile names a root template, that is the application's shell for every screen
 * except one that opts out by naming the chrome-less full-page layout (a sign-in page); otherwise the screen's own layout is the
 * shell, as it was before the root template existed. Either way the answer comes from the one engine function, `resolveEffectiveShell`.
 */
export function effectiveShellOf(application: ApplicationDocument, screen: Screen, options: CompositionOptions = {}): EffectiveShell {
    const profile = profileOf(application, options);
    const optedOut = screen.layout === LayoutName.FullPage;
    const resolved = optedOut || profile.root === undefined
        ? { ...profile, root: undefined, layout: screen.layout }
        : profile;
    return resolveEffectiveShell(resolved, { library: libraryOf(application, options) });
}

/** The shell as the layout the templates are placed into: its name and outlets. */
export function shellLayout(shell: EffectiveShell): Layout {
    return { name: shell.name, slots: shell.outlets.map(name => ({ name })) };
}

/**
 * The component that draws a layout shell. A blueprint shell is its known component; a shell that no package provides keeps its
 * own name, so the missing component shows in the rendered tree - substituting a default shell would hide a package problem.
 * Without a root template a screen that names a layout the blueprint does not provide stays unresolved under that name.
 */
function shellComponentOf(shell: EffectiveShell, screen: Screen, hasRoot: boolean): string {
    if (shell.origin === ShellOrigin.Bare) return hasRoot ? shellComponentForLayout(LayoutName.FullPage) ?? shell.name : screen.layout;
    return shellComponentForLayout(shell.name) ?? shell.name;
}

function defaultForm(screenName: string, form: Form): SceneElement {
    return externalComponent(`form-${screenName}-${form.name}`, 'commandForm', {
        command: form.forCommand,
        label: form.name,
        generationMode: form.generationMode,
        layout: form.layout,
        fields: form.fields,
    });
}

/** Later fills replace a slot's seed, including an explicitly empty fill; absent slots keep their content. */
function mergeSlots(...sources: (Record<string, SceneElement[]> | undefined)[]): Record<string, SceneElement[]> {
    const merged: Record<string, SceneElement[]> = {};
    for (const source of sources) {
        for (const [slot, elements] of Object.entries(source ?? {})) merged[slot] = [...elements];
    }

    return merged;
}

/** The layout a screen names: the document's own, or one the blueprint provides. */
export function findLayout(application: ApplicationDocument, name: string, options: CompositionOptions = {}): Layout | undefined {
    return application.layouts.find(candidate => candidate.name === name)
        ?? (options.blueprintLayouts ?? defaultLayouts).find(candidate => candidate.name === name);
}

/**
 * The templates a screen is composed with: the document's own, then the blueprint's for any name the document does not declare.
 * A model that writes `template CrudList` without declaring it is naming one of the blueprint's templates; the document's
 * own declaration always wins the name.
 */
export function templatesOf(application: ApplicationDocument, options: CompositionOptions = {}): ScreenTemplate[] {
    const own = application.screenTemplates;
    return [...own, ...(options.blueprintTemplates ?? galleryScreenTemplates).filter(template => !own.some(candidate => candidate.name === template.name))];
}

/**
 * The templates a screen's template chain is worked out among: the document's own when the screen's template is one of them,
 * otherwise the blueprint's as well. The blueprint's templates are never mixed into a document's own chain - several of them fit
 * the same slot name, which would make every slot ambiguous.
 */
export function templatePoolFor(application: ApplicationDocument, screen: Screen, options: CompositionOptions = {}): ScreenTemplate[] {
    return application.screenTemplates.some(candidate => candidate.name === screen.screenTemplate)
        ? application.screenTemplates
        : templatesOf(application, options);
}

/** The slot of the layout a template chain's outermost template fits: its declared slot, or `content`. */
function layoutSlotOf(shell: EffectiveShell, outermost: ScreenTemplate): string {
    const fits = outermost.fitsSlot;
    if (fits === undefined) return shell.primaryOutlet;
    const slot = fits.includes('.') ? fits.slice(fits.lastIndexOf('.') + 1) : fits;
    return shell.outlets.includes(slot) ? slot : shell.primaryOutlet;
}

/** The templates a screen's own template sits inside, outermost first, ending with the screen's own template. */
export function templateChainOf(application: ApplicationDocument, screen: Screen, options: CompositionOptions = {}): ScreenTemplate[] {
    if (!screen.screenTemplate) return [];
    const templates = templatePoolFor(application, screen, options);
    const own = templates.find(candidate => candidate.name === screen.screenTemplate);
    if (!own) return [];

    const layout = shellLayout(effectiveShellOf(application, screen, options));
    const placements = resolveScreenTemplates(layout, templates).placements;
    const chain: ScreenTemplate[] = [own];
    for (let guard = 0; guard <= templates.length; guard++) {
        const placement = placements.find(candidate => candidate.template === chain[0].name);
        if (!placement || placement.container === layout.name) break;
        const parent = templates.find(candidate => candidate.name === placement.container);
        if (!parent || chain.includes(parent)) break;
        chain.unshift(parent);
    }

    return chain;
}

/**
 * What a screen puts in the shell's content slot: the screen - inside the template chain it names, when it names one - and the
 * forms it hosts. The same content fills the shell on the primary region and a nested outlet.
 *
 * The innermost template takes the screen's own slot content; each template outside it holds the one inside in the slot it
 * declared (`fitsSlot`), so the chain's arrangements all apply.
 */
export function screenContent(application: ApplicationDocument, screen: Screen, options: CompositionOptions = {}): { content: SceneElement[]; templates: string[]; slot: string } {
    const form = options.form ?? defaultForm;
    const forms = screen.forms.map(candidate => form(screen.name, candidate));
    const chain = templateChainOf(application, screen, options);
    if (chain.length === 0) {
        return { content: [...Object.values(screen.slotContent).flat(), ...forms], templates: [], slot: effectiveShellOf(application, screen, options).primaryOutlet };
    }

    let inner: SceneElement | undefined;
    for (let index = chain.length - 1; index >= 0; index--) {
        const template = chain[index];
        const slots = index === chain.length - 1
            ? mergeSlots(template.content, screen.slotContent)
            : mergeSlots(template.content, { [slotName(chain[index + 1])]: [inner!] });
        if (index === chain.length - 1 && forms.length > 0) slots.forms = [...(slots.forms ?? []), ...forms];
        inner = externalComponent(`template-${screen.name}-${template.name}`, previewTemplateComponent, { arrangement: template.arrangement }, slots);
    }

    return { content: [inner!], templates: chain.map(template => template.name), slot: layoutSlotOf(effectiveShellOf(application, screen, options), chain[0]) };
}

function slotName(template: ScreenTemplate): string {
    const fits = template.fitsSlot ?? SlotName.Content;
    return fits.includes('.') ? fits.slice(fits.lastIndexOf('.') + 1) : fits;
}

function finish(element: SceneElement, profile: UiProfile, catalog: PackageCatalog, options: CompositionOptions): SceneElement {
    const decorated = options.decorate ? options.decorate(element) : element;
    return resolveElementComponentNames(decorated, profile, catalog);
}

/**
 * Composes one screen the way the application shows it: the shell for the screen's layout, the chrome every screen shares in the
 * shell's slots, and the screen - inside the template chain it names - in the slot the chain fits. Stage and the preview host
 * both compose through this, so a screen is the same screen in both (spec PRV9, REN2).
 *
 * A layout the selected package set does not provide stays unresolved in the rendered tree: showing that missing component is
 * deliberate, because silently substituting a default shell would hide a package/profile problem.
 *
 * @param application The document and profiles.
 * @param screen The screen to compose.
 * @param options What the host decides.
 * @returns The element to render, the configuration its templates resolved, and the templates around the screen.
 */
export function composeApplicationScreen(application: ApplicationDocument, screen: Screen, options: CompositionOptions = {}): ComposedScreen {
    const profile = profileOf(application, options);
    const { content, templates, slot } = screenContent(application, screen, options);

    const effective = effectiveShellOf(application, screen, options);
    const shell = shellComponentOf(effective, screen, profile.root !== undefined);
    const chrome = options.chrome
        ? options.chrome(screen, shell)
        : shell === ComponentName.FullPageShell ? {} : defaultApplicationChrome(options.logo, options.identity);
    const screenSlots: Record<string, SceneElement[]> = { [slot]: [...(chrome[slot] ?? []), ...content, ...(slot === effective.primaryOutlet ? options.trailing ?? [] : [])] };
    for (const name of hostedShellOutlets(effective, options)) {
        screenSlots[name] = [...(screenSlots[name] ?? chrome[name] ?? []), externalComponent(`outlet-${name}`, 'core:outlet', { name, closable: true })];
    }

    // An own root template that fills a slot itself - the storefront's topbar with its basket - says what is drawn there: the host's default chrome only seeds the slots the application's template leaves empty. A blueprint's root template content is placeholder seed, which the host's chrome replaces.
    const rootTemplate = effective.kind === ShellKind.ScreenTemplate ? effective.template as ScreenTemplate : undefined;
    const composed = rootTemplate !== undefined
        ? externalComponent(`screen-${screen.name}`, previewTemplateComponent, { arrangement: rootTemplate.arrangement }, mergeSlots(...(effective.source === ShellSource.Own ? [chrome, rootTemplate.content] : [rootTemplate.content, chrome]), screenSlots))
        : externalComponent(`screen-${screen.name}`, shell, { screenName: screen.name }, { ...chrome, ...screenSlots });

    return { element: finish(composed, profile, previewCatalog(options), options), configuration: configurationOf(application, screen, options), templates };
}

/** The outlets the host asked to hold screens that this shell has, other than the one every screen is placed in. */
export function hostedShellOutlets(shell: EffectiveShell, options: CompositionOptions): string[] {
    return (options.hostedOutlets ?? []).filter(name => name !== shell.primaryOutlet && shell.outlets.includes(name));
}

/**
 * A screen as it appears inside an outlet of another screen: its content alone, without the shell the primary region wraps
 * every screen in, with the same name resolution.
 */
export function composeOutletScreen(application: ApplicationDocument, screen: Screen, options: CompositionOptions = {}): SceneElement {
    const { content } = screenContent(application, screen, options);
    const element = content.length === 1 ? content[0] : { id: `outlet-${screen.name}`, children: content } as unknown as SceneElement;
    return finish(element, profileOf(application, options), previewCatalog(options), options);
}

/**
 * A dialog template as it is shown over the application: its slot content inside the template wrapper, with the arrangement the
 * template wrote, names resolved - the same wrapper a screen's template gets.
 */
export function composeDialog(application: ApplicationDocument, template: DialogTemplate, options: CompositionOptions = {}): SceneElement {
    const element = externalComponent(`dialog-${template.name}`, previewTemplateComponent, { arrangement: template.arrangement }, template.content ?? {});
    return finish(element, profileOf(application, options), previewCatalog(options), options);
}

function configurationOf(application: ApplicationDocument, screen: Screen, options: CompositionOptions): EffectiveConfiguration | undefined {
    if (!options.descriptors || (application.instanceContributions ?? []).length === 0) return undefined;

    const templates = templatesOf(application, options);
    const document = { ...completeDocument(application), screenTemplates: templates, layouts: [...application.layouts, ...(options.blueprintLayouts ?? defaultLayouts).filter(layout => !application.layouts.some(own => own.name === layout.name))] };
    const chain = resolveTemplateChain(document, { kind: EditingScopeKind.Screen, name: screen.name });
    return resolveEffectiveConfiguration(chain, document.instanceContributions, options.descriptors);
}

/**
 * Every destination the document authors - on actions, navigations, contributions and toolbar items - wherever it sits, so a
 * route override on one of them can be deep linked.
 */
export function collectDestinations(application: ApplicationDocument): DestinationReference[] {
    const found: DestinationReference[] = [];
    const visit = (value: unknown) => {
        if (value === null || typeof value !== 'object') return;
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }

        for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
            if (key === 'destination' && entry !== null && typeof entry === 'object' && !Array.isArray(entry)) found.push(entry as DestinationReference);
            visit(entry);
        }
    };

    for (const screen of application.screens) {
        visit(screen.slotContent);
        visit(screen.contributions);
    }

    for (const template of [...application.screenTemplates, ...(application.dialogTemplates ?? [])]) visit(template.content);
    return found;
}
