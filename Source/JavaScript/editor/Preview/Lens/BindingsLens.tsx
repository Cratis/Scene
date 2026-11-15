// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useRef, useState } from 'react';
import { describeLensMarks, LensMarkKind, type LensMark } from './lensMarks';
import type { LensStrings } from './LensStrings';
import './BindingsLens.css';

export interface BindingsLensProps {
    // The rendered application the lens reads and draws over.
    stage: HTMLElement | null;

    // The ids of the text that is bound to nothing.
    unbound: ReadonlySet<string>;
    words: LensStrings;
}

interface PlacedMark {
    key: string;
    kind: LensMarkKind;
    label: string;
    blocked: boolean;
    reason?: string;
    left: number;
    top: number;
    width: number;
    height: number;
}

const placed = (stage: HTMLElement, marks: readonly LensMark<Element>[]): PlacedMark[] => {
    const origin = stage.getBoundingClientRect();
    return marks.flatMap((mark, index) => {
        const box = mark.node.getBoundingClientRect();
        if (box.width === 0 && box.height === 0) return [];
        return [{
            key: `${mark.kind}-${index}`,
            kind: mark.kind,
            label: mark.label,
            blocked: mark.blocked,
            ...(mark.reason === undefined ? {} : { reason: mark.reason }),
            left: box.left - origin.left + stage.scrollLeft,
            top: box.top - origin.top + stage.scrollTop,
            width: box.width,
            height: box.height,
        }];
    });
};

// Draws what every element of the rendered preview is wired to over it: hooks with their slice and where they open, data components with their query, filters
// with their parameter, text bound to nothing in red, and why a hook is disabled. It only reads what the preview already says about itself and draws on a layer that
// takes no clicks, so the application underneath behaves exactly as it does without the lens.
export const BindingsLens = ({ stage, unbound, words }: BindingsLensProps) => {
    const [marks, setMarks] = useState<readonly PlacedMark[]>([]);
    const layer = useRef<HTMLDivElement>(null);

    const refresh = useCallback(() => {
        if (stage) setMarks(placed(stage, describeLensMarks<Element>(stage, unbound, words)));
    }, [stage, unbound, words]);

    useEffect(() => {
        if (!stage) return undefined;
        let frame = 0;
        const schedule = () => {
            globalThis.cancelAnimationFrame(frame);
            frame = globalThis.requestAnimationFrame(refresh);
        };

        schedule();
        // What the lens draws itself is not what the application did, so it is not a reason to read the application again.
        const mutations = new MutationObserver(records => { if (records.some(record => !layer.current?.contains(record.target))) schedule(); });
        mutations.observe(stage, { subtree: true, childList: true, attributes: true, characterData: true });
        const sizes = new ResizeObserver(schedule);
        sizes.observe(stage);
        stage.addEventListener('scroll', schedule, true);
        globalThis.addEventListener('resize', schedule);
        return () => {
            globalThis.cancelAnimationFrame(frame);
            mutations.disconnect();
            sizes.disconnect();
            stage.removeEventListener('scroll', schedule, true);
            globalThis.removeEventListener('resize', schedule);
        };
    }, [stage, refresh]);

    return (
        <div ref={layer} className='studio-bindings-lens' data-bindings-lens='' aria-hidden='true'>
            {marks.map(mark => (
                <div key={mark.key} className={`studio-bindings-lens__mark studio-bindings-lens__mark--${mark.kind}${mark.blocked ? ' studio-bindings-lens__mark--blocked' : ''}`}
                    data-lens-kind={mark.kind} data-lens-blocked={mark.blocked ? '' : undefined}
                    style={{ left: mark.left, top: mark.top, width: mark.width, height: mark.height }}>
                    <span className='studio-bindings-lens__chip'>{mark.label}</span>
                    {mark.blocked && mark.reason !== undefined && <span className='studio-bindings-lens__reason' data-lens-reason=''>{words.disabled}{mark.reason}</span>}
                </div>
            ))}
        </div>
    );
};
