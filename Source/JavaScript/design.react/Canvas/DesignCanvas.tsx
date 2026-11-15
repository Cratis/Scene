// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { findScreenLinks, type DesignMode, type DesignSystemProposal } from '@cratis/scene.design';
import type { DesignCanvasHost } from '../Host/DesignCanvasHost';
import { DesignCanvasHostProvider } from '../Host/DesignCanvasHostContext';
import { designStringsOf } from '../Host/defaultDesignStrings';
import { ChatBar } from '../Chat/ChatBar';
import { CommentsPanel } from '../Panels/CommentsPanel';
import { EditOverlay, type EditorKit } from '../Panels/EditOverlay';
import { HistoryPanel } from '../Panels/HistoryPanel';
import { ProposalList } from '../Panels/ProposalList';
import { TemplateSetPicker } from '../Panels/TemplateSetPicker';
import { TemplatesPanel } from '../Panels/TemplatesPanel';
import { TweaksPanel } from '../Panels/TweaksPanel';
import type { PinAnchor } from '../State/commentPins';
import { addStoryline, arrowsOf, stepsOf, toggleStep } from '../State/storylines';
import { buildableTemplates, templateChoices } from '../State/templateSet';
import { activeTweaks } from '../State/tweakControls';
import { useCandidateDocuments, openVariationGroup } from '../State/useCandidateDocuments';
import { useDesignChat } from '../State/useDesignChat';
import { focusedScreenOf, useDesignModel } from '../State/useDesignModel';
import { Artboard } from './Artboard';
import { NewScreenForm } from './NewScreenForm';
import { StorylineBar } from './StorylineBar';
import { VariationStrip } from './VariationStrip';
import './DesignCanvas.css';

export interface DesignCanvasProps {
    /** Everything the canvas needs from the application it is mounted in. The canvas is mounted once per subject: a story, an issue, ... */
    host: DesignCanvasHost;
    /** What a subject with no design yet starts as: screens, or - to design the design system's screen templates - templates. */
    mode?: DesignMode;
    /** The templates a design that has not started is limited to. */
    templateSet?: string[];
    /** The screen to focus first. */
    initialScreen?: string;
    /** The words, layouts, icons and palette of the screen editor, when the host dresses it itself. */
    editorKit?: EditorKit;
    className?: string;
}

type SideTab = 'history' | 'tweaks' | 'comments' | 'templates';

const zoomSteps = [0.4, 0.5, 0.65, 0.8, 1, 1.25, 1.5];

/**
 * The AI canvas: a design's screens as artboards along a storyline, a chat bar to ask for changes, layouts to choose between, tweaks, a revision
 * history and comment pins - and the Scene editor for what is quicker by hand. It draws no page chrome of its own: it fills the box it is given, so a
 * host mounts it as one tab of a larger workspace. All state lives in the session the host stores; nothing here reaches for anything else of the host.
 */
