// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentName, defaultBlueprint, defaultForm, defaultLayouts, externalComponent, onNeutralSurface, shellComponentForLayout, type ApplicationDocument, type CompositionOptions, type PreviewSampleData } from '@cratis/scene.blueprint.default';
import { describeSampleDataCatalog, type SampleDataCatalog } from '@cratis/scene.engine';
import { TemplateReferenceSource, type DialogTemplate, type SampleDataPack, type Screen, type ScreenTemplate, type UiProfile } from '@cratis/scene.model';
import type { ScreenEditorRuntime } from '../ScreenEditor/Runtime/screenEditorRuntime';
import { screenPresentationOf } from '../ScreenEditor/Templates/dialogPresentation';
import { blueprintDialogTemplatesOf } from '../ScreenEditor/Templates/displayedFits';
import type { PreviewScene } from './PreviewScene';
import { profileWithQueryMappings } from './previewSampleDataMappings';
import { dialogTitleOf } from '../ScreenEditor/Templates/dialogTitle';
import { sentByTheDialogProperty } from './sentByTheDialog';
import { templatedFeaturePages } from './templatedFeaturePages';

/**
 * The screens the preview host looks at.
 *
 * Where a feature's page is the screen named by the feature's qualified id (`Sales.Orders`): a screen the Screenplay compiled is named for its role
 * and carries where it lives in `path` - module, then features - which is what Stage places it by. So a screen with a path is also offered under the
 * qualified id of the feature it belongs to - an alias, the same screen - and the screen itself stays under its own name for everything that refers to
 * it. The first screen of a feature is its page.
 *
 * And the shell: a screen the editor authored sits on the editor's one-slot `StudioScreen` layout, which is not a shell any package draws. The
 * application's UI Profile selects the shell (`layout`), so such a screen is shown in it, the way the render plan places a screen on the profile's
 * layout. A screen already on a shell stays where it is.
 *
 * A screen that states it fits a dialog or a drawer (see `screenPresentationOf`), or - stating nothing - is built from a dialog template, is not a page of the application: it opens over one. It is put on Scene's neutral
 * surface - no root template, no navigation - so the preview shows the popup, not the application around it.
 *
 * @param screens The screens of the scene.
 * @param profileLayout The shell the application's UI Profile selects, when it selects one.
 * @param dialogTemplates The dialog templates the document declares and the blueprints provide (not those a screen template of the document stands for), which tell a screen built from one is a dialog.
 * @returns The screens, and for each feature page the alias that names it.
 */
export function previewScreensOf(screens: readonly Screen[], profileLayout?: string, dialogTemplates: readonly DialogTemplate[] = []): Screen[] {
    const opensOver = (screen: Screen): boolean => screenPresentationOf(screen, [], false, dialogTemplates.map(template => template.name)) !== undefined;
    const onShell = (screen: Screen): Screen => opensOver(screen) ? onNeutralSurface(screen) : profileLayout && shellComponentForLayout(screen.layout) === undefined && shellComponentForLayout(profileLayout) !== undefined ? { ...screen, layout: profileLayout } : screen;
    const placed = screens.map(onShell);
    const named = new Set(placed.map(screen => screen.name));
    const aliases: Screen[] = [];
    for (const screen of placed) {
        const qualified = screen.path && screen.path.length >= 2 ? screen.path.join('.') : undefined;
        if (qualified === undefined || named.has(qualified)) continue;
        named.add(qualified);
        aliases.push({ ...screen, name: qualified });
    }

    return [...placed, ...aliases];
}

/**
 * The dialog templates the screens of the scene are built from, drawn as the templates they are.
 *
 * A Screenplay screen is written `template blueprint Cratis.Blueprint.Default QuickCreateDialog`: the template is a dialog template, which the document
 * declares itself or the blueprint provides. The preview host composes a screen from the screen templates only, so such a screen was refused with
 * `templateMissing` (Cratis/StudioIssues#893). A dialog template is a screen template that fits no slot - it is summoned, not placed - so, handed to the
 * host as one, the screen is drawn on the application's shell with the dialog's own frame. Only the dialog templates a screen uses are handed over, so a
 * dialog's slots (header, body, actions) never compete with the slots of the screen templates the other screens are drawn in.
 *
 * @param scene The scene the model compiled to.
 * @param runtime The runtime, whose bundles are the blueprints in play.
 * @param screens The screens the host is given.
 * @returns The dialog templates the screens name that no screen template of the document stands for, the document's own before the blueprints'.
 */
