// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode, Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ApplicationStructure, DestinationKind, DestinationReference, NavigationModel, SceneElement, Screen, SliceKind, Theme } from '@cratis/scene.model';
import {
    ApplicationStructureIndex, EffectiveNavItem, ProfileRegion, defaultNavigationMode, navigationModes, normalizeNavigationMode, resolveAppearance, resolveProfileIdentity, resolveToolbarButton,
} from '@cratis/scene.engine';
import {
    ComponentRegistry, NavigationActivation, NavigationActivationRequest, NavigationMode, SceneHistory, SceneThemeProvider, SliceCommandFieldsProvider, SliceCommandFieldsSource, SliceInvoker,
    SliceInvokerProvider, createDryRunInvoker, createMemorySceneHistory, sliceDialogDestination, themeTokenProperty, useSceneNavigation,
} from '@cratis/scene.react';
import { ColorScheme as ProfileColorScheme } from '@cratis/scene.model';
import { ColorScheme, LayoutMode, MenuTheme } from '../configuration';
import { ComponentName } from '../ComponentName';
import { externalComponent } from '../gallery/elements';
import { LayoutName, SlotName } from '../layouts';
import { previewProfile } from './previewProfile';
import { ApplicationDocument } from './ApplicationDocument';
import { ApplicationHost } from './ApplicationHost';
import { CompositionOptions, defaultForm, templatesOf } from './composeApplication';
import { diagnosePreview } from './diagnosePreview';
import { PreviewProblem, PreviewProblemCode, PreviewProblemSeverity, hasBlockingProblem } from './PreviewProblem';
import { PreviewProblemsView } from './PreviewProblemsView';
import { PreviewSampleData, createPreviewSampleData } from './previewSampleData';
import { findSliceFragment } from './PreviewSliceFragment';
import { screensForSlice, screensOwnedBy } from './sliceScreens';
import { SliceSurface, isDialogScreen, onNeutralSurface, presentsCommand, withDialogTitle, withoutFormSubmits } from './sliceSurface';
import { PreviewTarget } from './PreviewTarget';
import { PreviewRegionHandle, markRegions, measureRegion, regionOf } from './previewRegions';
import { PreviewInvocation, PreviewToast } from './PreviewToast';
import { PreviewPlan } from './resolvePreviewPlan';

export interface ScenePreviewHostProps {
    /** The document to preview - the in-memory one, unsaved edits included. */
    document: ApplicationDocument;

    /** The modules, features and slices of the application. */
    structure: ApplicationStructure | ApplicationStructureIndex;

    /** The application and module navigation regions; none when absent. */
    navigation?: NavigationModel;

    /** What to preview: the application itself, a module, a feature or a slice. */
    target: PreviewTarget;

    /**
     * Where the preview starts, in place of the target's own page: a screen (`{ screen }`) the document renders, or a dialog
     * (`{ dialog }`) opened over the page. The *Showing* picker's destinations (`listDestinations`) are valid here. One that the
     * document cannot render is reported as a `navigationInvalid` problem and ignored.
     */
    initialDestination?: DestinationReference;

    /**
     * What activating a navigation control does: `navigate` (the default) opens the destination in the preview; `select` only
     * reports it through `onActivate`, which is what a design host wants when a click selects the item. Alt-click selects in any
     * mode. A function decides per activation (spec N1, N2).
     */
    navigationMode?: NavigationMode | ((request: NavigationActivationRequest) => NavigationMode);

    /** Called for every activation of a navigation control, whether it navigated or only selected - the design host's selection hook. */
    onActivate?(activation: NavigationActivation): void;

    /** Called with the destination whenever the preview moves to another screen or dialog, whatever caused it: a click, the picker's history, the back button. */
    onNavigate?(destination: DestinationReference): void;

    /** The sample data to preview with; none when absent. */
    sampleData?: PreviewSampleData;

    /** The components to draw with. */
    registry: ComponentRegistry;

    /** What a submitted slice dialog goes through; a dry run, which only validates and reports, when absent (PRV5). */
    invoker?: SliceInvoker;

    /** Called for every dry run that passes validation, with what would have been sent. */
    onInvoked?(invocation: PreviewInvocation): void;

    /** The fields of a command, for the slice dialogs; the preview's sample rows fill their starting values. */
    fieldsFor?: SliceCommandFieldsSource;

    /** What the host decides about composition, such as the packages names resolve against. */
    composition?: CompositionOptions;

