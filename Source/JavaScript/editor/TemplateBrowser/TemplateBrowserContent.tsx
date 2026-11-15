// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from '@cratis/components/Common';
import type { BlueprintGalleryAssets } from '../BlueprintGallery/BlueprintGalleryAssets';
import { BlueprintPreview } from '../BlueprintGallery/BlueprintPreview';
import { blueprintApplications } from '../BlueprintGallery/blueprintApplications';
import { allTemplatesRailId } from './TemplateBrowserRailItem';
import { availableActions } from './availableActions';
import { describeTemplateBrowser } from './describeTemplateBrowser';
import { formatTemplateBrowserMessage } from './formatTemplateBrowserMessage';
import { TemplateBrowserActionKind } from './TemplateBrowserActionKind';
import type { TemplateBrowserActions } from './TemplateBrowserActions';
import { TemplateBrowserCard } from './TemplateBrowserCard';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import type { TemplateBrowserInput } from './TemplateBrowserInput';
import { TemplateBrowserMode } from './TemplateBrowserMode';
import { TemplateBrowserPane } from './TemplateBrowserPane';
import type { TemplateBrowserRuntime } from './TemplateBrowserPreview';
import { TemplateBrowserRail } from './TemplateBrowserRail';
import { runtimeForEntry } from './runtimeForEntry';
import type { TemplateBrowserStrings } from './TemplateBrowserStrings';
import './TemplateBrowserContent.css';

/** What the browser is made of, minus what it keeps itself: the rail row, the category, the filter and the selection. */
export type TemplateBrowserSources = Omit<TemplateBrowserInput, 'railId' | 'category' | 'filter'>;

export interface TemplateBrowserContentProps {
    sources: TemplateBrowserSources;

    /** The row the rail starts on; the picker's "Browse all…" starts on every template, a link to one blueprint on that blueprint. */
    initialRailId?: string;

    /** The thumbnails and sample data the host loads from the blueprint packages. */
    assets: BlueprintGalleryAssets;
    runtime: TemplateBrowserRuntime;
    actions: TemplateBrowserActions;
    strings: TemplateBrowserStrings;

    /** Said under the grid when templates were left out because they do not fit: what the target is called, e.g. "a slice". */
    targetLabel?: string;

    /**
     * What the pane beside the grid shows for the selected template, in place of the browser's own. The shell chooser of the UI profile designer uses it to
     * draw the application in the candidate shell and to say what switching to it would do (StudioIssues#719); everything else is the browser's.
     */
    renderDetail?: (entry: TemplateBrowserEntry | undefined) => ReactNode;
}

/**
 * The template browser's body, which a page and a dialog both host (spec 6): a rail of where templates come from, a grid of what is there, a pane with the
 * selected template drawn and what can be done with it. The model it shows is {@link describeTemplateBrowser}; this component keeps only the rail row,
 * category, filter and selection.
 *
 * Keyboard: `/` focuses the filter; the arrow keys, Home and End walk the grid, which is one tab stop; Enter chooses (dialog) or edits (page); Escape in the
 * filter clears it.
 */
