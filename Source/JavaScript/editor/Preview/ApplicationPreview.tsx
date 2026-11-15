// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import '@cratis/scene.blueprint.default/styles.css';
import '@cratis/scene.primereact/primeReactTheme.css';
import '../ScreenEditor/Runtime/ProfileThemeRoot.css';
import '../ScreenEditor/Runtime/PortableComponents.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PreviewProblemCode, PreviewProblemSeverity, ScenePreviewHost, type PreviewProblem } from '@cratis/scene.blueprint.default';
import { IconAdapterProvider } from '@cratis/scene.react';
import type { DestinationReference, SampleDataPack } from '@cratis/scene.model';
import { profileColorSchemeClasses } from '../ScreenEditor/Runtime/profileColorScheme';
import { moduleOfDestination, moduleSectionsPackOf } from './moduleSections';
import { profileTheme } from '../ScreenEditor/Runtime/profileTheme';
import type { ScreenEditorRuntime } from '../ScreenEditor/Runtime/screenEditorRuntime';
import { CrashBoundary } from '../Crash/CrashBoundary';
import { PreviewStrip } from './PreviewStrip';
import type { PreviewNodeRef, PreviewScene } from './PreviewScene';
import type { PreviewStrings } from './PreviewStrings';
import { commandFieldsOfSchemas } from './commandFieldsOfSchemas';
import { sampleSetsOfCollections, withCollectionSets, type PreviewReadModel } from './previewReadModelRows';
import { previewApplicationOf, previewPacksOf, previewSampleDataCatalogOf, previewSampleDataOf } from './previewApplication';
import { previewTargetOf } from './previewTargetOf';
import { previewDataComponents } from './previewDataComponents';
import { previewActionComponents } from './previewActionComponents';
import { previewOutletComponents } from './previewOutlets';
import { PreviewPersonaContext, enablementPersonaOf, type PreviewAuthorizations, type PreviewPersona, type PreviewPersonaScope } from './previewPersona';
import { BindingsLens } from './Lens/BindingsLens';
import { defaultLensStrings } from './Lens/LensStrings';
import { unboundTextOf } from './Lens/unboundText';
import { unboundTextCode, type LensProblem } from './Lens/LensProblem';
import './ApplicationPreview.css';

export interface ApplicationPreviewProps {
    /** The scene the model compiled to, with the screens as the editor has them. Absent while it is being made, or when the model could not be compiled. */
    scene: PreviewScene | undefined;

    /** Why there is no scene, when the model could not be compiled: said in the strip, in place of the application. */
    failures?: readonly string[];

    /** Whether the scene is still being made. */
    loading?: boolean;

    /** What each node of the board is called in the scene. */
    nodes: readonly PreviewNodeRef[];

    /** The node preview was started from. */
    target: PreviewNodeRef;

    /** The runtime the screen editor draws with - the packages the application's UI Profile selects. The theme and density are its. */
    runtime: ScreenEditorRuntime;

    /** The application's own sample data packs. */
    ownPacks: readonly SampleDataPack[];

    /** The read models of the board, whose collections of records the sample data completes with rows of their own. */
    readModels?: readonly PreviewReadModel[];
    strings: PreviewStrings;

    /** Leaves the preview. The host - not the preview - restores what was selected and where the board was scrolled to. */
    onExit: () => void;

    /** Goes to the node a problem is about. */
    onShowNode: (node: PreviewNodeRef) => void;

    // What the Screenplay compiler found wrong with the wiring - a command nobody issues, a hook that does nothing - listed with the lens on.
    wiringProblems?: readonly LensProblem[];

    // The personas of the model, offered in the strip so the preview can be seen as one of them. Without any, the strip offers no selector.
    personas?: readonly PreviewPersona[];

    // What each slice's command asks of the persona, by the slice's dotted name in the scene.
    authorizations?: PreviewAuthorizations;

    // Called when the preview is first seen as a persona, so the host reads what each command asks of one only then.
    onPersonaChosen?: () => void;
}

/**
 * The preview of a module, a feature or a slice (spec 10): Scene's preview host - the Stage's own composition and navigation - given the scene of
 * the model as it is now, with unsaved edits, and a strip above it that names what is shown, lets the sample data be switched for this session, and exits.
 * Nothing is edited here and nothing is stored; the sample data chosen in the strip is an override that goes away with the preview (SD3).
 */
