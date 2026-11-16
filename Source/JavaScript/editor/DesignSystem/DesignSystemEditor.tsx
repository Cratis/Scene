// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState, type ReactNode } from 'react';
import { Button } from '@cratis/components/Common';
import { Components } from './Browsing/Components';
import { DesignSystemBanner } from './Browsing/DesignSystemBanner';
import { Foundations } from './Browsing/Foundations';
import { Overview } from './Browsing/Overview';
import { ScreenplayView } from './Browsing/ScreenplayView';
import { Themes } from './Browsing/Themes';
import { Words } from './Browsing/Words';
import { showDesignSystem, type DesignSystemView, type ShownDesignSystem } from './Browsing/designSystemView';
import { sectionEntries, type SectionEntry } from './Browsing/designSystemSections';
import { ConflictsPanel } from './Conflicts/ConflictsPanel';
import { defaultDesignSystemEditorStrings } from './defaultDesignSystemEditorStrings';
import type { DesignSystemEditorStrings } from './DesignSystemEditorStrings';
import type { DesignSystemHost, DesignSystemState } from './DesignSystemHost';
import { createDesignEdits } from './Editing/createDesignEdits';
import type { Foundation } from './Resolving/designResolution';
import { DraftChanges } from './Editing/DraftChanges';
import { draftAuthors, mayActivate, waitingForReview } from './Editing/draftReview';
import { ConfirmationBar, useConfirmation } from './Editing/useConfirmation';
import { useDesignSystemDraft } from './Editing/useDesignSystemDraft';
import { EmptyNote } from './Parts/Panel';
import { OffStandard } from './Standard/OffStandard';
import { useOffStandard } from './Standard/useOffStandard';
import { useDesignSystemState } from './useDesignSystemState';
import './DesignSystemEditor.css';

export interface DesignSystemEditorProps {
    /** Everything the editor asks of the application that embeds it. */
    host: DesignSystemHost;

    /** The editor's words. Absent: the English defaults. */
    strings?: DesignSystemEditorStrings;

    /** What the design system belongs to (a product's name, say), shown above the title. */
    subject?: string;

    /**
     * Where the editor is looking, when the host keeps it - in its address, say, so a link opens the same view. Pass it with
     * `onViewChange`. Absent: the editor keeps its own.
     */
    view?: DesignSystemView;

    /** Called with where the editor is looking after a person moves. */
    onViewChange?: (view: DesignSystemView) => void;

    /** A state to open with, so nothing is shown loading - what a host that already has it, or a story, passes. */
    initialState?: DesignSystemState;
}

const groupLabel = (strings: DesignSystemEditorStrings, group: string): string =>
    (strings.groups as Record<string, string>)[group] ?? group;

/**
 * The design system editor: a product's design system - its foundations, components, themes, words and the Screenplay it is
 * held in - read from the active version or from a draft, which can be changed by hand token by token and is activated by
 * someone who did not write it.
 *
 * The editor owns what to show and how to edit it; the host owns everything else: reading the versions, saving a change by
 * address, starting, discarding, submitting and activating a draft, conflicts, the designs held to the standard, and drawing
 * the draft on screens. See {@link DesignSystemHost}.
 */
