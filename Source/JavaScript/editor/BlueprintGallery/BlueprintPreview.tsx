// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useState } from 'react';
import type { SampleDataPack } from '@cratis/scene.model';
import '@cratis/scene.blueprint.default/styles.css';
import '@cratis/scene.primereact/primeReactTheme.css';
import '../ScreenEditor/Runtime/ProfileThemeRoot.css';
import '../ScreenEditor/Runtime/PortableComponents.css';
import { ScenePreviewHost, type PreviewProblem } from '@cratis/scene.blueprint.default';
import { describeBlueprintCatalog, describeSampleDataCatalog } from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { IconAdapterProvider } from '@cratis/scene.react';
import { PreviewStrip } from '../Preview/PreviewStrip';
import { profileColorSchemeClasses } from '../ScreenEditor/Runtime/profileColorScheme';
import { profileTheme } from '../ScreenEditor/Runtime/profileTheme';
import { createScreenEditorRuntime } from '../ScreenEditor/Runtime/screenEditorRuntime';
import { defaultUiProfileSettings } from '../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../UiProfile/resolveUiProfile';
import type { BlueprintGalleryAssets } from './BlueprintGalleryAssets';
import type { BlueprintGalleryStrings } from './BlueprintGalleryStrings';
import { blueprintApplications } from './blueprintApplications';
import { formatGalleryMessage } from './formatGalleryMessage';
import './BlueprintPreview.css';

export interface BlueprintPreviewProps {
    /** The blueprint to run: its package name. */
    blueprint: string;

    /** Every bundle this build has loaded: the application is drawn with the foundation's components and this blueprint's templates. */
    bundles: ScenePackageBundle[];

    /** The sample data the blueprint ships. */
    assets: BlueprintGalleryAssets;

    /** The labels of the preview - the gallery's and the template browser's both carry them. */
    strings: Pick<BlueprintGalleryStrings, 'preview'>;

    /** Leaves the preview. */
    onExit: () => void;
}

/**
 * A blueprint as the application it is (spec 6): Scene's preview host - Stage's own composition and navigation - given the blueprint's application with
 * the sample data of one of its packs, under the strip that names it and switches the data. It is read-only: nothing is added to the profile and nothing
 * is stored; leaving it returns to the gallery with the card where it was.
 */
export function BlueprintPreview({ blueprint, bundles, assets, strings, onExit }: BlueprintPreviewProps) {
    const application = blueprintApplications[blueprint];
    const listed = useMemo(() => describeBlueprintCatalog(bundles).find(entry => entry.package === blueprint)?.sampleData ?? [], [bundles, blueprint]);
    const [packs, setPacks] = useState<SampleDataPack[] | undefined>();
    useEffect(() => {
        let current = true;
        setPacks(undefined);
        assets.loadPacks(blueprint, listed).then(loaded => current && setPacks(loaded), () => current && setPacks([]));
        return () => { current = false; };
    }, [assets, blueprint, listed]);
    const [sessionPack, setSessionPack] = useState<string | undefined>();
    const [problems, setProblems] = useState<readonly PreviewProblem[]>([]);
    const defaultPack = packs?.[0]?.id;
    const activePack = sessionPack ?? defaultPack ?? '';

    const runtime = useMemo(() => {
        const settings = defaultUiProfileSettings(bundles);
        const profile = resolveUiProfile({ ...settings, templatePacks: [blueprint] }, bundles).profile;
        return createScreenEditorRuntime(bundles, profile);
    }, [bundles, blueprint]);
    const theme = useMemo(() => profileTheme(runtime), [runtime]);
    const catalog = useMemo(() => describeSampleDataCatalog(runtime.bundles, [], activePack), [runtime, activePack]);
    const document = useMemo(() => application && { ...application.application(activePack || undefined), uiProfiles: [runtime.profile] }, [application, activePack, runtime]);
    const navigation = useMemo(() => application?.navigationModel(), [application]);
    const [breadcrumb, setBreadcrumb] = useState<readonly string[]>([]);
    const name = bundles.find(bundle => bundle.manifest.name === blueprint)?.manifest.displayName ?? blueprint;

    if (!application || !document || !navigation) return null;
    if (packs === undefined) return <p role='status' className='studio-blueprint-preview__loading'>{strings.preview.loading}</p>;

    return (
        <div className='studio-blueprint-preview' data-blueprint-preview={blueprint}>
            <PreviewStrip breadcrumb={breadcrumb.length > 0 ? breadcrumb : [name]} catalog={catalog} activePack={activePack} onChooseSampleData={setSessionPack}
                problems={problems.filter(problem => problem.severity === 'error')} onShowNode={() => undefined} nameOfNode={id => id.slice(id.lastIndexOf('.') + 1)} onExit={onExit}
                strings={{ ...strings.preview.strip, previewing: formatGalleryMessage(strings.preview.title, { name }) }} />
            <div className={`studio-blueprint-preview__stage studio-profile-theme ${theme ? profileColorSchemeClasses(theme) : ''}`} data-preview-stage=''>
                <IconAdapterProvider registry={runtime.iconAdapters}>
                    <ScenePreviewHost document={document} structure={navigation.structure} navigation={navigation.navigation} target={{ module: application.module }}
                        sampleData={{ packs, ...(defaultPack ? { blueprintDefaultPack: defaultPack } : {}), ...(sessionPack === undefined ? {} : { sessionActivePack: sessionPack }) }}
                        registry={runtime.registry} composition={{ ...application.composition, profile: runtime.profile, catalog: runtime.packages }} {...(theme ? { theme } : {})}
                        onProblems={setProblems} onBreadcrumbChange={setBreadcrumb} onExit={onExit} />
                </IconAdapterProvider>
            </div>
        </div>
    );
}
