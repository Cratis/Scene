// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import type { SampleDataCatalog } from '@cratis/scene.engine';
import type { PreviewProblem } from '@cratis/scene.blueprint.default';
import { SampleDataPicker } from '../SampleData/SampleDataPicker';
import { defaultPersonaStrings, type PreviewStrings } from './PreviewStrings';
import type { PreviewPersona } from './previewPersona';
import type { LensProblem } from './Lens/LensProblem';
import { defaultLensStrings } from './Lens/LensStrings';
import './PreviewStrip.css';
import './Lens/StripLens.css';

export interface PreviewStripProps {
    /** What is being previewed, outermost first - `['Sales', 'Orders']` - as the preview host reports it. */
    breadcrumb: readonly string[];

    /** Scene's description of the sample data that can be chosen. */
    catalog: SampleDataCatalog;

    /** The pack in effect: the session's choice, or the application's. */
    activePack: string;

    /** Called when another pack is chosen. It changes this preview only. */
    onChooseSampleData: (pack: string) => void;

    /** What stops the model from rendering, if anything. */
    problems: readonly PreviewProblem[];

    /** Called to go to the node a problem is about. */
    onShowNode: (problem: PreviewProblem) => void;

    /** The name of the node a problem is about, for its link. */
    nameOfNode: (nodeId: string) => string;

    /** Leaves the preview. */
    onExit: () => void;
    strings: PreviewStrings;

    // Whether the bindings lens is on.
    lens?: boolean;

    // Turns the bindings lens on or off. Without it the strip offers no lens.
    onToggleLens?: () => void;

    // What is wrong with the wiring, listed in the strip while the lens is on.
    lensProblems?: readonly LensProblem[];

    // The personas of the model. Without any, the strip offers no persona selector.
    personas?: readonly PreviewPersona[];

    // The name of the persona the preview is as, or nobody in particular.
    persona?: string | undefined;

    // Called when another persona is chosen, or none (`undefined`). It changes this preview only.
    onChoosePersona?: (persona: string | undefined) => void;
}

/**
 * The strip above the rendered application (spec PRV7, p21-1): a dark bar that names what is being previewed, offers the sample data
 * selector - the one the UI Profile page uses - and exits. A model that cannot be drawn says why here, with a link to the node it is about,
 * instead of leaving a blank screen (PRV8).
 */
export const PreviewStrip = ({ breadcrumb, catalog, activePack, onChooseSampleData, problems, onShowNode, nameOfNode, onExit, strings, lens = false, onToggleLens, lensProblems = [], personas = [], persona, onChoosePersona }: PreviewStripProps) => {
    const handlers = useMemo(() => ({ onChoose: onChooseSampleData }), [onChooseSampleData]);
    const words = strings.lens ?? defaultLensStrings;
    const personaWords = strings.persona ?? defaultPersonaStrings;
    return (
        <div className='studio-preview-strip' role='region' aria-label={strings.stripLabel} data-preview-strip=''>
            <div className='studio-preview-strip__bar'>
                <strong className='studio-preview-strip__title'>{strings.previewing}</strong>
                <span className='studio-preview-strip__breadcrumb' data-preview-breadcrumb=''>{breadcrumb.join(' › ')}</span>
                <span className='studio-preview-strip__spacer' />
                <SampleDataPicker catalog={catalog} activePack={activePack} labels={strings.picker} handlers={handlers} prefix={strings.sampleData} />
                {onChoosePersona && personas.length > 0 && (
                    <label className='studio-preview-strip__persona'>
                        <span>{personaWords.label}</span>
                        <select aria-label={personaWords.menu} data-preview-persona='' value={persona ?? ''} onChange={event => onChoosePersona(event.target.value === '' ? undefined : event.target.value)}>
                            <option value=''>{personaWords.nobody}</option>
                            {personas.map(candidate => <option key={candidate.name} value={candidate.name}>{candidate.name}</option>)}
                        </select>
                    </label>
                )}
                {onToggleLens && (
                    <button type='button' className={`studio-preview-strip__lens${lens ? ' studio-preview-strip__lens--on' : ''}`} aria-pressed={lens} data-bindings-lens-toggle='' onClick={onToggleLens}>
                        {words.toggle}
                    </button>
                )}
                <button type='button' className='studio-preview-strip__exit' onClick={onExit}>{strings.exit}</button>
            </div>
            {lens && persona !== undefined && (
                <p className='studio-preview-strip__lens-persona' data-lens-persona=''>{personaWords.lens.replace('{persona}', persona)}</p>
            )}
            {lens && lensProblems.length > 0 && (
                <ul className='studio-preview-strip__lens-problems' aria-label={words.problems} data-lens-problems=''>
                    <li className='studio-preview-strip__lens-heading'>{words.problems} · {lensProblems.length}</li>
                    {lensProblems.map((problem, index) => (
                        <li key={`${problem.code}-${index}`} data-code={problem.code}>
                            <span>{problem.message}</span>
                            <span className='studio-preview-strip__lens-code'>{problem.code}</span>
                        </li>
                    ))}
                </ul>
            )}
            {problems.length > 0 && (
                <ul className='studio-preview-strip__problems' role='alert' aria-label={strings.problems} data-preview-problems=''>
                    {problems.map((problem, index) => (
                        <li key={`${problem.code}-${problem.nodeId ?? ''}-${index}`} data-severity={problem.severity} data-code={problem.code}>
                            <span>{problem.message}</span>
                            {problem.nodeId !== undefined && (
                                <button type='button' className='studio-preview-strip__link' onClick={() => onShowNode(problem)}>
                                    {strings.showNode.replace('{node}', nameOfNode(problem.nodeId))}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
