// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { LuLock, LuPlus } from 'react-icons/lu';
import { OutletItemKind, OutletKind, type OutletItem, type OutletRefinement } from '@cratis/scene.model';
import { TemplatePreviewState, LayoutConfigProvider } from '@cratis/scene.blueprint.default';
import { IconAdapterProvider, SceneElementView, SceneOutletsProvider, SceneThemeProvider } from '@cratis/scene.react';
import { ErrorBoundary } from '@cratis/components/Common';
import '@cratis/scene.primereact/primeReactTheme.css';
import '../ScreenEditor/Runtime/ProfileThemeRoot.css';
import '../ScreenEditor/Runtime/PortableComponents.css';
import { profileColorSchemeClasses } from '../ScreenEditor/Runtime/profileColorScheme';
import { profileTheme } from '../ScreenEditor/Runtime/profileTheme';
import type { ScreenEditorEnvironment } from '../ScreenEditor/Host/ScreenEditorHost';
import type { ScreenEditorStrings } from '../ScreenEditor/Inspector/ScreenEditorStrings';
import { slotNames } from '../ScreenEditor/Inspector/NavigationSection';
import { createBindingScope } from '../ScreenEditor/Binding/bindingScopeTypes';
import { createEditorContext, type EditorControllerView } from '../ScreenEditor/PropertyEditors/Registry/createEditorContext';
import type { LevelRefinements } from '../ScreenEditor/DesignMode/Outlets/levelOutlets';
import { chainAt } from '../ScreenEditor/Outlets/screenOutletChain';
import type { OutletEditingLevel } from '../ScreenEditor/Outlets/outletDocument';
import { defaultDesignModeStrings } from '../ScreenEditor/DesignMode/DesignModeStrings';
import { handleDesignModeKey } from '../ScreenEditor/DesignMode/designModeKeys';
import { DesignModeChrome } from '../ScreenEditor/DesignMode/DesignModeChrome';
import { isRejection, type DesignModePlan, type DesignModeRejection, type DesignModeSubject } from '../ScreenEditor/DesignMode/designModeTypes';
import type { DesignModeState } from '../ScreenEditor/DesignMode/useDesignMode';
import { useSurfaceMeasured } from '../ScreenEditor/DesignMode/useDesignModeMeasurement';
import { nextElementId } from '../ScreenEditor/Host/nextElementId';
import { elementRect, type SurfaceOrigin } from '../ScreenEditor/Surface/elementRect';
import type { Rect } from '../ScreenEditor/Surface/dropRegionRects';
import { TemplatePreviewSize } from '../ScreenEditor/Templates/TemplatePreviewSize';
import { previewOfOwnTemplate, previewOfScreen, previewScreensOf } from '../TemplateBrowser/previewScreens';
import { templatePreviewGeometry } from '../TemplateBrowser/templatePreviewGeometry';
import type { TemplateBrowserEntry } from '../TemplateBrowser/TemplateBrowserEntry';
import type { TemplateBrowserRuntime } from '../TemplateBrowser/TemplateBrowserPreview';
import type { TemplateBrowserStrings } from '../TemplateBrowser/TemplateBrowserStrings';
import { HookPicker } from './HookPicker';
import { OutletModePopover } from './OutletModePopover';
import { defaultLevelTemplateSurfaceStrings, type LevelTemplateSurfaceStrings } from './LevelTemplateSurfaceStrings';
import { levelSurfaceModel, levelsWithRefinement, outletElementsOf, exposesKind, refinementAfter, undrawnOutletStrip } from './levelSurfaceModel';
import './LevelTemplateSurface.css';

/** What a change at the level comes to: the refinement the level now says about one outlet, or nothing when it inherits the outlet again. */
export interface LevelOutletChange {
    level: OutletEditingLevel;
    outlet: string;
    refinement: OutletRefinement | undefined;
}

export interface LevelTemplateSurfaceProps {
    /** The template in effect for the level. */
    entry: TemplateBrowserEntry;
    runtime: TemplateBrowserRuntime;

    /** What the editors of an item are lent: the State Change slices of the board, its queries, destinations and the descriptors of Scene. */
    environment: ScreenEditorEnvironment;

    /** The module and the features above and including the level, outermost first. The last one is the level being edited. */
    levels: readonly LevelRefinements[];

