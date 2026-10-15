// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApplicationStructure, NavigationModel, Screen, SliceKind, Theme } from '@cratis/scene.model';
import { ApplicationStructureIndex, EffectiveNavItem, resolveToolbarButton } from '@cratis/scene.engine';
import {
    ComponentRegistry, SceneHistory, SceneThemeProvider, SliceCommandFieldsProvider, SliceCommandFieldsSource, SliceInvoker,
    SliceInvokerProvider, createDryRunInvoker, createMemorySceneHistory, sliceDialogDestination, useSceneNavigation,
} from '@cratis/scene.react';
import { ComponentName, LayoutName, SlotName, externalComponent } from '@cratis/scene.blueprint.default';
import { previewProfile } from './previewProfile';
import { ApplicationDocument } from './ApplicationDocument';
import { ApplicationHost } from './ApplicationHost';
import { CompositionOptions } from './composeApplication';
import { diagnosePreview } from './diagnosePreview';
import { PreviewProblem, PreviewProblemCode, PreviewProblemSeverity, hasBlockingProblem } from './PreviewProblem';
import { PreviewProblemsView } from './PreviewProblemsView';
import { PreviewSampleData, createPreviewSampleData } from './previewSampleData';
import { findSliceFragment } from './PreviewSliceFragment';
import { PreviewTarget } from './PreviewTarget';
import { PreviewInvocation, PreviewToast } from './PreviewToast';
import { PreviewPlan } from './resolvePreviewPlan';

export interface ScenePreviewHostProps {
    /** The document to preview - the in-memory one, unsaved edits included. */
    document: ApplicationDocument;

    /** The modules, features and slices of the application. */
    structure: ApplicationStructure | ApplicationStructureIndex;

    /** The application and module navigation regions; none when absent. */
    navigation?: NavigationModel;

    /** What to preview: a module, a feature or a slice. */
    target: PreviewTarget;

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

    /** Extra content inside the host, such as a design layer's strip. */
    children?: ReactNode;
}

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
    document: application, structure, navigation = noNavigation, target, sampleData, registry, invoker, onInvoked, fieldsFor, composition = {},
    theme, isVisible, history, onProblems, onSelectProblem, onBreadcrumbChange, onExit, children,
}: ScenePreviewHostProps) {
    const index = useMemo(() => structure instanceof ApplicationStructureIndex ? structure : new ApplicationStructureIndex(structure), [structure]);
    const compose = useMemo<CompositionOptions>(() => ({ logo: navigation.application.logo, ...composition }), [composition, navigation.application.logo]);
    const diagnosis = useMemo(
        () => diagnosePreview({ document: application, structure: index, navigation, target, packs: sampleData?.packs, composition: compose }),
        [application, compose, index, navigation, sampleData?.packs, target]);

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

        if (!screen) {
            // A slice whose feature has no screen of its own: a minimal host page, headed with where it is.
            if (plan.slice === undefined) return undefined;
            const layout = previewProfile(application.uiProfiles).layout ?? LayoutName.AppShell;
            const header = externalComponent('preview-page-header', ComponentName.PageHeader, { title: plan.breadcrumb.slice(0, -1).join(' › ') || plan.breadcrumb[0] });
            return { screens: [...application.screens, minimalPage(layout, [header])], initial: previewPageScreen };
        }

        if (plan.kind === 'stateView' && plan.slice) {
            const slice = index.findSlice(plan.slice);
            const fragment = slice ? findSliceFragment(screen, plan.slice, slice) : [];
            if (fragment.length > 0) return { screens: [...application.screens, minimalPage(screen.layout, fragment)], initial: previewPageScreen };
        }

        return { screens: application.screens, initial: screen.name };
    }, [application.screens, application.uiProfiles, diagnosis, index]);

    const hostApplication = useMemo(() => page ? { ...application, screens: page.screens } : application, [application, page]);
    const navigationModel = useMemo(() => ({ structure: index, navigation, isVisible }), [index, isVisible, navigation]);

    const onKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape' && !event.defaultPrevented) onExit?.();
    }, [onExit]);

    if (hasBlockingProblem(problems) || !page) {
        return <PreviewProblemsView problems={problems.filter(problem => problem.severity === PreviewProblemSeverity.Error)} onSelectProblem={onSelectProblem} />;
    }

    const body = (
        <SliceInvokerProvider invoker={invoker ?? dryRun} warnEmptySlices={false}>
            <SliceCommandFieldsProvider fieldsFor={fields}>
                <div className='scene-preview-host' data-scene-preview={diagnosis.plan?.kind} data-preview-breadcrumb={breadcrumb?.join(' › ')}>
                    <ApplicationHost
                        application={hostApplication}
                        composition={compose}
                        navigationModel={navigationModel}
                        registry={registry}
                        initialScreen={page.initial}
                        history={history ?? memoryHistory}
                        resolveBinding={samples.resolveBinding}
                        queryResults={samples.queryResults}>
                        {diagnosis.plan?.kind === 'stateChange' && <OpenSliceDialog index={index} plan={diagnosis.plan} />}
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