export function TemplateBrowserContent({ sources, initialRailId = allTemplatesRailId, assets, runtime, actions, strings, targetLabel, renderDetail }: TemplateBrowserContentProps) {
    const [railId, setRailId] = useState(initialRailId);
    const [category, setCategory] = useState('');
    const [filter, setFilter] = useState('');
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const [previewing, setPreviewing] = useState<string | undefined>();
    const filterRef = useRef<HTMLInputElement>(null);
    const cardRefs = useRef(new Map<string, HTMLLIElement>());
    const model = useMemo(() => describeTemplateBrowser({ ...sources, railId, category, filter }), [sources, railId, category, filter]);
    const selected = model.entries.find(entry => entry.id === selectedId) ?? model.entries.find(entry => entry.current) ?? model.entries[0];

    const previewRuntime = useMemo(() => runtimeForEntry(selected, runtime, sources.profile, sources.bundles), [selected, runtime, sources.profile, sources.bundles]);

    useEffect(() => {
        const listener = (event: globalThis.KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing = target?.matches('input, textarea, select, [contenteditable=true]') ?? false;
            if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                filterRef.current?.focus();
            }
        };
        document.addEventListener('keydown', listener);
        return () => document.removeEventListener('keydown', listener);
    }, []);

    const activate = (entry: TemplateBrowserEntry) => {
        const offered = availableActions(entry, sources.mode, actions);
        if (offered.includes(TemplateBrowserActionKind.Choose)) actions.onChoose?.(entry);
        else if (offered.includes(TemplateBrowserActionKind.Edit)) actions.onEdit?.(entry);
    };

    const select = (entry: TemplateBrowserEntry | undefined) => {
        if (entry === undefined) return;
        setSelectedId(entry.id);
        cardRefs.current.get(entry.id)?.focus();
    };

    const onGridKey = (event: KeyboardEvent<HTMLUListElement>) => {
        const index = selected === undefined ? -1 : model.entries.indexOf(selected);
        const last = model.entries.length - 1;
        const moves: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: last };
        if (event.key in moves) {
            event.preventDefault();
            select(model.entries[Math.max(0, Math.min(last, moves[event.key]))]);
        } else if (event.key === 'Enter' && selected !== undefined) {
            event.preventDefault();
            activate(selected);
        }
    };

    if (previewing !== undefined) {
        return (
            <div className='studio-template-browser studio-template-browser--previewing'>
                <BlueprintPreview blueprint={previewing} bundles={[...runtime.bundles]} assets={assets} strings={{ preview: strings.blueprintPreview }} onExit={() => setPreviewing(undefined)} />
                <Button label={strings.preview.back} onClick={() => setPreviewing(undefined)} />
            </div>
        );
    }

    return (
        <div className='studio-template-browser' data-mode={sources.mode} data-detail={renderDetail === undefined ? undefined : 'host'}>
            <TemplateBrowserRail items={model.rail} selectedId={model.selectedRailId} strings={strings} onSelect={id => { setRailId(id); setCategory(''); }} />
            <div className='studio-template-browser__main'>
                <div className='studio-template-browser__toolbar'>
                    <input ref={filterRef} type='search' className='studio-template-browser__filter' value={filter} placeholder={strings.filter} aria-label={strings.filter}
                        onChange={event => setFilter(event.target.value)} onKeyDown={event => { if (event.key === 'Escape' && filter.length > 0) { event.stopPropagation(); setFilter(''); } }} />
                    <select className='studio-template-browser__category' value={category} aria-label={strings.category} onChange={event => setCategory(event.target.value)}>
                        <option value=''>{strings.anyCategory}</option>
                        {model.categories.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    {sources.mode === TemplateBrowserMode.Manage && actions.onNew && <Button label={strings.actions.newTemplate} size='small' onClick={actions.onNew} />}
                    {sources.mode === TemplateBrowserMode.Manage && actions.onImport && <Button label={strings.actions.import} size='small' variant='outline' onClick={actions.onImport} />}
                </div>
                {model.empty !== undefined && <p role='status' className='studio-template-browser__empty'>{strings.empty[model.empty]}</p>}
                <ul role='listbox' aria-label={strings.grid} className='studio-template-browser__grid' onKeyDown={onGridKey}>
                    {model.entries.map(entry => (
                        <TemplateBrowserCard key={entry.id} entry={entry} selected={entry === selected} focusable={entry === selected} strings={strings}
                            thumbnailUrl={entry.thumbnail === undefined || entry.package === undefined ? undefined : assets.thumbnailUrl(entry.package, entry.thumbnail)} runtime={runtime}
                            ref={element => { if (element) cardRefs.current.set(entry.id, element); else cardRefs.current.delete(entry.id); }}
                            onSelect={select} onActivate={activate} />
                    ))}
                </ul>
                {model.hidden > 0 && targetLabel !== undefined && <p className='studio-template-browser__hidden' role='note'>{formatTemplateBrowserMessage(strings.hidden, { count: model.hidden, target: targetLabel })}</p>}
            </div>
            {renderDetail !== undefined
                ? <div className='studio-template-browser__detail'>{renderDetail(selected)}</div>
                : <TemplateBrowserPane entry={selected} mode={sources.mode} runtime={previewRuntime} actions={actions} strings={strings}
                    canPreviewBlueprint={selected?.package !== undefined && blueprintApplications[selected.package] !== undefined} onPreviewBlueprint={setPreviewing} />}
        </div>
    );
}