export function dialogTemplatesUsedBy(scene: Pick<PreviewScene, 'screenTemplates' | 'dialogTemplates'>, runtime: Pick<ScreenEditorRuntime, 'bundles'>, screens: readonly Screen[]): ScreenTemplate[] {
    const used = new Set(screens.map(screen => screen.screenTemplate).filter((name): name is string => name !== undefined));
    const taken = new Set(scene.screenTemplates.map(template => template.name));
    const found = new Map<string, DialogTemplate>();
    for (const template of [...(scene.dialogTemplates ?? []), ...runtime.bundles.flatMap(bundle => bundle.dialogTemplates ?? [])]) {
        if (used.has(template.name) && !taken.has(template.name) && !found.has(template.name)) found.set(template.name, template);
    }

    return [...found.values()];
}

/**
 * The screens with the slots they do not fill left empty, so the blueprint's own sample copy does not show in their place.
 *
 * A blueprint template seeds each of its slots with placeholder content - the sample header, search box and empty states of the blueprint's own demo
 * ("Deals", "Search deals", "Nothing here yet"). A screen that fills a slot replaces that slot's seed (Scene 4.70.1), but a screen written in Screenplay
 * fills the slots it has something for - a list screen fills `header` and `list` - and the seeds of the others drew beside it. A slot the screen does
 * not fill is an explicitly empty fill in the preview (Cratis/StudioIssues#895); the template itself, and so the editor's blank template and the gallery,
 * keep their seeds.
 *
 * @param screens The screens the host is given.
 * @param templates The screen templates in play: the document's, the dialog templates the screens use and the blueprints'.
 * @returns The screens, each with every slot of its template filled or explicitly empty.
 */
export function withoutSeededSlots(screens: readonly Screen[], templates: readonly Pick<ScreenTemplate, 'name' | 'slots'>[]): Screen[] {
    const slotsOf = new Map<string, string[]>();
    for (const template of templates) if (!slotsOf.has(template.name)) slotsOf.set(template.name, template.slots.map(slot => slot.name));
    return screens.map(screen => {
        const slots = screen.screenTemplate === undefined ? undefined : slotsOf.get(screen.screenTemplate);
        if (slots === undefined) return screen;
        const unfilled = slots.filter(slot => screen.slotContent[slot] === undefined);
        return unfilled.length === 0 ? screen : { ...screen, slotContent: { ...screen.slotContent, ...Object.fromEntries(unfilled.map(slot => [slot, []])) } };
    });
}

const firstOfEachName = <T extends { name: string }>(items: readonly T[]): T[] => {
    const seen = new Set<string>();
    return items.filter(item => !seen.has(item.name) && !!seen.add(item.name));
};

/**
 * The templates and layouts the blueprints provide, which Scene's composition resolves a name from when the document does not declare it
 * (`CompositionOptions.blueprintTemplates` and `blueprintLayouts`). Giving either replaces Scene's own fallback to the Default blueprint, so the Default
 * blueprint's come first, then those of every other bundle - the templates of a domain blueprint such as Ticketing, which a screen written
 * `template blueprint Cratis.Blueprint.Ticketing TicketCreateForm` was refused for with `templateMissing` (Cratis/StudioIssues#1117). A name that two
 * blueprints provide resolves to the first. They are options of the composition, not declarations of the document, so the document's own templates and
 * layouts keep their precedence.
 *
 * @param runtime The runtime, whose bundles are the blueprints in play.
 * @returns The templates and the layouts, each name once.
 */
export function blueprintFallbacksOf(runtime: Pick<ScreenEditorRuntime, 'bundles'>): Required<Pick<CompositionOptions, 'blueprintTemplates' | 'blueprintLayouts'>> {
    return {
        blueprintTemplates: firstOfEachName([...(defaultBlueprint.screenTemplates ?? []), ...runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? [])]),
        blueprintLayouts: firstOfEachName([...defaultLayouts, ...runtime.bundles.flatMap(bundle => bundle.layouts ?? [])]),
    };
}