    /** The theme to apply; Studio passes the application's selected one (PRV9). */
    theme?: Theme;

    /** Hides a navigation item the preview user is not allowed to see. */
    isVisible?(item: EffectiveNavItem): boolean;

    /** Keeps the preview's navigation; an in-memory history by default, so a preview never touches the host's address (PRV4). */
    history?: SceneHistory;

    /** Called with the problems found - blocking or not - whenever they change (PRV8). */
    onProblems?(problems: PreviewProblem[]): void;

    /** Called when the author follows a problem to its node. */
    onSelectProblem?(problem: PreviewProblem): void;

    /** Called with what is being previewed, `Sales`, `Orders`, ... - the strip's breadcrumb (PRV7). */
    onBreadcrumbChange?(breadcrumb: string[]): void;

    /** Called when Escape is pressed with no dialog open: the host exits the preview (PRV7). */
    onExit?(): void;

    /**
     * The width of the viewport the preview is laid out for - a device preview's, not the window's. At a mobile width the menu is always a
     * drawer with a scrim, whatever the menu mode.
     */
    viewportWidth?: number;

    /** Called when the pointer enters a region (`identity`, `shell`, `menu`, `content`, `accent`) and with `null` when it leaves every region (N9). */
    onRegionHover?(region: ProfileRegion | null): void;

    /** Called when a region is clicked or chosen with Enter. A click on a navigation item still navigates, and also reports `menu` (N9). */
    onRegionActivate?(region: ProfileRegion): void;

    /** Filled with what a design host asks about regions: where one is drawn now (`regionRect`). */
    regions?: Ref<PreviewRegionHandle>;

    /** Extra content inside the host, such as a design layer's strip. */
    children?: ReactNode;
}

/** The colour scheme of the shell's wrapper for the profile's resolved scheme. */
const shellScheme = (scheme: ProfileColorScheme): ColorScheme => scheme === ProfileColorScheme.Dark ? ColorScheme.Dark : ColorScheme.Light;

const previewPageScreen = '#preview-page';
const noNavigation: NavigationModel = { application: { regions: [] }, modules: [] };

/** The page a slice preview happens over when its feature has no screen of its own, or a State View's fragment is shown. */
function minimalPage(layout: string, content: Screen['slotContent'][string]): Screen {
    return {
        name: previewPageScreen,
        layout,
        slotContent: { [SlotName.Content]: content },
        forms: [],
        contributions: [],
    };
}

/**
 * Renders the effective application (spec 10, PRV1-PRV9) from an in-memory document: the real shell, its navigation regions, the
 * first feature of a module, a feature, or a slice - a State Change slice as its task dialog over a minimal host page, a State View
 * slice as its data fragment.
 *
 * - **One code path**: the composition and the host are the Stage's own (`composeApplicationScreen`, `ApplicationHost`); nothing
 *   here draws a shell, a menu or a dialog (PRV9).
 * - **Read-only**: no design affordances, no edits (PRV8) - a toolbar button without a slice shows no warning badge here; it is
 *   reported as a problem instead. A model that cannot render - an unknown target, a feature without a screen,
 *   a layout or template nobody provides - gives a {@link PreviewProblemsView} and `onProblems`, not a blank screen.
 * - **Navigation** keeps to an in-memory history; a different module swaps the shell's effective navigation (PRV4).
 * - **Dialogs** submit through the dry-run invoker unless one is given: validation runs, nothing is sent, a toast says so (PRV5).
 * - **Data** is the active sample data pack's (PRV6); the same seed shows the same rows.
 * - The strip (`Previewing`, sample data, `Exit preview · Esc`) is the host application's: this reports the breadcrumb and calls
 *   `onExit` on Escape.
 */
