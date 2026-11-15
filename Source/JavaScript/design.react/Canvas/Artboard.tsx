// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useRef, type MouseEvent, type ReactNode } from 'react';
import type { SceneDocument } from '@cratis/scene.model';
import type { DesignComment, DesignMode } from '@cratis/scene.design';
import { ScreenThumbnail, withScreenAsPrimary, type ScreenEditorRuntime } from '@cratis/scene.editor';
import { type PinAnchor, type PlacedPin, anchorPin, placePins } from '../State/commentPins';
import { TemplateSchematic } from './TemplateSchematic';
import { useElementBoxes } from './useElementBoxes';
import './Artboard.css';

/** The width an artboard is drawn at before the canvas zooms it. */
export const artboardWidth = 480;

export interface ArtboardProps {
    name: string;
    mode: DesignMode;
    document: SceneDocument | undefined;
    runtime: ScreenEditorRuntime;
    /** The zoom the canvas shows the artboard at: pins are placed in the artboard's own pixels, so it is divided out. */
    scale: number;
    selected: boolean;
    comments: readonly DesignComment[];
    /** Whether a click on the screen drops a pin instead of selecting it. */
    commenting: boolean;
    selectedComment?: string;
    /** The place of the artboard in its storyline, for the buttons that move it. */
    position: { index: number; count: number };
    /** A label next to the name: the template the screen is built on. */
    caption?: string;
    onSelect(): void;
    onMove(index: number): void;
    onPlaceComment(anchor: PinAnchor): void;
    onOpenComment(commentId: string): void;
    children?: ReactNode;
}

/**
 * One screen - or, in template mode, one screen template - on the canvas, drawn faithfully by Scene at a fixed width. Comment pins sit on the
 * element they are about and follow it as the screen changes; a pin dropped where no element is stays where it was put.
 */
export const Artboard = ({ name, mode, document, runtime, scale, selected, comments, commenting, selectedComment, position, caption, onSelect, onMove, onPlaceComment, onOpenComment, children }: ArtboardProps) => {
    const frame = useRef<HTMLDivElement>(null);
    const signature = useMemo(() => JSON.stringify(document?.screens.find(screen => screen.name === name) ?? document?.screenTemplates.find(template => template.name === name) ?? ''), [document, name]);
    const { boxes, measure } = useElementBoxes(frame, scale, signature);
    const pins = useMemo(() => placePins(comments, name, boxes), [comments, name, boxes]);
    // A pin carries its comment's number in the list of the screen's comments, which is the number the comments panel shows.
    const numbers = useMemo(() => comments.filter(comment => comment.screen === name).map(comment => comment.id), [comments, name]);
    const template = mode === 'templates' ? document?.screenTemplates.find(candidate => candidate.name === name) : undefined;
    const screenDocument = useMemo(() => mode === 'screens' && document !== undefined ? withScreenAsPrimary(document, name) : undefined, [document, name, mode]);

    const drop = (event: MouseEvent<HTMLDivElement>) => {
        const element = frame.current;
        if (element === null) return;
        const base = element.getBoundingClientRect();
        onPlaceComment(anchorPin({ x: (event.clientX - base.left) / scale, y: (event.clientY - base.top) / scale }, measure()));
    };

    return (
        <article className={`design-artboard${selected ? ' design-artboard--selected' : ''}`} style={{ width: artboardWidth }} aria-label={name} data-artboard={name}>
            <header className='design-artboard__title'>
                <button type='button' className='design-artboard__name' onClick={onSelect} aria-pressed={selected}>{name}</button>
                {caption !== undefined && <span className='design-artboard__caption'>{caption}</span>}
                <span className='design-artboard__moves'>
                    <button type='button' aria-label={`Move ${name} earlier`} disabled={position.index === 0} onClick={() => onMove(position.index - 1)}>◀</button>
                    <button type='button' aria-label={`Move ${name} later`} disabled={position.index >= position.count - 1} onClick={() => onMove(position.index + 1)}>▶</button>
                </span>
            </header>
            <div ref={frame} className='design-artboard__frame' onClickCapture={commenting ? undefined : onSelect}>
                {mode === 'templates'
                    ? (template === undefined ? <div className='design-artboard__empty'>Reading the template</div> : <TemplateSchematic template={template} />)
                    : (screenDocument === undefined ? <div className='design-artboard__empty'>Reading the screen</div> : <ScreenThumbnail document={screenDocument} runtime={runtime} width={artboardWidth} title={name} />)}
                {commenting && <div className='design-artboard__capture' role='presentation' data-capture='' onClick={drop} />}
                <div className='design-artboard__pins'>
                    {pins.placed.map(pin => (
                        <PinButton key={pin.comment.id} pin={pin} number={numbers.indexOf(pin.comment.id) + 1} open={selectedComment === pin.comment.id} onOpen={onOpenComment} />
                    ))}
                </div>
            </div>
            {children}
        </article>
    );
};

interface PinButtonProps {
    pin: PlacedPin;
    number: number;
    open: boolean;
    onOpen(commentId: string): void;
}

const PinButton = ({ pin, number, open, onOpen }: PinButtonProps) => (
    <button
        type='button'
        className={`design-pin${pin.comment.resolved ? ' design-pin--resolved' : ''}${open ? ' design-pin--open' : ''}${pin.anchored ? '' : ' design-pin--loose'}`}
        style={{ left: pin.x, top: pin.y }}
        aria-label={`Comment ${number}: ${pin.comment.text}`}
        data-comment={pin.comment.id}
        onClick={event => { event.stopPropagation(); onOpen(pin.comment.id); }}>
        {number}
    </button>
);