export const DesignSystemEditor = ({ host, strings = defaultDesignSystemEditorStrings, subject, view, onViewChange, initialState }: DesignSystemEditorProps) => {
    const { state, status, reload, retry } = useDesignSystemState(host, initialState);
    const [ownView, setOwnView] = useState<DesignSystemView>({});
    const confirmation = useConfirmation(host);
    const current = view ?? ownView;
    const entries = sectionEntries(strings, state?.draft !== undefined, host.standard !== undefined, host.sections);
    const shown = state === undefined ? undefined : showDesignSystem(state, current, entries);

    const draft = useDesignSystemDraft({
        host,
        strings,
        draft: state?.draft,
        hasActive: state?.active !== undefined,
        ask: confirmation.ask,
        reload,
    });
    const standard = useOffStandard(host.standard, strings, shown?.section === 'standard' || (shown?.section === 'overview' && shown.shown === 'active'));

    const change = (patch: Partial<DesignSystemView>) => {
        const next = { ...current, ...patch };
        if (view === undefined) setOwnView(next);
        onViewChange?.(next);
    };

    const body = (): ReactNode => {
        if (state === undefined || shown === undefined) {
            return status === 'failed'
                ? (
                    <div className='studio-design-system__empty' role='alert'>
                        <strong>{strings.loadFailed}</strong>
                        <Button label={strings.retry} variant='outline' onClick={() => void retry()} />
                    </div>
                )
                : <p role='status' className='studio-design-system__note'>{strings.loading}</p>;
        }
        return (
            <>
                <DesignSystemBanner
                    state={state}
                    shown={shown.shown}
                    modes={shown.design?.modes ?? []}
                    mode={shown.mode}
                    themes={shown.design?.themes.map(theme => theme.name) ?? []}
                    theme={shown.theme}
                    waitingFor={state.draft === undefined ? undefined : waitingForReview(state.history, state.draft.number)}
                    starting={draft.busy === 'start'}
                    onShowVersion={version => change({ version: version === 'draft' ? 'draft' : undefined })}
                    onShowMode={mode => change({ mode })}
                    onShowTheme={theme => change({ theme })}
                    onStartDraft={() => void draft.start()}
                    onOpenDraft={() => change({ version: 'draft', section: 'changes' })}
                    strings={strings} />
                <ConfirmationBar pending={confirmation.pending} strings={strings.prompts} onRespond={confirmation.respond} />
                {draft.notice !== undefined && (
                    <p role={draft.notice.kind === 'failure' ? 'alert' : 'status'} className={draft.notice.kind === 'failure' ? 'studio-design-system__error' : 'studio-design-system__note'}>
                        {draft.notice.text}
                        {' '}
                        <button type='button' className='studio-design-system__link' onClick={draft.dismissNotice}>×</button>
                    </p>
                )}
                <div className='studio-design-system__layout'>
                    <Navigation entries={entries} section={shown.section} strings={strings} onChoose={section => change({ section })} />
                    <div className='studio-design-system__content'>
                        {content(state, shown)}
                    </div>
                </div>
            </>
        );
    };

    const content = (loaded: DesignSystemState, now: ShownDesignSystem): ReactNode => {
        const extra = host.sections?.find(section => section.id === now.section);
        if (extra !== undefined) return extra.render({ state: loaded, theme: now.theme, mode: now.mode, reload });
        if (now.section === 'standard') {
            return <OffStandard standard={standard} hasStandard={loaded.active !== undefined} strings={strings} />;
        }
        const { design, version, theme, mode, editable } = now;
        if (version === undefined) return <EmptyNote title={strings.noDesignSystemTitle} description={strings.noDesignSystemDescription} />;
        if (design === undefined) return <EmptyNote title={strings.unreadableTitle} description={strings.unreadableDescription} />;

        const edits = createDesignEdits(theme, now.isDefaultTheme, mode, draft.save);
        const saving = draft.busy === 'change';

        switch (now.section) {
            case 'color': case 'type': case 'spacing': case 'elevation':
                return <Foundations foundation={now.section as Foundation} design={design} theme={theme} mode={mode} editable={editable} saving={saving} onSetValue={edits.setValue} onAddToken={edits.addToken} strings={strings} />;
            case 'themes':
                return <Themes design={design} theme={theme} editable={editable} saving={saving} onShow={name => change({ theme: name })} onAdd={edits.addTheme} onRemove={edits.removeTheme} onMakeDefault={edits.makeDefault} strings={strings} />;
            case 'components':
                return (
                    <Components
                        design={design}
                        theme={theme}
                        mode={mode}
                        screenplay={version.screenplay}
                        component={now.component}
                        variant={now.variant}
                        onChoose={(component, variant) => change({ component, variant })}
                        editable={editable}
                        saving={saving}
                        onSetPart={edits.setPart}
                        strings={strings} />
                );
            case 'words':
                return <Words design={design} editable={editable} saving={saving} onSetWord={edits.setWord} strings={strings} />;
            case 'screenplay':
                return <ScreenplayView version={version} strings={strings} />;
            case 'changes': {
                const written = loaded.draft;
                if (written === undefined) return null;
                const after = written.designSystem ?? design;
                const authors = draftAuthors(loaded.history, written.number);
                return (
                    <div className='studio-design-system__stack'>
                        {host.conflicts !== undefined && (
                            <ConflictsPanel conflicts={loaded.conflicts ?? []} host={host.conflicts} reload={reload} strings={strings} />
                        )}
                        <DraftChanges
                            mode={mode}
                            active={loaded.active}
                            draft={written}
                            before={loaded.active?.designSystem}
                            after={after}
                            authors={authors}
                            mayActivate={mayActivate(authors, host.person)}
                            waitingFor={waitingForReview(loaded.history, written.number)}
                            canSubmit={host.submitDraft !== undefined}
                            submitting={draft.busy === 'submit'}
                            activating={draft.busy === 'activate'}
                            discarding={draft.busy === 'discard'}
                            onSubmit={() => void draft.submit()}
                            onActivate={() => void draft.activate()}
                            onDiscard={() => void draft.discard()}
                            preview={host.preview}
                            strings={strings} />
                    </div>
                );
            }
            default:
                return (
                    <Overview
                        design={design}
                        outline={version.outline}
                        screenplay={version.screenplay}
                        theme={theme}
                        mode={mode}
                        standard={host.standard !== undefined && now.shown === 'active' ? { ready: standard.isReady, count: standard.entries.length } : undefined}
                        onOpenStandard={() => change({ section: 'standard' })}
                        strings={strings} />
                );
        }
    };

    return (
        <div className='studio-design-system'>
            <header className='studio-design-system__header'>
                {subject !== undefined && subject !== '' && <span className='studio-design-system__eyebrow'>{subject}</span>}
                <h2 className='studio-design-system__title'>{strings.title}</h2>
                <p className='studio-design-system__description'>{strings.description}</p>
            </header>
            {body()}
        </div>
    );
};

interface NavigationProps {
    entries: readonly SectionEntry[];
    section: string;
    strings: DesignSystemEditorStrings;
    onChoose: (section: string) => void;
}

const Navigation = ({ entries, section, strings, onChoose }: NavigationProps) => (
    <nav aria-label={strings.navigationLabel} className='studio-design-system__nav'>
        {entries.map((entry, index) => (
            <div key={entry.section} className='studio-design-system__nav-item'>
                {entry.group !== 'overview' && entries[index - 1]?.group !== entry.group && (
                    <span className='studio-design-system__nav-group'>{groupLabel(strings, entry.group)}</span>
                )}
                <button
                    type='button'
                    className='studio-design-system__nav-button'
                    aria-current={entry.section === section ? 'page' : undefined}
                    onClick={() => onChoose(entry.section)}>
                    {entry.label}
                </button>
            </div>
        ))}
    </nav>
);