export function ScenePreviewHost({
    document: application, structure, navigation = noNavigation, target, initialDestination, navigationMode, onActivate, onNavigate, sampleData, registry, invoker, onInvoked, fieldsFor, composition = {},
    theme, isVisible, history, onProblems, onSelectProblem, onBreadcrumbChange, onExit, viewportWidth, onRegionHover, onRegionActivate, regions, children,
}: ScenePreviewHostProps) {
    const index = useMemo(() => structure instanceof ApplicationStructureIndex ? structure : new ApplicationStructureIndex(structure), [structure]);
    const profile = useMemo(() => previewProfile(application.uiProfiles), [application.uiProfiles]);
    const identity = useMemo(() => resolveProfileIdentity(profile, navigation.application.logo?.title ?? profile.name), [navigation.application.logo?.title, profile]);
    const appearance = useMemo(() => resolveAppearance({ appearance: profile.appearance, theme }), [profile.appearance, theme]);
    const compose = useMemo<CompositionOptions>(() => ({ logo: navigation.application.logo, ...(profile.identity === undefined ? {} : { identity }), ...composition }), [composition, identity, navigation.application.logo, profile.identity]);
    const layoutConfig = useMemo(() => {
        const mode = normalizeNavigationMode(profile.root?.options?.navigationMode) ?? defaultNavigationMode;
        const menuTheme = profile.root?.options?.menuTheme;
        return {
            mode: (navigationModes.find(candidate => candidate.id === mode)?.legacy ?? LayoutMode.Static) as LayoutMode,
            menuTheme: (typeof menuTheme === 'string' && Object.values(MenuTheme).includes(menuTheme as MenuTheme) ? menuTheme : MenuTheme.Light) as MenuTheme,
            colorScheme: shellScheme(appearance.colorScheme),
        };
    }, [appearance.colorScheme, profile.root?.options]);
    const appearanceStyle = useMemo<CSSProperties>(
        () => Object.fromEntries(Object.entries(appearance.tokens).map(([token, value]) => [themeTokenProperty(token), value])) as CSSProperties,
        [appearance.tokens]);

    const hostRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(regions, () => ({ regionRect: region => hostRef.current ? measureRegion(hostRef.current, region) : undefined }), []);
    const designing = onRegionHover !== undefined || onRegionActivate !== undefined;
    useEffect(() => {
        const root = hostRef.current;
        if (!root) return;
        markRegions(root, designing);
        if (typeof MutationObserver === 'undefined') return;
        const observer = new MutationObserver(() => markRegions(root, designing));
        observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
        return () => observer.disconnect();
    });

    const hovered = useRef<ProfileRegion | null>(null);
    const onMouseOver = useCallback((event: ReactMouseEvent) => {
        const region = regionOf(event.target) ?? null;
        if (region === hovered.current) return;
        hovered.current = region;
        onRegionHover?.(region);
    }, [onRegionHover]);
    const onMouseLeave = useCallback(() => {
        if (hovered.current === null) return;
        hovered.current = null;
        onRegionHover?.(null);
    }, [onRegionHover]);
    const onClick = useCallback((event: ReactMouseEvent) => {
        const region = regionOf(event.target);
        if (region !== undefined) onRegionActivate?.(region);
    }, [onRegionActivate]);
    const onRegionKeyDown = useCallback((event: ReactKeyboardEvent) => {
        // Enter selects the region whose own tab stop has the focus; inside a region it belongs to the control that has it.
        if (event.key !== 'Enter' || !(event.target as Element).hasAttribute?.('data-scene-region')) return;
        const region = regionOf(event.target);
        if (region === undefined) return;
        event.preventDefault();
        onRegionActivate?.(region);
    }, [onRegionActivate]);
    const diagnosis = useMemo(
        () => diagnosePreview({ document: application, structure: index, navigation, target, initialDestination, packs: sampleData?.packs, composition: compose }),
        [application, compose, index, initialDestination, navigation, sampleData?.packs, target]);

    const problems = useMemo(() => {
        const found = [...diagnosis.problems];
        const { plan, screen } = diagnosis;
        if (plan?.kind === 'stateView' && screen && plan.slice) {
            const slice = index.findSlice(plan.slice);
            if (slice && findSliceFragment(screen, plan.slice, slice).length === 0) {
                found.push({ code: PreviewProblemCode.SliceFragmentMissing, severity: PreviewProblemSeverity.Warning, message: `Nothing on the screen '${screen.name}' is bound to the State View '${plan.slice}', so its page is shown.`, nodeId: plan.slice });
            }
        }

        return found;
    }, [diagnosis, index]);

    const key = JSON.stringify(problems);
    const reported = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (reported.current === key) return;
        reported.current = key;
        onProblems?.(problems);
    }, [key, onProblems, problems]);

    const breadcrumb = diagnosis.plan?.breadcrumb;
    const breadcrumbKey = breadcrumb?.join('\u0000');
    useEffect(() => {
        if (breadcrumb) onBreadcrumbChange?.(breadcrumb);
        // `breadcrumbKey` is the value of `breadcrumb`.
    }, [breadcrumbKey, onBreadcrumbChange]);

    const [memoryHistory] = useState(() => createMemorySceneHistory());
    const [toast, setToast] = useState<PreviewInvocation>();
    const dryRun = useMemo(() => createDryRunInvoker({
        onInvoked: invocation => {
            setToast(invocation);
            onInvoked?.(invocation);
        },
    }), [onInvoked]);

    const samples = useMemo(() => createPreviewSampleData(application, sampleData), [application, sampleData]);
    const fields = useMemo<SliceCommandFieldsSource>(() => (command, slice) => samples.commandFields(command, fieldsFor?.(command, slice) ?? []), [fieldsFor, samples]);

    const page = useMemo(() => {
        const { plan, screen } = diagnosis;
        if (!plan) return undefined;

        if (plan.kind === 'application') {
            const first = initialScreenOf(application, index, navigation, initialDestination);
            return first === undefined ? undefined : { screens: application.screens, initial: first };
        }

        // A slice previews exactly the screens it owns and the screens nobody owns - never another slice's - so nothing of the rest of the model
        // is composed, routed or drawn (Cratis/Scene#207).
        const screens = plan.slice === undefined ? application.screens : screensForSlice(application.screens, plan.slice);

        // And it previews only itself: its own UI once, in a neutral container - no root template, no navigation, no page of the feature around it
        // (Cratis/Scene#252). The command is presented once: by the screen the slice owns when that screen presents it, else by the task dialog.
        if (plan.slice !== undefined) return slicePage(plan, screen, screens, application, index, compose);

        if (!screen) return undefined;

        const requested = initialDestination?.screen;
        return { screens, initial: requested !== undefined && screens.some(candidate => candidate.name === requested) ? requested : screen.name };
    }, [application, compose, diagnosis, index, initialDestination, navigation]);

    const hostApplication = useMemo(() => page ? { ...application, screens: page.screens } : application, [application, page]);
    const hostComposition = useMemo<CompositionOptions>(() => page?.submitLabels === undefined ? compose : { ...compose, form: formWithSubmitLabels(compose, page.submitLabels) }, [compose, page?.submitLabels]);
    const navigationModel = useMemo(() => ({ structure: index, navigation, isVisible }), [index, isVisible, navigation]);

    // A preview of one slice draws only that slice's screens, so every other screen the navigation leads to is left out on purpose, not missing
    // (Cratis/StudioIssues#1021): the shell draws no problem marker for it. The Problems tab and the profile designer still report a target the
    // whole application lacks.
    const scopedToSlice = diagnosis.plan?.slice !== undefined;
    const leftOut = useMemo(() => scopedToSlice ? () => true : undefined, [scopedToSlice]);
    const policy = useMemo(() => ({ mode: navigationMode, onActivate, leftOut }), [leftOut, navigationMode, onActivate]);

    const onKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape' && !event.defaultPrevented) onExit?.();
    }, [onExit]);

    if (hasBlockingProblem(problems) || !page) {
        return <PreviewProblemsView problems={problems.filter(problem => problem.severity === PreviewProblemSeverity.Error)} onSelectProblem={onSelectProblem} />;
    }

    const body = (
        <SliceInvokerProvider invoker={invoker ?? dryRun} warnEmptySlices={false}>
            <SliceCommandFieldsProvider fieldsFor={fields}>
                <div
                    ref={hostRef}
                    className='scene-preview-host'
                    style={appearanceStyle}
                    data-scene-preview={diagnosis.plan?.kind}
                    data-preview-breadcrumb={breadcrumb?.join(' › ')}
                    data-scene-preview-surface={page?.surface}
                    onMouseOver={designing ? onMouseOver : undefined}
                    onMouseLeave={designing ? onMouseLeave : undefined}
                    onClick={designing ? onClick : undefined}
                    onKeyDown={designing ? onRegionKeyDown : undefined}>
                    <ApplicationHost
                        application={hostApplication}
                        composition={hostComposition}
                        navigationModel={navigationModel}
                        registry={registry}
                        initialScreen={page.initial}
                        history={history ?? memoryHistory}
                        navigationPolicy={policy}
                        layoutConfig={layoutConfig}
                        viewportWidth={viewportWidth}
                        resolveBinding={samples.resolveBinding}
                        queryResults={samples.queryResults}>
                        {diagnosis.plan?.kind === 'stateChange' && page?.surface === SliceSurface.TaskDialog && <OpenSliceDialog index={index} plan={diagnosis.plan} />}
                        <OpenInitialDialog destination={initialDestination} />
                        <ReportNavigation onNavigate={onNavigate} />
                        <EscapeToExit onKeyDown={onKeyDown} enabled={onExit !== undefined} />
                        {toast && invoker === undefined && <PreviewToast invocation={toast} onDismiss={() => setToast(undefined)} />}
                        {children}
                    </ApplicationHost>
                </div>
            </SliceCommandFieldsProvider>
        </SliceInvokerProvider>
    );

    return theme ? <SceneThemeProvider theme={theme}>{body}</SceneThemeProvider> : body;
}

