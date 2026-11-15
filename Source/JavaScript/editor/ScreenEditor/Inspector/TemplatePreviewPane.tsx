// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { TemplatePreviewState } from '@cratis/scene.blueprint.default';
import { SceneElementView } from '@cratis/scene.react';
import { ErrorBoundary } from '@cratis/components/Common';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { catalogEntryOf, templatePreview } from '../Templates/templatePreview';
import { TemplatePreviewSize } from '../Templates/TemplatePreviewSize';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import './TemplatePreviewPane.css';

export interface TemplatePreviewPaneProps {
    templateName: string;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings['properties']['templates'];
    disabled: boolean;
    onApply: () => void;
    onDiscard: () => void;
}

// A template being considered, before it is applied: drawn from the screen its package ships, in each of Scene's sample
// data states and at each size, with what Scene's catalog says about where it comes from and whether it can run here.
// Nothing is written to the screen until the author applies it.
export const TemplatePreviewPane = ({ templateName, environment, strings, disabled, onApply, onDiscard }: TemplatePreviewPaneProps) => {
    const [state, setState] = useState(TemplatePreviewState.Populated);
    const [size, setSize] = useState(TemplatePreviewSize.Desktop);
    // Drawn with the profile the screen will run under, so the preview shows the components the author will get.
    const { bundles, profile, registry, designTime } = environment.runtime;
    const element = useMemo(() => templatePreview(templateName, state, bundles, profile), [templateName, state, bundles, profile]);
    const entry = catalogEntryOf(templateName, designTime.host.templates);

    return (
        <section className='studio-editor-template-preview' aria-label={strings.preview(templateName)}>
            <div className='studio-editor-template-preview__controls'>
                <label>
                    <span>{strings.previewState}</span>
                    <select value={state} onChange={event => setState(event.target.value as TemplatePreviewState)}>
                        {Object.values(TemplatePreviewState).map(value => <option key={value} value={value}>{strings.previewStates[value]}</option>)}
                    </select>
                </label>
                <label>
                    <span>{strings.previewSize}</span>
                    <select value={size} onChange={event => setSize(event.target.value as TemplatePreviewSize)}>
                        {Object.values(TemplatePreviewSize).map(value => <option key={value} value={value}>{strings.previewSizes[value]}</option>)}
                    </select>
                </label>
            </div>
            <div className='studio-editor-template-preview__frame' data-size={size} data-state={state}>
                {element
                    ? <ErrorBoundary fallback={<p role='alert'>{strings.previewFailed}</p>}><SceneElementView element={element} registry={registry} resolveBinding={() => undefined} /></ErrorBoundary>
                    : <p className='studio-editor-template-preview__none'>{strings.noPreview}</p>}
            </div>
            {entry && (
                <dl className='studio-editor-template-preview__facts'>
                    <dt>{strings.provenanceLabel}</dt><dd>{`${entry.package} ${entry.packageVersion}`}</dd>
                    {entry.license && <><dt>{strings.license}</dt><dd>{entry.license}</dd></>}
                    {entry.attribution?.notice && <><dt>{strings.attribution}</dt><dd>{entry.attribution.notice}</dd></>}
                    <dt>{strings.compatibility}</dt><dd>{entry.compatible ? strings.compatible : strings.incompatible}</dd>
                </dl>
            )}
            {entry && entry.problems.length > 0 && (
                <ul className='studio-editor-diagnostics' role='alert'>{entry.problems.map(problem => <li key={problem} data-severity='error'>{problem}</li>)}</ul>
            )}
            <div className='studio-editor-template-preview__actions'>
                <button type='button' disabled={disabled || (entry !== undefined && !entry.compatible)} onClick={onApply}>{strings.apply}</button>
                <button type='button' onClick={onDiscard}>{strings.discard}</button>
            </div>
        </section>
    );
};