    /** Makes the change at the level. Resolves to whether it was kept; a surface that is told no draws what the level says again. */
    onRefine: (change: LevelOutletChange) => Promise<boolean>;

    strings?: LevelTemplateSurfaceStrings;
    editorStrings: ScreenEditorStrings;
    previewStrings: TemplateBrowserStrings;

    /** The kind of outlet the level most wants to hook into: what is said on the preview when the template exposes none of it. Actions by default. */
    wantedKind?: OutletKind;

    /** Gives the level another template. Offered with the notice of an outlet the template does not expose. */
    onChooseAnotherTemplate?: () => void;

    /** Opens the template in the designer, to add an outlet to it. Only an application's own template can be changed. */
    onAddOutletToTemplate?: () => void;

    /** Whether the board only shows: the outlets are drawn and nothing can be changed. */
    readOnly?: boolean;
}

interface Selected {
    outlet: string;
    itemId?: string;
}

interface PlacedOutlet {
    name: string;
    id: string;
    rect: Rect;
}

interface PickerAt {
    outlet: string;
    anchor: Rect;
}

interface ModeAt {
    outlet: string;
    anchor: Rect;
    opener: HTMLElement;
}

const room = 6;
const emptyStructure = { modules: [] } as unknown as EditorControllerView['structure'];

const samePlaced = (a: PlacedOutlet[], b: PlacedOutlet[]) =>
    a.length === b.length && a.every((outlet, index) => outlet.id === b[index].id && outlet.rect.left === b[index].rect.left && outlet.rect.top === b[index].rect.top && outlet.rect.width === b[index].rect.width && outlet.rect.height === b[index].rect.height);

/**
 * The template in effect for a module or a feature, drawn as it will run, with the level's own outlets on it: each outlet the template exposes is outlined
 * with its kind and where its items come from, and has a "+" of its own. The level hooks into an outlet in place - a State Change slice for a button, a
 * parameter for a filter - and changes what it inherits there: extend it, override it, hide an item and bring it back. A level can only hook into the outlets
 * the template exposes, so a template with none of the kind says so, with the two ways out.
 *
 * What is drawn is Scene's own resolution of the outlet for the level, the same the screen editor draws "as the feature" and Stage runs; the chrome is the one of
 * the outlet design mode (#1330) and is placed from what was drawn, exactly, whatever the board's zoom (it measures out the scale the page applies).
 */