export const DesignCanvas = ({ host, mode, templateSet, initialScreen, editorKit, className }: DesignCanvasProps) => {
    const model = useDesignModel(host, { ...(mode === undefined ? {} : { mode }), ...(templateSet === undefined ? {} : { templateSet }) });
    const chat = useDesignChat(host, model);
    const strings = useMemo(() => designStringsOf(host.strings), [host.strings]);
    const { session, workspace, context, screenSet, actions } = model;
    const designMode: DesignMode = session?.mode ?? mode ?? 'screens';

    const [chosen, setChosen] = useState<string | undefined>(initialScreen);
    const [storyline, setStoryline] = useState(screenSet.defaultStoryline);
    const [zoom, setZoom] = useState(1);
    const [tab, setTab] = useState<SideTab>('history');
    const [editing, setEditing] = useState(false);
    const [adding, setAdding] = useState(false);
    const [commenting, setCommenting] = useState(false);
    const [pending, setPending] = useState<{ screen: string; anchor: PinAnchor } | undefined>();
    const [openComment, setOpenComment] = useState<string | undefined>();
    const [proposals, setProposals] = useState<readonly DesignSystemProposal[]>([]);
    const [problem, setProblem] = useState<string | undefined>();

    const focused = focusedScreenOf(session, chosen);
    const lastFocus = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (lastFocus.current === focused) return;
        lastFocus.current = focused;
        host.routing?.screenFocused?.(focused);
    }, [focused, host.routing]);

    const effectiveStoryline = screenSet.storylines.some(candidate => candidate.name === storyline) || storyline === screenSet.defaultStoryline ? storyline : screenSet.defaultStoryline;
    const steps = useMemo(() => session === undefined ? [] : stepsOf(screenSet, designMode === 'templates' ? screenSet.defaultStoryline : effectiveStoryline), [session, screenSet, effectiveStoryline, designMode]);
    const arrows = useMemo(() => designMode === 'templates' || workspace === undefined ? [] : arrowsOf(steps, findScreenLinks(workspace.document)), [designMode, workspace, steps]);

    const choices = useMemo(() => session === undefined ? [] : templateChoices(host.catalogue.input(), session), [host.catalogue, session]);
    const tweaks = useMemo(() => session === undefined || workspace === undefined ? [] : activeTweaks(session, focused, workspace, context), [session, workspace, context, focused]);
    const openGroup = session === undefined || focused === undefined ? undefined : openVariationGroup(session.variationGroups, focused);
    const candidates = useCandidateDocuments(host.screenplay, openGroup, designMode);

    const showScreen = useCallback((screen: string) => setChosen(screen), []);
    const attempt = useCallback(async (work: () => Promise<unknown>) => {
        setProblem(undefined);
        try { await work(); } catch (error) { setProblem(error instanceof Error ? error.message : String(error)); }
    }, []);

    const viewport = useRef<HTMLDivElement>(null);
    const row = useRef<HTMLDivElement>(null);
    const [rowSize, setRowSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const element = row.current;
        if (element === null || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(() => setRowSize({ width: element.offsetWidth, height: element.offsetHeight }));
        observer.observe(element);
        return () => observer.disconnect();
    }, [steps.length]);

    const addScreen = async (name: string, template: string | undefined): Promise<string | undefined> => {
        const recorded = designMode === 'templates'
            ? await actions.record([{ op: 'addTemplate', name, slots: [{ name: 'content', primary: true }] }], { focus: name })
            : await actions.addScreen(name, template ?? '');
        if (recorded.refusals.length > 0) return recorded.refusals[0]!.reason;
        setChosen(name);
        return undefined;
    };

    if (session === undefined) return <section className={`design-canvas ${className ?? ''}`} aria-busy='true' />;

    const selectedElement = openComment === undefined ? undefined : session.comments.find(comment => comment.id === openComment)?.elementId;
    const document = workspace?.document;
    const choose = (name: string) => { setStoryline(name); };

    return (
        <DesignCanvasHostProvider host={host}>
            <section className={`design-canvas ${className ?? ''}`} aria-label='Design canvas' data-mode={designMode}>
                <header className='design-canvas__toolbar'>
                    <button type='button' className='design-canvas__add' onClick={() => setAdding(open => !open)} aria-expanded={adding}>{strings.newScreen}</button>
                    {designMode === 'screens' && (
                        <StorylineBar
                            set={screenSet}
                            storyline={effectiveStoryline}
                            {...(focused === undefined ? {} : { screen: focused })}
                            editable={host.storylines !== undefined}
                            strings={strings}
                            onChoose={choose}
                            onAdd={name => { const next = addStoryline(screenSet, name); if (next !== undefined) void attempt(async () => { await actions.saveStorylines(next); setStoryline(name.trim()); }); }}
                            onToggleStep={(name, screen) => { void attempt(() => actions.saveStorylines(toggleStep(screenSet, name, screen))); }} />
                    )}
                    <span className='design-canvas__spacer' />
                    {focused !== undefined && (
                        <>
                            <button type='button' aria-pressed={commenting} className={commenting ? 'design-canvas__tool design-canvas__tool--on' : 'design-canvas__tool'} onClick={() => setCommenting(on => !on)}>{strings.addComment}</button>
                            <button type='button' className='design-canvas__tool' onClick={() => setEditing(true)} disabled={document === undefined}>{strings.edit}</button>
                        </>
                    )}
                    <span className='design-canvas__zoom' role='group' aria-label='Zoom'>
                        <button type='button' aria-label='Zoom out' disabled={zoom <= zoomSteps[0]!} onClick={() => setZoom(current => [...zoomSteps].reverse().find(step => step < current) ?? current)}>−</button>
                        <span>{Math.round(zoom * 100)}%</span>
                        <button type='button' aria-label='Zoom in' disabled={zoom >= zoomSteps[zoomSteps.length - 1]!} onClick={() => setZoom(current => zoomSteps.find(step => step > current) ?? current)}>+</button>
                    </span>
                </header>
                {adding && (
                    <NewScreenForm
                        mode={designMode}
                        templates={buildableTemplates(choices)}
                        strings={strings}
                        onAdd={addScreen}
                        onClose={() => setAdding(false)} />
                )}
                {(problem !== undefined || model.workspaceError !== undefined) && <p role='alert' className='design-canvas__problem'>{problem ?? model.workspaceError}</p>}
                <div className='design-canvas__main'>
                    <div className='design-canvas__stage'>
                        <div ref={viewport} className='design-canvas__viewport'>
                            {steps.length === 0
                                ? <p className='design-canvas__empty'>{strings.noScreens}</p>
                                : (
                                    <div className='design-canvas__scaler' style={{ width: rowSize.width * zoom, height: rowSize.height * zoom }}>
                                        <div ref={row} className='design-canvas__row' style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                                            {steps.map((name, index) => {
                                                const arrow = arrows.find(candidate => candidate.from === name);
                                                const caption = captionOf(document, name, designMode);
                                                return (
                                                    <Fragment key={name}>
                                                        <Artboard
                                                            name={name}
                                                            mode={designMode}
                                                            document={document}
                                                            runtime={host.catalogue.runtime}
                                                            scale={zoom}
                                                            selected={focused === name}
                                                            comments={session.comments}
                                                            commenting={commenting && focused === name}
                                                            {...(openComment === undefined ? {} : { selectedComment: openComment })}
                                                            position={{ index, count: steps.length }}
                                                            {...(caption === undefined ? {} : { caption })}
                                                            onSelect={() => showScreen(name)}
                                                            onMove={target => { void attempt(() => actions.moveScreen(name, target)); }}
                                                            onPlaceComment={anchor => { setPending({ screen: name, anchor }); setTab('comments'); setCommenting(false); }}
                                                            onOpenComment={id => { setOpenComment(id); showScreen(name); setTab('comments'); }}>
                                                            {openGroup !== undefined && openGroup.screen === name && (
                                                                <VariationStrip
                                                                    group={openGroup}
                                                                    documents={candidates}
                                                                    runtime={host.catalogue.runtime}
                                                                    chooseLabel={strings.choose}
                                                                    onChoose={candidateId => { void attempt(() => actions.chooseVariation(openGroup.id, candidateId)); }} />
                                                            )}
                                                        </Artboard>
                                                        {index < steps.length - 1 && <span className={`design-canvas__arrow${arrow?.linked === true ? ' design-canvas__arrow--linked' : ''}`} aria-hidden='true' data-linked={arrow?.linked === true}>→</span>}
                                                    </Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            {editing && focused !== undefined && document !== undefined && (
                                <EditOverlay
                                    key={`${focused}:${session.screens.find(entry => entry.screen === focused)?.currentRevision ?? ''}`}
                                    screen={focused}
                                    mode={designMode}
                                    document={document}
                                    catalogue={host.catalogue}
                                    strings={strings}
                                    {...(editorKit === undefined ? {} : { kit: editorKit })}
                                    {...(session.templateSet === undefined ? {} : { templateSet: session.templateSet })}
                                    onSave={async after => { await actions.saveEdit(after); }}
                                    onClose={() => setEditing(false)} />
                            )}
                        </div>
                    </div>
                    <aside className='design-canvas__side' aria-label='Design details'>
                        <div className='design-canvas__tabs' role='tablist'>
                            {(['history', 'tweaks', 'comments', 'templates'] as const).map(candidate => (
                                <button key={candidate} type='button' role='tab' aria-selected={tab === candidate} className={tab === candidate ? 'design-canvas__tab design-canvas__tab--on' : 'design-canvas__tab'} onClick={() => setTab(candidate)}>
                                    {candidate === 'history' ? strings.history : candidate === 'tweaks' ? strings.tweaks : candidate === 'comments' ? strings.comments : strings.templates}
                                </button>
                            ))}
                        </div>
                        <div className='design-canvas__panel' role='tabpanel'>
                            <ProposalList
                                proposals={proposals}
                                strings={strings}
                                onPropose={(index, proposal) => { void attempt(async () => { await actions.proposeToSystem(proposal); setProposals(current => current.filter((_, at) => at !== index)); }); }}
                                onDismiss={index => setProposals(current => current.filter((_, at) => at !== index))} />
                            {tab === 'history' && (focused === undefined
                                ? <p className='design-panel__empty'>{strings.noHistory}</p>
                                : <HistoryPanel
                                    session={session}
                                    screen={focused}
                                    strings={strings}
                                    onRevert={revisionId => { void attempt(() => actions.revert(focused, revisionId)); }}
                                    onRevertTurn={turnId => { void attempt(() => actions.revertTurn(turnId)); }} />)}
                            {tab === 'tweaks' && (
                                <TweaksPanel
                                    tweaks={tweaks}
                                    context={context}
                                    strings={strings}
                                    onChange={(tweakId, value) => {
                                        const tweak = session.tweaks.find(candidate => candidate.id === tweakId);
                                        if (tweak !== undefined) void attempt(async () => { const applied = await actions.applyTweak(tweak, value); if (applied.proposals.length > 0) setProposals(current => [...current, ...applied.proposals]); });
                                    }}
                                    onDismiss={tweakId => { void attempt(() => actions.dismissTweak(tweakId)); }} />
                            )}
                            {tab === 'comments' && (focused === undefined
                                ? <p className='design-panel__empty'>{strings.noComments}</p>
                                : <CommentsPanel
                                    session={session}
                                    screen={focused}
                                    strings={strings}
                                    {...(openComment === undefined ? {} : { selected: openComment })}
                                    {...(pending === undefined || pending.screen !== focused ? {} : { pending: pending.anchor })}
                                    onSelect={setOpenComment}
                                    onSubmit={text => { if (pending !== undefined) void attempt(async () => { await actions.addComment(pending.screen, pending.anchor, text); setPending(undefined); }); }}
                                    onCancelPending={() => setPending(undefined)}
                                    onResolve={commentId => { void attempt(() => actions.resolveComment(commentId)); }}
                                    onReopen={commentId => { void attempt(() => actions.reopenComment(commentId)); }} />)}
                            {tab === 'templates' && (designMode === 'templates'
                                ? <TemplatesPanel session={session} strings={strings} canPropose={host.designSystem?.proposeTemplate !== undefined} onPropose={template => actions.proposeTemplate(template)} />
                                : <TemplateSetPicker choices={choices} strings={strings} onChange={next => { void attempt(() => actions.setTemplateSet(next)); }} />)}
                        </div>
                    </aside>
                </div>
                <ChatBar
                    chat={chat}
                    strings={strings}
                    focus={{ ...(focused === undefined ? {} : { screen: focused }), ...(selectedElement === undefined ? {} : { element: selectedElement }) }}
                    onShowScreen={showScreen}
                    onRevertTurn={turnId => { void attempt(() => actions.revertTurn(turnId)); }} />
            </section>
        </DesignCanvasHostProvider>
    );
};

/** What is said next to an artboard's name: the template a screen is built on, or the slot a template fills. */
function captionOf(document: { screens: { name: string; screenTemplate?: string }[]; screenTemplates: { name: string; fitsSlot?: string }[] } | undefined, name: string, mode: DesignMode): string | undefined {
    if (document === undefined) return undefined;
    if (mode === 'templates') return document.screenTemplates.find(template => template.name === name)?.fitsSlot;
    return document.screens.find(screen => screen.name === name)?.screenTemplate;
}
