// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import type { VariationGroup } from '@cratis/scene.design';
import { ScreenThumbnail, withScreenAsPrimary, type ScreenEditorRuntime } from '@cratis/scene.editor';
import './VariationStrip.css';

export interface VariationStripProps {
    group: VariationGroup;
    documents: ReadonlyMap<string, SceneDocument>;
    runtime: ScreenEditorRuntime;
    chooseLabel: string;
    onChoose(candidateId: string): void;
}

const letterOf = (index: number): string => String.fromCharCode(65 + index);

/**
 * The layouts that were asked for, side by side with the screen they are of. Choosing one makes it the screen's next revision; the others stay in
 * the session's history, so nothing offered is lost by choosing.
 */
export const VariationStrip = ({ group, documents, runtime, chooseLabel, onChoose }: VariationStripProps) => (
    <section className='design-variations' aria-label={`Layouts of ${group.screen}`}>
        {group.prompt !== undefined && <p className='design-variations__prompt'>{group.prompt}</p>}
        <div className='design-variations__row'>
            {group.candidates.map((candidate, index) => {
                const document = documents.get(candidate.id);
                return (
                    <figure key={candidate.id} className='design-variations__candidate' data-candidate={candidate.id}>
                        <div className='design-variations__picture'>
                            {document === undefined
                                ? <div className='design-variations__reading'>Reading layout {letterOf(index)}</div>
                                : <ScreenThumbnail document={withScreenAsPrimary(document, group.screen)} runtime={runtime} width={220} title={`Layout ${letterOf(index)}`} />}
                        </div>
                        <figcaption>
                            <strong>{letterOf(index)}</strong>
                            <button type='button' onClick={() => onChoose(candidate.id)}>{chooseLabel}</button>
                        </figcaption>
                    </figure>
                );
            })}
        </div>
    </section>
);