/** What the preview host is given, made from the scene and the runtime the editor draws with. */
export interface PreviewApplication {
    document: ApplicationDocument;
    composition: CompositionOptions;
}

const identifierPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The profile with a root template the document can resolve. The application stores its own root template by identifier, while the document's templates
 * and layouts are named, so a stored root cannot be found among them and the preview fell back to the blueprint's shell - which then shares its slot names
 * with the application's own root template, and every screen on an own template was refused as unplaced. The model compiled to a profile whose root is
 * named, so that root stands in for a stored one that names no template of the document.
 *
 * @param profile The profile the preview draws with.
 * @param scene The scene the model compiled to.
 * @returns The profile, with the compiled root in place of a stored root that names nothing in the document.
 */
export function withRootNamedInScene(profile: UiProfile, scene: Pick<PreviewScene, 'layouts' | 'screenTemplates' | 'uiProfiles'>): UiProfile {
    const stored = profile.root?.template;
    if (stored === undefined || stored.source !== TemplateReferenceSource.Own || !identifierPattern.test(stored.id)) return profile;

    const names = new Set([...scene.layouts.map(layout => layout.name), ...scene.screenTemplates.map(template => template.name)]);
    const compiled = scene.uiProfiles?.map(candidate => candidate.root).find(root => root?.template.source === TemplateReferenceSource.Own && names.has(root.template.id));
    return compiled === undefined ? profile : { ...profile, root: { ...compiled, options: { ...compiled.options, ...profile.root?.options } } };
}

/**
 * The document and the composition options the preview host renders: the scene's screens, layouts and templates, drawn with the packages and the
 * UI Profile the application's editor draws with (spec PRV9 - the theme and density are the application's, not the preview's).
 *
 * @param scene The scene the model compiled to.
 * @param runtime The runtime the screen editor draws with - the packages the UI Profile selects.
 * @returns What `ScenePreviewHost` takes.
 */
export function previewApplicationOf(scene: PreviewScene, runtime: ScreenEditorRuntime): PreviewApplication {
    const ownScreenTemplates = new Set(scene.screenTemplates.map(template => template.name));
    const knownDialogs = [...(scene.dialogTemplates ?? []), ...blueprintDialogTemplatesOf(runtime.bundles)].filter(template => !ownScreenTemplates.has(template.name));
    const placed = previewScreensOf([...scene.screens, ...templatedFeaturePages(scene, runtime.profile.layout)], runtime.profile.layout, knownDialogs);
    const dialogTemplates = dialogTemplatesUsedBy(scene, runtime, placed);
    const screens = withDialogTitles(withoutSeededSlots(placed, [...scene.screenTemplates, ...dialogTemplates, ...runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? [])]), dialogTemplates);
    const profile = profileWithQueryMappings(withRootNamedInScene(runtime.compositionProfile, scene), [screens, scene.screenTemplates, scene.dialogTemplates ?? []]);
    return {
        document: {
            layouts: scene.layouts,
            screenTemplates: [...scene.screenTemplates, ...dialogTemplates],
            dialogTemplates: scene.dialogTemplates,
            screens,
            exposures: scene.exposures ?? [],
            instanceContributions: scene.instanceContributions ?? [],
            uiProfiles: [profile],
            themes: scene.themes ?? [],
        },
        composition: { profile, catalog: runtime.packages, ...blueprintFallbacksOf(runtime), form: formSentByItsDialog(screens, dialogTemplates) },
    };
}

/**
 * The screens drawn from a dialog template with the dialog's title in the template's empty header: what the dialog's form does (`dialogTitleOf`), as the screen
 * editor's frame says it, so the preview does not head the dialog with the slice's name.
 *
 * @param screens The screens of the preview.
 * @param dialogTemplates The dialog templates the screens are drawn from.
 * @returns The screens, a dialog's header filled when it has a form and its header is empty.
 */