export const LevelTemplateSurface = ({
    entry, runtime, environment, levels, onRefine, strings = defaultLevelTemplateSurfaceStrings, editorStrings, previewStrings, wantedKind = OutletKind.Actions,
    onChooseAnotherTemplate, onAddOutletToTemplate, readOnly = false,
}: LevelTemplateSurfaceProps) => {
    const designStrings = editorStrings.designMode ?? defaultDesignModeStrings;
    const outletStrings = designStrings.outlets;
    const labels = previewStrings.preview;
    const surface = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);

    // What the level says is what the host keeps; what is drawn follows an edit at once and goes back to what is kept if it was not.
    const keptKey = JSON.stringify(levels);
    const [draft, setDraft] = useState(levels);
    useEffect(() => { setDraft(JSON.parse(keptKey) as LevelRefinements[]); }, [keptKey]);
    const [inFlight, setInFlight] = useState(false);
    const inFlightRef = useRef(false);
    const [selected, setSelected] = useState<Selected>();
    const [renameToken, setRenameToken] = useState(0);
    const [announcement, setAnnouncement] = useState('');
    const [notice, setNotice] = useState('');
    const [picker, setPicker] = useState<PickerAt>();
    const [modeAt, setModeAt] = useState<ModeAt>();
    const [size, setSize] = useState(TemplatePreviewSize.Desktop);
    const [frameWidth, setFrameWidth] = useState(0);
    const [screenName, setScreenName] = useState<string>();
    useEffect(() => {
        if (notice === '') return;
        const timer = setTimeout(() => setNotice(''), 4000);
        return () => clearTimeout(timer);
    }, [notice]);

    const bundles = runtime.bundles;
    const templates = useMemo(() => [...(environment.ownTemplates ?? []), ...bundles.flatMap(bundle => bundle.screenTemplates ?? [])], [environment.ownTemplates, bundles]);
    const layouts = useMemo(() => bundles.flatMap(bundle => bundle.layouts ?? []), [bundles]);
    const screens = useMemo(() => environment.destinations.map(destination => ({ id: destination.id, label: destination.label })), [environment.destinations]);
    const model = useMemo(() => levelSurfaceModel({
        template: entry.name, levels: draft, catalog: environment.runtime.catalog, templates, layouts, queries: environment.queryCandidates,
        slices: environment.stateChangeSlices, screens, strings: outletStrings,
    }), [entry.name, draft, environment, templates, layouts, screens, outletStrings]);

    // The template drawn the way the template browser draws it.
    const previewScreens = useMemo(() => previewScreensOf(entry, bundles), [entry, bundles]);
    const previewScreen = previewScreens.find(candidate => candidate.name === screenName) ?? previewScreens[0];
    const theme = useMemo(() => profileTheme(runtime), [runtime]);
    const drawnTemplate = useMemo(
        () => previewScreen === undefined
            ? previewOfOwnTemplate(entry, runtime.ownDocuments, TemplatePreviewState.Populated, bundles, runtime.profile)
            : previewOfScreen(previewScreen, TemplatePreviewState.Populated, bundles, runtime.profile),
        [entry, previewScreen, runtime.ownDocuments, bundles, runtime.profile]);
    const undrawn = useMemo(() => {
        const drawn = outletElementsOf(drawnTemplate);
        return model.exposed.filter(outlet => !drawn.has(outlet.name));
    }, [drawnTemplate, model.exposed]);
    const element = drawnTemplate;
    const strip = useMemo(() => undrawnOutletStrip(drawnTemplate ? undrawn.map(outlet => outlet.name) : []), [drawnTemplate, undrawn]);
    const geometry = templatePreviewGeometry(size, frameWidth);
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return undefined;
        setFrameWidth(frame.clientWidth);
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(() => setFrameWidth(frame.clientWidth));
        observer.observe(frame);
        return () => observer.disconnect();
    }, [size, element === undefined]);

    const outletsValue = useMemo(() => {
        const scoped = chainAt(model.outlets.outlets, model.outlets.level);
        return scoped.chain.length > 0 ? { chain: scoped.chain, contributors: scoped.contributors } : undefined;
    }, [model]);
    const outletIds = useMemo(() => new Map([...outletElementsOf(element), ...outletElementsOf(strip)]), [element, strip]);

    const compute = useCallback((root: HTMLDivElement, origin: SurfaceOrigin): PlacedOutlet[] =>
        [...outletIds].flatMap(([name, id]) => {
            const rect = elementRect(root, id, origin);
            return rect ? [{ name, id, rect }] : [];
        }), [outletIds]);
    const placed = useSurfaceMeasured(surface, compute, samePlaced);

    // The state of the design mode the chrome draws: the outlet that is selected, its items, and what an action on one of them comes to.
    const design = selected ? model.outlets.design(selected.outlet) : undefined;
    const selectedItem = design && selected?.itemId !== undefined ? design.items.find(item => item.id === selected.itemId) : undefined;
    const subject = useMemo<DesignModeSubject | undefined>(() => {
        if (!design || !selected) return undefined;
        const componentId = outletIds.get(design.name);
        if (!componentId) return undefined;
        // The "+" of the outlet is drawn with the outline, for every outlet: the chrome of the selected one draws the toolbar of its item and nothing else.
        return { componentId, componentName: 'outletItems', mode: { ...design.designMode, addActions: [] }, source: design, ...(selectedItem ? { selected: selectedItem } : {}) };
    }, [design, selected, selectedItem, outletIds]);

    const perform = useCallback((outlet: string, outcome: DesignModePlan | DesignModeRejection): boolean => {
        if (isRejection(outcome)) { setAnnouncement(designStrings.announce.refused(outcome.rejected)); return false; }
        const level = model.level;
        if (readOnly || !level || inFlightRef.current) return false;
        const refinement = refinementAfter(model, outcome, outlet);
        const next = levelsWithRefinement(draft, level, outlet, refinement);
        setDraft(next);
        const { select } = outcome;
        if (select?.itemId !== undefined) setSelected({ outlet, ...(select.itemId === null ? {} : { itemId: select.itemId }) });
        if (outcome.notice) { setAnnouncement(outcome.notice); setNotice(outcome.notice); }
        if (outcome.renameNext) setRenameToken(token => token + 1);
        inFlightRef.current = true;
        setInFlight(true);
        void onRefine({ level, outlet, refinement }).then(kept => {
            if (!kept) { setDraft(levels); setNotice(strings.refused); }
        }, () => { setDraft(levels); setNotice(strings.refused); }).finally(() => { inFlightRef.current = false; setInFlight(false); });
        return true;
    }, [model, draft, levels, readOnly, onRefine, designStrings, strings.refused]);

    const state = useMemo<DesignModeState>(() => ({
        subject, renameToken, announcement, notice, outlets: model.outlets,
        pointItem: (_component, itemId) => setSelected(current => current ? { outlet: current.outlet, ...(itemId ? { itemId } : {}) } : current),
        perform: outcome => selected ? perform(selected.outlet, outcome) : false,
        add: () => false,
        act: (actionId, item) => !!subject && !!selected && perform(selected.outlet, subject.source.act(actionId, item)),
        rename: (item, label) => !!subject && !!selected && perform(selected.outlet, subject.source.rename(item, label)),
        deselect: () => setSelected(current => current?.itemId !== undefined ? { outlet: current.outlet } : undefined),
    }), [subject, renameToken, announcement, notice, model.outlets, selected, perform]);

    const bindingScope = useMemo(() => createBindingScope(environment.availableSources), [environment.availableSources]);
    const editorContext = useCallback(() => createEditorContext({
        controller: { selection: undefined, selectedId: undefined, inspection: undefined, document: model.document, structure: environment.navigation?.structure ?? emptyStructure, navigationModule: undefined } as unknown as EditorControllerView,
        environment, strings: editorStrings, ownership: undefined, diagnostics: [], inCanvas: false, bindingScope, slotNames: slotNames(designStrings.navigation),
    }), [model.document, environment, editorStrings, bindingScope, designStrings]);

    const add = (name: string, anchor: Rect) => {
        const outlet = model.outlets.design(name);
        if (!outlet || readOnly || inFlight) return;
        if (outlet.outletKind === OutletKind.Actions) { setPicker(current => current?.outlet === name ? undefined : { outlet: name, anchor }); return; }
        setSelected({ outlet: name });
        perform(name, outlet.add(outlet.designMode.addActions[0].id));
    };

    const hook = (name: string, sliceId: string) => {
        const outlet = model.outlets.design(name);
        const slice = environment.stateChangeSlices.find(candidate => candidate.id === sliceId);
        setPicker(undefined);
        if (!outlet || !slice) return;
        const item = { kind: OutletItemKind.Button, id: nextElementId(), title: slice.name, slice: slice.id } as OutletItem;
        perform(name, outlet.addItem(item));
    };

    // A press on an item of an outlet selects it; nothing the template draws is played here - it is a place to design, and a link would leave the board.
    const press = (event: MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest('.studio-level-surface__chrome')) return;
        const item = target.closest<HTMLElement>('[data-scene-outlet-item]');
        const outlet = item?.closest<HTMLElement>('[data-scene-outlet]')?.dataset.sceneOutlet;
        if (item && outlet) {
            event.preventDefault();
            event.stopPropagation();
            setPicker(undefined);
            setSelected({ outlet, itemId: item.dataset.sceneOutletItem ?? '' });
            return;
        }
        if (target.closest('a, button, [role="button"], [role="tab"], [role="menuitem"]')) { event.preventDefault(); event.stopPropagation(); }
        else setSelected(undefined);
    };

    const keys = (event: KeyboardEvent<HTMLDivElement>) => {
        if (handleDesignModeKey(event, state, () => {
            const title = surface.current?.querySelector<HTMLInputElement>('.studio-design-toolbar__title');
            title?.focus({ preventScroll: true });
            return !!title;
        })) return;
        if (event.key === 'Escape') { setPicker(undefined); setModeAt(undefined); }
    };

    const drawn = element === undefined ? null : (
        <>
            {strip && <div className='studio-level-surface__strip' data-level-surface-strip><SceneElementView element={strip} registry={runtime.registry} resolveBinding={() => undefined} /></div>}
            <SceneElementView element={element} registry={runtime.registry} resolveBinding={() => undefined} />
        </>
    );
    const kindName = (kind: OutletKind) => outletStrings.kinds[kind] ?? kind;
    const wantedMissing = !exposesKind(model.exposed, wantedKind);
    const bounds: Rect = { left: 0, top: 0, width: geometry.designWidth, height: geometry.designHeight };
    const zoomLabel = strings.zoomed(Math.round(geometry.scale * 100));

    return (
        <section className='studio-level-surface' aria-label={strings.region(entry.displayName)} data-level-surface={entry.id} aria-busy={inFlight}>
            {wantedMissing && (
                <div className='studio-level-surface__notice' role='status' data-level-surface-notice='no-outlet'>
                    <p className='studio-level-surface__notice-text'>
                        <strong>{model.exposed.length === 0 ? strings.noOutletsAtAll : strings.noOutletOfKind(kindName(wantedKind))}</strong>
                        {' '}{strings.noOutletHint}
                    </p>
                    <div className='studio-level-surface__notice-actions'>
                        {onChooseAnotherTemplate && !readOnly && <button type='button' data-level-surface-action='choose-another' onClick={onChooseAnotherTemplate}>{strings.chooseAnotherTemplate}</button>}
                        {onAddOutletToTemplate && !readOnly && <button type='button' data-level-surface-action='add-outlet' onClick={onAddOutletToTemplate}>{strings.addOutletToTemplate}</button>}
                    </div>
                </div>
            )}
            <div className='studio-level-surface__controls'>
                <label>
                    <span>{labels.size}</span>
                    <select value={size} onChange={event => setSize(event.target.value as TemplatePreviewSize)}>
                        {Object.values(TemplatePreviewSize).map(value => <option key={value} value={value}>{labels.sizes[value] ?? value}</option>)}
                    </select>
                </label>
                {previewScreens.length > 1 && (
                    <ul className='studio-level-surface__screens' aria-label={labels.screens}>
                        {previewScreens.map(candidate => (
                            <li key={candidate.name}><button type='button' aria-pressed={candidate === previewScreen} onClick={() => setScreenName(candidate.name)}>{candidate.name}</button></li>
                        ))}
                    </ul>
                )}
                <span className='studio-level-surface__zoom' title={zoomLabel}>{zoomLabel}</span>
                {inFlight && <span className='studio-level-surface__saving' role='status'>{strings.saving}</span>}
                {readOnly && <span className='studio-level-surface__readonly'><LuLock aria-hidden='true' /></span>}
            </div>
            <div className='studio-level-surface__frame' ref={frameRef} data-size={size}>
                {element === undefined
                    ? <p className='studio-level-surface__none'>{labels.none}</p>
                    : (
                        <div className='studio-level-surface__window' style={{ width: geometry.width }}>
                            <div className='studio-level-surface__title-bar' aria-hidden='true'><span className='studio-level-surface__title'>{entry.displayName}</span></div>
                            <div className='studio-level-surface__body' style={{ height: geometry.height }}>
                                <div className='studio-level-surface__stage' style={{ width: geometry.designWidth, height: geometry.designHeight, transform: `scale(${geometry.scale})`, ['--studio-surface-viewport-height' as string]: `${geometry.designHeight}px` }}>
                                    <ErrorBoundary fallback={<p role='alert'>{labels.failed}</p>}>
                                        <SceneThemeProvider theme={theme} className={`studio-profile-theme ${profileColorSchemeClasses(theme)}`}>
                                            <div ref={surface} className='studio-level-surface__surface' tabIndex={-1} onClickCapture={press} onKeyDown={keys}>
                                                <IconAdapterProvider registry={runtime.iconAdapters}>
                                                    <LayoutConfigProvider storage={null}>
                                                        {outletsValue
                                                            ? <SceneOutletsProvider value={outletsValue}>{drawn}</SceneOutletsProvider>
                                                            : drawn}
                                                    </LayoutConfigProvider>
                                                </IconAdapterProvider>
                                                <div className='studio-level-surface__chrome'>
                                                    {placed?.map(outlet => {
                                                        const outletDesign = model.outlets.design(outlet.name);
                                                        if (!outletDesign) return null;
                                                        const { rect } = outlet;
                                                        const addAnchor = { left: rect.left + rect.width + room - 24, top: rect.top - room - 11, width: 24, height: 22 };
                                                        const hidden = outletDesign.removed;
                                                        return (
                                                            <div key={outlet.id} className='studio-level-surface__outlet' data-outlet={outletDesign.name} data-outlet-kind={outletDesign.outletKind} data-outlet-mode={outletDesign.mode}
                                                                data-selected={selected?.outlet === outlet.name ? 'true' : undefined}>
                                                                <div className='studio-design-frame' aria-hidden='true' style={{ left: rect.left - room, top: rect.top - room, width: rect.width + room * 2, height: rect.height + room * 2 }} />
                                                                <div className='studio-level-surface__tags' style={{ left: rect.left - room + 14, top: rect.top - room - 11 }}>
                                                                    <span className='studio-level-surface__kind' data-outlet-tag='kind'>
                                                                        {outletStrings.frameName(outletDesign.name, kindName(outletDesign.outletKind))}
                                                                        {outletDesign.slot ? ` · ${strings.routedTo(outletDesign.slot)}` : ''}
                                                                    </span>
                                                                    <button type='button' className='studio-level-surface__region' data-outlet-tag='region' data-sources={outletDesign.mode} disabled={readOnly || inFlight}
                                                                        title={outletStrings.tagLong(outletDesign.name, outletDesign.effective.summary)}
                                                                        aria-label={strings.changeMode(outletDesign.name, outletDesign.effective.summary)} aria-haspopup='dialog'
                                                                        onClick={event => { const opener = event.currentTarget; setModeAt(current => current?.outlet === outlet.name ? undefined : { outlet: outlet.name, anchor: { left: rect.left, top: rect.top - room - 11, width: 24, height: 22 }, opener }); }}>
                                                                        {outletDesign.effective.summary}
                                                                    </button>
                                                                </div>
                                                                {!readOnly && (
                                                                    <button type='button' className='studio-level-surface__add' data-level-add={outletDesign.name} aria-label={strings.addTo(outletDesign.name)} title={strings.addTo(outletDesign.name)}
                                                                        disabled={inFlight} style={{ left: addAnchor.left, top: addAnchor.top }} onClick={() => add(outlet.name, addAnchor)}>
                                                                        <LuPlus aria-hidden='true' />
                                                                    </button>
                                                                )}
                                                                {hidden.length > 0 && (
                                                                    <div className='studio-level-surface__hidden' data-hidden-in={outletDesign.name} style={{ left: rect.left - room, top: rect.top + rect.height + room + 4 }}>
                                                                        <span className='studio-level-surface__hidden-label'>{strings.hiddenHere}</span>
                                                                        {hidden.map(item => (
                                                                            <button key={item.id} type='button' className='studio-level-surface__bring-back' data-bring-back={item.id} disabled={readOnly || inFlight}
                                                                                aria-label={strings.bringBack(item.label)} title={strings.bringBack(item.label)}
                                                                                onClick={() => perform(outlet.name, outletDesign.bringBack(item))}>
                                                                                <s>{strings.hiddenItem(item.label, item.origin ?? '')}</s>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {!readOnly && <DesignModeChrome surface={surface} state={state} environment={environment} strings={designStrings} editorContext={editorContext} />}
                                                    {picker && (
                                                        <HookPicker anchor={picker.anchor} bounds={bounds} title={strings.hookTitle(picker.outlet)} slices={environment.stateChangeSlices} strings={strings}
                                                            onChoose={sliceId => hook(picker.outlet, sliceId)} onClose={() => setPicker(undefined)} />
                                                    )}
                                                    {modeAt && (() => {
                                                        const outletDesign = model.outlets.design(modeAt.outlet);
                                                        return outletDesign ? (
                                                            <OutletModePopover anchor={modeAt.anchor} bounds={bounds} opener={modeAt.opener} design={outletDesign} strings={outletStrings}
                                                                onChoose={(mode, copy) => { setModeAt(undefined); perform(modeAt.outlet, outletDesign.setMode(mode, copy)); }} onClose={() => setModeAt(undefined)} />
                                                        ) : null;
                                                    })()}
                                                    {notice !== '' && <div className='studio-design-toast' role='status'>{notice}</div>}
                                                    <span className='studio-design-announcement' role='status' aria-live='polite'>{announcement}</span>
                                                </div>
                                            </div>
                                        </SceneThemeProvider>
                                    </ErrorBoundary>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
            {drawnTemplate !== undefined && undrawn.length > 0 && (
                <p className='studio-level-surface__undrawn' data-level-surface-undrawn>
                    <span>{strings.notDrawn}:</span>{' '}
                    {undrawn.map(outlet => <code key={outlet.name} data-outlet={outlet.name} data-outlet-kind={outlet.kind}>{outletStrings.frameName(outlet.name, kindName(outlet.kind))}</code>)}
                </p>
            )}
        </section>
    );
};

