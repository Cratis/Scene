// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DestinationReference, DialogTemplate, EditingScopeKind, Form, Layout, SceneElement, Screen, ScreenTemplate, UiProfile,
    type ApplicationLogo, type EffectiveConfiguration,
} from '@cratis/scene.model';
import {
    DescriptorCatalog, PackageCatalog, resolveEffectiveConfiguration, resolveScreenTemplates, resolveTemplateChain,
} from '@cratis/scene.engine';
import {
    ComponentName, SlotName, defaultLayouts, externalComponent, galleryScreenTemplates, resolveElementComponentNames, shellComponentForLayout,
} from '@cratis/scene.blueprint.default';
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

function defaultForm(screenName: string, form: Form): SceneElement {
    return externalComponent(`form-${screenName}-${form.name}`, 'commandForm', {
        command: form.forCommand,
        label: form.name,
        generationMode: form.generationMode,
        layout: form.layout,
        fields: form.fields,
    });
}

function mergeSlots(...sources: (Record<string, SceneElement[]> | undefined)[]): Record<string, SceneElement[]> {
    const merged: Record<string, SceneElement[]> = {};
    for (const source of sources) {
        for (const [slot, elements] of Object.entries(source ?? {})) merged[slot] = [...(merged[slot] ?? []), ...elements];
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
function layoutSlotOf(layout: Layout | undefined, outermost: ScreenTemplate): string {
    const fits = outermost.fitsSlot;
    if (fits === undefined) return SlotName.Content;
    const slot = fits.includes('.') ? fits.slice(fits.lastIndexOf('.') + 1) : fits;
    return layout === undefined || layout.slots.some(candidate => candidate.name === slot) ? slot : SlotName.Content;
}

/** The templates a screen's own template sits inside, outermost first, ending with the screen's own template. */
export function templateChainOf(application: ApplicationDocument, screen: Screen, options: CompositionOptions = {}): ScreenTemplate[] {
    if (!screen.screenTemplate) return [];
    const templates = templatePoolFor(application, screen, options);
    const own = templates.find(candidate => candidate.name === screen.screenTemplate);
    if (!own) return [];

    const layout = findLayout(application, screen.layout, options);
    const placements = layout ? resolveScreenTemplates(layout, templates).placements : [];
    const chain: ScreenTemplate[] = [own];
    for (let guard = 0; guard <= templates.length; guard++) {
        const placement = placements.find(candidate => candidate.template === chain[0].name);
        if (!placement || placement.container === layout?.name) break;
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
        return { content: [...Object.values(screen.slotContent).flat(), ...forms], templates: [], slot: SlotName.Content };
    }

    let inner: SceneElement | undefined;
    for (let index = chain.length - 1; index >= 0; index--) {
        const template = chain[index];
        const slots = index === chain.length - 1
            ? mergeSlots(template.content, screen.slotContent, { forms })
            : mergeSlots(template.content, { [slotName(chain[index + 1])]: [inner!] });
        inner = externalComponent(`template-${screen.name}-${template.name}`, previewTemplateComponent, { arrangement: template.arrangement }, slots);
    }

    const layout = findLayout(application, screen.layout, options);
    return { content: [inner!], templates: chain.map(template => template.name), slot: layoutSlotOf(layout, chain[0]) };
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

    const shell = shellComponentForLayout(screen.layout) ?? screen.layout;
    const chrome = options.chrome
        ? options.chrome(screen, shell)
        : shell === ComponentName.FullPageShell ? {} : defaultApplicationChrome(options.logo);
    const composed = externalComponent(`screen-${screen.name}`, shell, { screenName: screen.name }, {
        ...chrome,
        [slot]: [...(chrome[slot] ?? []), ...content, ...(slot === SlotName.Content ? options.trailing ?? [] : [])],
    });

    return { element: finish(composed, profile, previewCatalog(options), options), configuration: configurationOf(application, screen, options), templates };
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