/** What the host draws for the target: the screens, the one it starts on, and - for a slice - how the slice is presented. */
interface PreviewPage {
    screens: Screen[];
    initial: string;

    /** How a slice's own UI is presented; absent for an application, a module and a feature. */
    surface?: SliceSurface;

    /** The labels of the actions that became the submit of the form of their command, by command. */
    submitLabels?: Record<string, string>;
}

/** A form element that carries the label of the action that was its submit. */
function formWithSubmitLabels(composition: CompositionOptions, labels: Record<string, string>): NonNullable<CompositionOptions['form']> {
    return (screenName, form) => {
        const element = (composition.form ?? defaultForm)(screenName, form);
        const label = labels[form.forCommand];
        return label === undefined || (element as { properties?: unknown }).properties === undefined
            ? element
            : { ...element, properties: { ...(element as { properties: Record<string, unknown> }).properties, submitLabel: label } } as SceneElement;
    };
}

/**
 * What a slice preview draws (Cratis/Scene#252): the slice's own UI and nothing of the application around it.
 *
 * - The screens the slice owns go on the chrome-less full-page layout, so no root template, navigation or feature page is drawn.
 * - A screen that presents the slice's command - hosts its form or an action that executes it - is that presentation, and the task dialog does not open
 *   on top of it. A screen drawn from a dialog template is drawn as an opened dialog on a neutral backdrop; any other inline.
 * - A State Change slice whose screens do not present its command - or that owns none - opens its task dialog over what it owns, or over an empty neutral page.
 * - A State View slice shows the data fragment of its screen, or - owning none - of the feature page it is bound on; with nothing bound, that page whole
 *   (diagnosed as a warning), or a minimal page headed with where it is.
 */