export const ApplicationPreview = (props: ApplicationPreviewProps) => (
    // Whatever throws while the application is composed or drawn stays in the preview and is said, with a way out: the screen is never blank.
    <CrashBoundary layout='fill' onClose={props.onExit} resetKeys={[props.target.sceneId]} context={crashContextOf(props.scene, props.target)}>
        <ApplicationPreviewContent {...props} />
    </CrashBoundary>
);

const crashContextOf = (scene: PreviewScene | undefined, target: PreviewNodeRef) => ({
    surface: 'The preview',
    details: { Target: target.sceneId, 'Root template': scene?.uiProfiles?.[0]?.root?.template.id },
});

const ApplicationPreviewContent = ({ scene, failures = [], loading = false, nodes, target, runtime, ownPacks, readModels = [], strings, onExit, onShowNode, wiringProblems = [], personas = [], authorizations, onPersonaChosen }: ApplicationPreviewProps) => {
    const [lens, setLens] = useState(false);
    const [personaName, setPersonaName] = useState<string | undefined>();
    const persona = useMemo(() => personas.find(candidate => candidate.name === personaName), [personas, personaName]);
    // Hooks are checked against the persona Scene is given; with none chosen they are not checked against anyone.
    const choosePersona = useCallback((name: string | undefined) => {
        setPersonaName(name);
        if (name !== undefined) onPersonaChosen?.();
    }, [onPersonaChosen]);
    const personaScope = useMemo<PreviewPersonaScope>(() => ({
        ...(authorizations ? { authorizations } : {}),
        ...(persona ? { persona: enablementPersonaOf(persona, authorizations ?? new Map()) } : {}),
    }), [persona, authorizations]);
    const [stage, setStage] = useState<HTMLDivElement | null>(null);
    const [sessionPack, setSessionPack] = useState<string | undefined>();
    const [breadcrumb, setBreadcrumb] = useState<readonly string[]>([]);
    const [problems, setProblems] = useState<readonly PreviewProblem[]>([]);

    const application = useMemo(() => scene && previewApplicationOf(scene, runtime), [scene, runtime]);
    const allPacks = useMemo(() => previewPacksOf(scene, runtime, ownPacks), [scene, runtime, ownPacks]);
    const { catalog, activePack } = useMemo(() => previewSampleDataCatalogOf(runtime, ownPacks, sessionPack), [runtime, ownPacks, sessionPack]);
    const collectionSets = useMemo(() => sampleSetsOfCollections(readModels), [readModels]);
    const packs = useMemo(() => withCollectionSets(allPacks, activePack, collectionSets), [allPacks, activePack, collectionSets]);
    // The module the shell navigated to, for the preview it was navigated in: a new target starts from its own module again.
    const [navigatedModule, setNavigatedModule] = useState<{ target: string; module: string } | undefined>();
    const sectionsModule = navigatedModule?.target === target.sceneId ? navigatedModule.module : target.sceneId;
    const sectionsPack = useMemo(() => moduleSectionsPackOf(scene?.structure, sectionsModule, [...(scene?.sampleDataPacks ?? []), ...ownPacks]), [scene, sectionsModule, ownPacks]);
    const sampleData = useMemo(() => previewSampleDataOf(sectionsPack ? [...packs, sectionsPack] : packs, sessionPack, sectionsPack?.id), [packs, sectionsPack, sessionPack]);
    const theme = useMemo(() => profileTheme(runtime), [runtime]);
    const fieldsFor = useMemo(() => commandFieldsOfSchemas(scene?.commandSchemas, scene?.screens), [scene?.commandSchemas, scene?.screens]);
    const previewTarget = useMemo(() => previewTargetOf(target), [target]);
    const navigated = useCallback((destination: DestinationReference) => {
        const module = application && moduleOfDestination(application.document.screens, destination);
        if (module) setNavigatedModule({ target: target.sceneId, module });
    }, [application, target.sceneId]);
    const registry = useMemo(() => application && scene ? { ...runtime.registry, ...previewDataComponents(application.document.screens), ...previewActionComponents, ...previewOutletComponents(scene) } : runtime.registry, [application, scene, runtime.registry]);

    const lensWords = strings.lens ?? defaultLensStrings;
    const unboundTexts = useMemo(() => unboundTextOf(scene?.screens ?? []), [scene]);
    const unboundIds = useMemo<ReadonlySet<string>>(() => new Set(unboundTexts.map(entry => entry.elementId)), [unboundTexts]);
    const lensProblems = useMemo<readonly LensProblem[]>(() => [
        ...unboundTexts.map(entry => ({ code: unboundTextCode, message: lensWords.unboundTextProblem.replace('{text}', entry.text).replace('{screen}', entry.screen) })),
        ...wiringProblems,
    ], [unboundTexts, wiringProblems, lensWords]);
    const toggleLens = useCallback(() => setLens(current => !current), []);

    const showNode = useCallback((problem: PreviewProblem) => {
        const node = nodes.find(candidate => candidate.sceneId === problem.nodeId) ?? nodes.find(candidate => problem.nodeId !== undefined && (candidate.sceneId.endsWith(`.${problem.nodeId}`) || problem.nodeId.startsWith(`${candidate.sceneId}.`)));
        onShowNode(node ?? target);
    }, [nodes, onShowNode, target]);
    const nameOfNode = useCallback((nodeId: string) => nodeId.slice(nodeId.lastIndexOf('.') + 1), []);
    const errors = useMemo<readonly PreviewProblem[]>(() => [
        ...failures.map((message): PreviewProblem => ({ code: PreviewProblemCode.StructureInvalid, severity: PreviewProblemSeverity.Error, message })),
        ...problems.filter(problem => problem.severity === 'error'),
    ], [failures, problems]);

    // The host leaves Escape to itself - and to a dialog that is open - while it draws the application. When it cannot draw one it draws only what is
    // wrong, with no one listening, so the strip is where Escape still means leaving.
    const blocked = !scene || errors.some(problem => problem.severity === 'error');
    useEffect(() => {
        if (!blocked) return undefined;
        const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented) onExit(); };
        globalThis.addEventListener('keydown', onKeyDown);
        return () => globalThis.removeEventListener('keydown', onKeyDown);
    }, [blocked, onExit]);

    if (!previewTarget) return null;

    return (
        <div className='studio-preview' data-studio-preview={target.kind} data-preview-target={target.sceneId}>
            <PreviewStrip breadcrumb={breadcrumb.length > 0 ? breadcrumb : target.sceneId.split('.')} catalog={catalog} activePack={activePack} onChooseSampleData={setSessionPack}
                problems={errors} onShowNode={showNode} nameOfNode={nameOfNode} onExit={onExit} strings={strings}
                lens={lens} onToggleLens={toggleLens} lensProblems={lensProblems}
                personas={personas} persona={persona?.name} onChoosePersona={choosePersona} />
            <div ref={setStage} className={`studio-preview__stage studio-profile-theme ${theme ? profileColorSchemeClasses(theme) : ''}`} data-preview-stage=''>
                {lens && <BindingsLens stage={stage} unbound={unboundIds} words={lensWords} />}
                {loading && <p className='studio-preview__status' role='status'>{strings.preparing}</p>}
                {scene && application && (
                    // A component that throws while drawing keeps the strip - and its way out - in place and is said in the stage.
                    <CrashBoundary layout='fill' resetKeys={[sessionPack]} context={{ ...crashContextOf(scene, target), surface: 'The preview of this screen' }}>
                    <PreviewPersonaContext.Provider value={personaScope}>
                    <IconAdapterProvider registry={runtime.iconAdapters}>
                        <ScenePreviewHost document={application.document} composition={application.composition} structure={scene.structure}
                            {...(scene.navigation ? { navigation: scene.navigation } : {})} target={previewTarget} sampleData={sampleData}
                            registry={registry} fieldsFor={fieldsFor} {...(theme ? { theme } : {})}
                            onNavigate={navigated} onProblems={setProblems} onBreadcrumbChange={setBreadcrumb} onExit={onExit} />
                    </IconAdapterProvider>
                    </PreviewPersonaContext.Provider>
                    </CrashBoundary>
                )}
            </div>
        </div>
    );
};
