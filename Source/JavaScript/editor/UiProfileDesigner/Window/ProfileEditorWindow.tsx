// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProfileRegion, ProfileSection, applyProfileFix, describeRegions, normalizeNavigationMode, NavigationMode } from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { WindowTitleBar } from '../../ScreenEditor/Host/WindowTitleBar';
import { viewportPresetSizes } from '../../ScreenEditor/Viewport/viewportPresets';
import { ViewportPreset } from '../../ScreenEditor/Viewport/ViewportPreset';
import { buildTemplateCatalog } from '../../ScreenTemplates/buildTemplateCatalog';
import { ownTemplateSource } from '../../ScreenTemplates/ownTemplateSource';
import { createProfileEditorContext } from '../Properties/createProfileEditorContext';
import type { ScreenEditorStrings } from '../../ScreenEditor/Inspector/ScreenEditorStrings';
import type { ProfileTemplates } from '../Properties/ProfileTemplateEditor';
import type { ApplicationTemplate } from '../../ScreenTemplates/ApplicationTemplate';
import type { ProfileUsage } from '../../UiProfile/ProfileUsage';
import type { UiProfileStrings } from '../../UiProfile/UiProfileStrings';
import type { AutosaveOutcome } from '../Autosave/AutosaveController';
import { SaveState } from '../Autosave/SaveState';
import { AppSection } from '../Inspector/AppSection';
import { LookSection } from '../Inspector/LookSection';
import { MenuSection } from '../Inspector/MenuSection';
import { PackagesSectionList } from '../Inspector/PackagesSectionList';
import { ProfileInspector, type ProfileInspectorHandle } from '../Inspector/ProfileInspector';
import { SampleDataSectionCards } from '../Inspector/SampleDataSectionCards';
import { ShellSectionCards } from '../Inspector/ShellSectionCards';
import { sectionOfRegion } from '../Inspector/ProfileSection';
import { askScene } from '../Inspector/sceneAnswers';
import { findProfileProblems } from '../Problems/findProfileProblems';
import { orderProblems, panelProblemsOfHost, panelProblemsOfScene, type PanelProblem } from '../Problems/panelProblems';
import { findSampleDataProblems } from '../SampleData/findSampleDataProblems';
import { describeSampleDataCatalog } from '@cratis/scene.engine';
import type { ProfileSampleDataInput } from '../SampleData/ProfileSampleData';
import { useProfileDesigner } from '../Session/useProfileDesigner';
import type { DesignedProfile } from '../Session/DesignedProfile';
import type { ShellHost } from '../Shell/ShellHost';
import { DesignerHeader, type Device } from '../Stage/DesignerHeader';
import { ProblemsPanel } from '../Stage/ProblemsPanel';
import { ProfileStage } from '../Stage/ProfileStage';
import { regimeOf } from '../Stage/regimeOf';
import { StatusBar } from '../Stage/StatusBar';
import type { StageFit } from '../Stage/stageScale';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { StarterBar } from './StarterBar';
import './ProfileEditorWindow.css';

export interface ProfileEditorWindowProps {
    opened: DesignedProfile;

    /** Whether the application has no UI profile yet: the starter bar shows above the preview. */
    isNew?: boolean;
    bundles: ScenePackageBundle[];
    applicationTemplates?: ApplicationTemplate[];
    usages?: ProfileUsage[];
    sampleData?: ProfileSampleDataInput;
    sampleDataStrings: Pick<UiProfileStrings, 'sampleData'>;
    strings: UiProfileDesignerStrings;

    /** The screen editor's strings, which the registry editors the sections reuse (the template picker) are drawn with. */
    editorStrings: ScreenEditorStrings;
    shellHost?: ShellHost;
    onSave: (settings: DesignedProfile) => Promise<AutosaveOutcome>;
}

const isTypingTarget = (target: EventTarget | null): boolean => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * The UI profile editor: a header, the preview as the way into one scrolling inspector, and a status bar. Click what you want to change in the preview
 * and the inspector takes you to it; the problems chip opens the problems with a one-click fix each. Everything it shows and every rule it applies is Scene's.
 */