function slicePage(plan: PreviewPlan, screen: Screen | undefined, screens: Screen[], application: ApplicationDocument, index: ApplicationStructureIndex, composition: CompositionOptions): PreviewPage {
    const slice = plan.slice!;
    const unowned = screens.filter(candidate => candidate.owner === undefined).map(onNeutralSurface);
    const owned = screensOwnedBy(screens, slice);
    const layout = LayoutName.FullPage;
    const header = () => externalComponent('preview-page-header', ComponentName.PageHeader, { title: plan.breadcrumb.slice(0, -1).join(' › ') || plan.breadcrumb[0] });
    const fragmentPage = (content: Screen['slotContent'][string]): Screen => minimalPage(layout, content);

    if (plan.kind === 'stateChange') {
        const stripped = owned.map(candidate => withoutFormSubmits(candidate));
        const presented = plan.command !== undefined && presentsCommand(owned, plan.command);
        if (!presented) {
            // Whatever the slice owns stays, but it does not present the command: the command is the task dialog, over that or - when the slice owns nothing - over an empty page.
            return {
                screens: [...stripped.map(candidate => onNeutralSurface(candidate.screen)), ...unowned, ...(owned.length === 0 ? [fragmentPage([])] : [])],
                initial: owned.length === 0 ? previewPageScreen : owned[0].name,
                surface: SliceSurface.TaskDialog,
            };
        }

        const labels = Object.assign({}, ...stripped.map(candidate => candidate.labels)) as Record<string, string>;
        const templates = templatesOf(application, composition);
        const dialog = isDialogScreen(owned[0], templates);
        const title = externalComponent('slice-dialog-title', ComponentName.PageHeader, { title: plan.breadcrumb[plan.breadcrumb.length - 1] });
        const drawn = (candidate: Screen) => dialog && candidate.name === owned[0].name ? withDialogTitle(candidate, templates.find(template => template.name === candidate.screenTemplate), title) : candidate;
        return {
            screens: [...stripped.map(candidate => onNeutralSurface(drawn(candidate.screen))), ...unowned],
            initial: owned[0].name,
            surface: dialog ? SliceSurface.Dialog : SliceSurface.Page,
            submitLabels: labels,
        };
    }

    const slicePosition = index.findSlice(slice);
    const fragment = screen && slicePosition ? findSliceFragment(screen, slice, slicePosition) : [];
    if (fragment.length > 0) return { screens: [...owned.map(onNeutralSurface), ...unowned, fragmentPage(fragment)], initial: previewPageScreen, surface: SliceSurface.Page };
    if (owned.length > 0) return { screens: [...owned.map(onNeutralSurface), ...unowned], initial: owned[0].name, surface: SliceSurface.Page };
    if (screen) return { screens: [...unowned], initial: screen.name, surface: SliceSurface.Page };
    return { screens: [...unowned, fragmentPage([header()])], initial: previewPageScreen, surface: SliceSurface.Page };
}