export function withDialogTitles(screens: readonly Screen[], dialogTemplates: readonly Pick<ScreenTemplate, 'name' | 'slots'>[]): Screen[] {
    return screens.map(screen => {
        const template = dialogTemplates.find(candidate => candidate.name === screen.screenTemplate);
        const title = dialogTitleOf(screen);
        if (!template || title === undefined || !template.slots.some(slot => slot.name === 'header') || (screen.slotContent.header ?? []).length > 0) return screen;
        return { ...screen, slotContent: { ...screen.slotContent, header: [externalComponent(`dialog-title-${screen.name}`, ComponentName.PageHeader, { title })] } };
    });
}

/**
 * The element a screen's form becomes: Scene's, marked as sent by the dialog when the screen is drawn from a dialog template. The dialog's own button row - Cancel
 * and Submit - sends it then, as the screen editor draws it, so the form does not add a second button of its own.
 *
 * @param screens The screens of the preview.
 * @param dialogTemplates The dialog templates the screens are drawn from.
 * @returns What the composition makes of a form.
 */
export function formSentByItsDialog(screens: readonly Screen[], dialogTemplates: readonly Pick<ScreenTemplate, 'name'>[]): NonNullable<CompositionOptions['form']> {
    const dialogs = new Set(dialogTemplates.map(template => template.name));
    const inDialog = new Set(screens.filter(screen => screen.screenTemplate !== undefined && dialogs.has(screen.screenTemplate)).map(screen => screen.name));
    return (screenName, form) => {
        const element = defaultForm(screenName, form);
        return inDialog.has(screenName) ? { ...element, properties: { ...(element as { properties: Record<string, unknown> }).properties, [sentByTheDialogProperty]: true } } as typeof element : element;
    };
}

/**
 * Every sample data pack a preview can draw from: those a blueprint ships, those the model carries, and the application's own, the application's own
 * standing in for a pack of the same identifier.
 *
 * @param scene The scene the model compiled to.
 * @param runtime The runtime, whose bundles are the blueprints in play.
 * @param ownPacks The application's own packs.
 * @returns The packs.
 */
export function previewPacksOf(scene: PreviewScene | undefined, runtime: Pick<ScreenEditorRuntime, 'bundles'>, ownPacks: readonly SampleDataPack[]): SampleDataPack[] {
    const packs = new Map<string, SampleDataPack>();
    for (const pack of [...runtime.bundles.flatMap(bundle => (bundle as { packs?: SampleDataPack[] }).packs ?? []), ...(scene?.sampleDataPacks ?? []), ...ownPacks]) packs.set(pack.id, pack);
    return [...packs.values()];
}

/**
 * What the strip's selector offers, and which pack is in effect: Scene's own description of the blueprints' packs, the application's and the generated
 * data (spec SD3), the pack in effect being the session's choice where there is one and the application's otherwise.
 *
 * @param runtime The runtime, whose bundles are the blueprints in play and whose profile holds the application's choice.
 * @param ownPacks The application's own packs.
 * @param sessionPack The pack this preview session chose - `''` for the generated data - or `undefined` when it chose none.
 * @returns The catalog and the pack in effect.
 */
export function previewSampleDataCatalogOf(runtime: Pick<ScreenEditorRuntime, 'bundles' | 'profile'>, ownPacks: readonly SampleDataPack[], sessionPack: string | undefined): { catalog: SampleDataCatalog; activePack: string } {
    const activePack = sessionPack ?? runtime.profile.sampleData?.activePack ?? '';
    return { catalog: describeSampleDataCatalog(runtime.bundles, ownPacks.map(pack => ({ id: pack.id, title: pack.title, locale: pack.locale })), activePack), activePack };
}

/**
 * The sample data the preview host is given. The strip's choice is `sessionActivePack` - an override of the application's setting for as long as the
 * preview is open, and nothing is stored from it: the application's own choice is made on the UI Profile page, once, for every screen (SD3).
 *
 * @param packs Every pack available.
 * @param sessionPack The pack this preview session chose, if it chose one.
 * @param blueprintDefaultPack The pack asked last, behind the pack in effect - what the host falls back to.
 * @returns The sample data.
 */
export function previewSampleDataOf(packs: SampleDataPack[], sessionPack: string | undefined, blueprintDefaultPack?: string): PreviewSampleData {
    return { packs, ...(sessionPack === undefined ? {} : { sessionActivePack: sessionPack }), ...(blueprintDefaultPack === undefined ? {} : { blueprintDefaultPack }) };
}