export const ProfileEditorWindow = ({ opened, isNew = false, bundles, applicationTemplates = [], usages = [], sampleData, sampleDataStrings, strings, editorStrings, shellHost, onSave }: ProfileEditorWindowProps) => {
    const designer = useProfileDesigner({ opened, bundles, onSave });
    const inspector = useRef<ProfileInspectorHandle>(null);
    const [asking, setAsking] = useState(isNew);
    const [device, setDevice] = useState<Device>('desktop');
    const [hovered, setHovered] = useState<ProfileRegion | null>(null);
    const [active, setActive] = useState<ProfileRegion | undefined>();
    const [note, setNote] = useState<string | undefined>();
    const [problemsOpen, setProblemsOpen] = useState(false);
    const [fit, setFit] = useState<StageFit | undefined>();
    const size = viewportPresetSizes[device === 'mobile' ? ViewportPreset.Mobile : ViewportPreset.Desktop];
    const regime = useMemo(() => regimeOf(size.width, designer.settings.navigationMode), [size.width, designer.settings.navigationMode]);
    const mode = normalizeNavigationMode(designer.settings.navigationMode) ?? NavigationMode.Static;
    const regions = useMemo(() => describeRegions(mode, regime.touch, false), [mode, regime.touch]);

    const editorContext = useMemo(() => createProfileEditorContext(editorStrings), [editorStrings]);
    // The application's own templates as Scene reads them, so the preview draws an own shell from its document.
    const ownTemplates = useMemo(() => ownTemplateSource(applicationTemplates).screenTemplates ?? [], [applicationTemplates]);
    const answers = useMemo(() => askScene(designer.settings, bundles, usages, applicationTemplates), [designer.settings, bundles, usages, applicationTemplates]);
    const templates = useMemo<ProfileTemplates>(() => ({
        catalog: buildTemplateCatalog(designer.resolved, bundles, applicationTemplates),
        labels: strings.templatePicker,
        none: strings.properties.noNewScreenTemplate,
        unavailable: name => strings.properties.unavailableTemplate.replace('{name}', name),
        applicationTemplate: name => strings.properties.applicationTemplate.replace('{name}', name),
    }), [designer.resolved, bundles, applicationTemplates, strings]);
    const catalog = useMemo(() => describeSampleDataCatalog(bundles, (sampleData?.packs ?? []).map(pack => ({ id: pack.id, title: pack.title, locale: pack.locale })), designer.settings.sampleData?.activePack ?? ''), [bundles, sampleData, designer.settings.sampleData?.activePack]);

    const problems = useMemo<PanelProblem[]>(() => orderProblems([
        ...panelProblemsOfScene(answers.problems),
        ...panelProblemsOfHost([...findProfileProblems(designer.settings, designer.resolved, strings), ...findSampleDataProblems(designer.settings, sampleData, catalog, strings.problems)]),
    ]), [answers.problems, designer.settings, designer.resolved, strings, sampleData, catalog]);
    const refused = designer.saveState === SaveState.Failed && designer.saveMessages.length > 0 ? designer.saveMessages.join(' ') : undefined;

    const goTo = useCallback((section: ProfileSection) => inspector.current?.scrollTo(section), []);
    const selectRegion = useCallback((region: ProfileRegion) => {
        setActive(region);
        const section = sectionOfRegion(region, regions);
        if (section !== undefined) goTo(section);
    }, [regions, goTo]);
    const currentSection = useCallback((section: ProfileSection) => setActive(regions.find(region => region.section === section)?.id), [regions]);

    const fix = useCallback((problem: PanelProblem) => {
        if (problem.fix === undefined) return;
        const fixed = applyProfileFix(answers.profile, problem.fix, answers.manifests);
        const next: DesignedProfile = { ...designer.settings };
        // Scene answers the profile after the fix; what it changed is written back into the settings the designer edits.
        if (fixed.appearance?.accent === undefined && designer.settings.accent !== '') next.accent = '';
        if (fixed.identity?.logo?.kind !== designer.settings.identity?.logo?.kind && fixed.identity !== undefined) next.identity = fixed.identity;
        if (fixed.root === undefined && designer.settings.root !== undefined) { next.root = undefined; next.shell = ''; }
        if (fixed.root?.options?.navigationMode !== designer.settings.root?.options?.navigationMode && typeof fixed.root?.options?.navigationMode === 'string') {
            next.root = fixed.root as DesignedProfile['root'];
            next.navigationMode = 'drawer' as DesignedProfile['navigationMode'];
        }
        if (fixed.packages.length !== answers.profile.packages.length) next.packages = fixed.packages.filter(name => name !== 'core');
        designer.edit(next, problem.fix.label);
        setNote(problem.fix.label);
    }, [answers, designer]);

    const { undo, redo } = designer;
    const keyDown = useCallback((event: KeyboardEvent) => {
        if (isTypingTarget(event.target)) return;
        const modifier = event.metaKey || event.ctrlKey;
        if (modifier && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
        else if (modifier && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
    }, [undo, redo]);
    useEffect(() => {
        window.addEventListener('keydown', keyDown);
        return () => window.removeEventListener('keydown', keyDown);
    }, [keyDown]);

    const header = (
        <DesignerHeader applicationName={designer.settings.applicationName} strings={strings} saveState={designer.saveState} onRetry={designer.retry}
            undoLabel={designer.canUndo ? designer.undoLabel ?? '' : undefined} redoLabel={designer.canRedo ? designer.redoLabel ?? '' : undefined}
            onUndo={designer.undo} onRedo={designer.redo} device={device} onDevice={setDevice} />
    );

    const edit = designer.edit;
    const sections: Record<ProfileSection, React.ReactNode> = {
        [ProfileSection.App]: <AppSection settings={designer.settings} bundles={bundles} templates={templates} editorContext={editorContext} strings={strings} onEdit={edit} />,
        [ProfileSection.Shell]: <ShellSectionCards settings={designer.settings} bundles={bundles} answers={answers} host={shellHost} applicationTemplates={applicationTemplates} strings={strings} onEdit={edit} onNote={setNote} />,
        [ProfileSection.Look]: <LookSection settings={designer.settings} bundles={bundles} answers={answers} strings={strings} onEdit={edit} onNote={setNote} />,
        [ProfileSection.Menu]: <MenuSection settings={designer.settings} strings={strings} onEdit={edit} />,
        [ProfileSection.Packages]: <PackagesSectionList settings={designer.settings} answers={answers} strings={strings} onEdit={edit} onNote={setNote} />,
        [ProfileSection.SampleData]: <SampleDataSectionCards settings={designer.settings} bundles={bundles} sampleData={sampleData} pickerStrings={sampleDataStrings} strings={strings} onEdit={edit} />,
    };

    return (
        <div className='studio-profile-editor' role='group' aria-label={strings.windowLabel}>
            <WindowTitleBar controls={header} />
            <div className='studio-profile-editor__body'>
                <div className='studio-profile-editor__stage' role='region' aria-label={strings.editor.stage}>
                    {asking && <StarterBar strings={strings} onKeep={() => setAsking(false)} onChooseBlueprint={() => { goTo(ProfileSection.Shell); setAsking(false); }} onChooseOwnShell={() => { goTo(ProfileSection.Shell); setAsking(false); }} />}
                    <ProfileStage settings={designer.settings} applicationName={designer.settings.applicationName} resolved={designer.resolved} bundles={bundles} strings={strings} size={size} touch={regime.touch} packs={sampleData?.packs}
                        samplePack={designer.settings.sampleData?.activePack ?? ''} ownTemplates={ownTemplates} activeRegion={active} onSelectRegion={selectRegion} onHoverRegion={setHovered} onFit={setFit} />
                </div>
                <aside className='studio-profile-editor__inspector' aria-label={strings.editor.inspector}>
                    <ProfileInspector ref={inspector} strings={strings} sections={sections} onCurrentSection={currentSection} />
                </aside>
            </div>
            {problemsOpen && <ProblemsPanel strings={strings} problems={problems} refused={refused} onGoTo={section => { goTo(section); }} onFix={fix} onClose={() => setProblemsOpen(false)} />}
            <StatusBar strings={strings} note={note} hoveredRegion={hovered === null ? undefined : regions.find(region => region.id === hovered)?.label}
                size={size} touch={regime.touch} widthClass={regime.widthClass} regimeNote={regime.note} problemCount={problems.length} problemsOpen={problemsOpen} onToggleProblems={() => setProblemsOpen(value => !value)} />
            <span hidden>{fit?.scale}</span>
        </div>
    );
};