/**
 * The screen an application preview starts on: the initial destination's when the document renders it, else the screen the first
 * navigation item of the application leads to, else the document's first screen.
 */
function initialScreenOf(application: ApplicationDocument, index: ApplicationStructureIndex, navigation: NavigationModel, initial: DestinationReference | undefined): string | undefined {
    const has = (name: string | undefined): name is string => name !== undefined && application.screens.some(candidate => candidate.name === name);
    if (has(initial?.screen)) return initial?.screen;

    for (const region of navigation.application.regions) {
        for (const item of region.items) {
            const target = item.target;
            if (!target?.module) continue;
            const feature = target.feature === undefined ? index.firstFeatureId(target.module) : `${target.module}.${target.feature}`;
            if (has(feature)) return feature;
        }
    }

    return application.screens[0]?.name;
}

/** Opens the dialog an initial destination names, once the page is up. */
function OpenInitialDialog({ destination }: { destination: DestinationReference | undefined }) {
    const navigation = useSceneNavigation();
    const opened = useRef(false);
    useEffect(() => {
        if (opened.current || destination === undefined) return;
        if (destination.kind !== DestinationKind.Dialog && !destination.dialog) return;
        opened.current = true;
        navigation.navigate(destination);
    }, [destination, navigation]);

    return null;
}

/** Tells the host where the preview moved to - the screen in the primary region or the dialog over it - every time it changes after the first draw. */
function ReportNavigation({ onNavigate }: { onNavigate?(destination: DestinationReference): void }) {
    const { primaryScreen, currentDialog } = useSceneNavigation();
    const previous = useRef({ primaryScreen, currentDialog });
    useEffect(() => {
        const before = previous.current;
        previous.current = { primaryScreen, currentDialog };
        if (before.primaryScreen === primaryScreen && before.currentDialog === currentDialog) return;
        onNavigate?.(currentDialog === undefined ? { kind: DestinationKind.Outlet, screen: primaryScreen } : { kind: DestinationKind.Dialog, dialog: currentDialog });
    }, [currentDialog, onNavigate, primaryScreen]);

    return null;
}

/** Opens the task dialog of a State Change slice once the page is up - the slice preview (PRV3). */
function OpenSliceDialog({ index, plan }: { index: ApplicationStructureIndex; plan: PreviewPlan }) {
    const navigation = useSceneNavigation();
    const opened = useRef(false);
    useEffect(() => {
        if (opened.current || plan.slice === undefined) return;
        const slice = index.findSlice(plan.slice);
        if (!slice || slice.kind !== SliceKind.StateChange) return;

        const destination = sliceDialogDestination(resolveToolbarButton(index, { id: plan.slice, title: slice.name, slice: plan.slice }));
        if (destination === undefined) return;
        opened.current = true;
        navigation.navigate(destination);
    }, [index, navigation, plan.slice]);

    return null;
}

/** Exits the preview on Escape, unless something - an open dialog - already used the key. */
function EscapeToExit({ onKeyDown, enabled }: { onKeyDown(event: KeyboardEvent): void; enabled: boolean }) {
    const navigation = useSceneNavigation();
    const dialogOpen = navigation.currentDialog !== undefined;
    useEffect(() => {
        if (!enabled || dialogOpen) return undefined;
        globalThis.addEventListener('keydown', onKeyDown);
        return () => globalThis.removeEventListener('keydown', onKeyDown);
    }, [dialogOpen, enabled, onKeyDown]);

    return null;
}
