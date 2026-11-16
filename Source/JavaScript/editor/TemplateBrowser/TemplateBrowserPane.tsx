// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from '@cratis/components/Common';
import { Tag } from '@cratis/components/Display';
import type { TemplateBrowserActions } from './TemplateBrowserActions';
import { TemplateBrowserActionKind } from './TemplateBrowserActionKind';
import { availableActions } from './availableActions';
import { formatTemplateBrowserMessage } from './formatTemplateBrowserMessage';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import { TemplateBrowserMode } from './TemplateBrowserMode';
import { TemplateBrowserPreview, type TemplateBrowserRuntime } from './TemplateBrowserPreview';
import type { TemplateBrowserStrings } from './TemplateBrowserStrings';
import { TemplateOrigin } from './TemplateOrigin';
import './TemplateBrowserPane.css';

export interface TemplateBrowserPaneProps {
    /** The template selected, or none. */
    entry?: TemplateBrowserEntry;
    mode: TemplateBrowserMode;
    runtime: TemplateBrowserRuntime;
    actions: TemplateBrowserActions;
    strings: TemplateBrowserStrings;

    /** Whether the template's blueprint can be run as a whole application. */
    canPreviewBlueprint: boolean;
    onPreviewBlueprint: (blueprint: string) => void;
}

/**
 * The pane beside the grid: the selected template drawn, what it is, why it does not fit the target when it does not, and what can be done with it.
 * Choosing is offered only for a template that fits, is compatible and is in the profile; the reason it is not is written next to it, never left a mystery.
 */
export function TemplateBrowserPane({ entry, mode, runtime, actions, strings, canPreviewBlueprint, onPreviewBlueprint }: TemplateBrowserPaneProps) {
    if (entry === undefined) {
        return <aside className='studio-template-pane studio-template-pane--empty' aria-label={strings.pane}><p>{strings.selectATemplate}</p></aside>;
    }

    const offered = availableActions(entry, mode, actions);
    const labels = strings.actions;
    const named = (label: string) => formatTemplateBrowserMessage(label, { name: entry.displayName });
    const button = (kind: TemplateBrowserActionKind, label: string, accessible: string, handler: () => void, primary = false) =>
        offered.includes(kind) && <Button key={kind} label={label} aria-label={named(accessible)} size='small' variant={primary ? 'solid' : 'outline'} onClick={handler} />;
    const facts: [string, string | undefined][] = [
        [strings.facts.kind, strings.kinds[entry.kind]],
        [strings.facts.category, entry.category],
        [strings.facts.package, entry.package === undefined ? undefined : `${entry.packageName ?? entry.package} ${entry.packageVersion ?? ''}`.trim()],
        [strings.facts.scopes, entry.scopes.join(', ') || undefined],
        [strings.facts.sliceKinds, entry.sliceKinds.join(', ') || undefined],
        [strings.facts.license, entry.license],
    ];

    return (
        <aside className='studio-template-pane' aria-label={strings.pane} data-selected-template={entry.id}>
            <header className='studio-template-pane__header'>
                <h2 className='studio-template-pane__title'>{entry.displayName}</h2>
                <Tag value={entry.origin === TemplateOrigin.Own ? strings.badges.own : strings.badges.blueprint} severity={entry.origin === TemplateOrigin.Own ? 'success' : 'info'} />
            </header>
            {entry.description && <p className='studio-template-pane__description'>{entry.description}</p>}
            <TemplateBrowserPreview entry={entry} runtime={runtime} strings={strings} />
            <dl className='studio-template-pane__facts'>
                {facts.filter(([, value]) => value !== undefined).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
            {!entry.applicability.applies && entry.applicability.reasons.length > 0 && (
                <section className='studio-template-pane__reasons' aria-label={strings.doesNotApplyHeading}>
                    <h3>{strings.doesNotApplyHeading}</h3>
                    <ul>{entry.applicability.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
                </section>
            )}
            {entry.problems.length > 0 && (
                <section className='studio-template-pane__problems' role='alert' aria-label={strings.problemsHeading}>
                    <h3>{strings.problemsHeading}</h3>
                    <ul>{entry.problems.map(problem => <li key={problem}>{problem}</li>)}</ul>
                </section>
            )}
            {!entry.installed && <p className='studio-template-pane__note' role='status'>{formatTemplateBrowserMessage(strings.addBlueprintFirst, { name: entry.packageName ?? entry.package ?? '' })}</p>}
            <div className='studio-template-pane__actions'>
                {button(TemplateBrowserActionKind.Choose, labels.choose, labels.chooseNamed, () => actions.onChoose?.(entry), true)}
                {button(TemplateBrowserActionKind.AddBlueprint, labels.addBlueprint, labels.addBlueprintNamed, () => entry.package !== undefined && actions.onAddBlueprint?.(entry.package), true)}
                {button(TemplateBrowserActionKind.CopyToMine, labels.copyToMine, labels.copyToMineNamed, () => actions.onCopyToMine?.(entry))}
                {button(TemplateBrowserActionKind.Edit, labels.edit, labels.editNamed, () => actions.onEdit?.(entry), true)}
                {button(TemplateBrowserActionKind.Rename, labels.rename, labels.renameNamed, () => actions.onRename?.(entry))}
                {button(TemplateBrowserActionKind.Duplicate, labels.duplicate, labels.duplicateNamed, () => actions.onDuplicate?.(entry))}
                {button(TemplateBrowserActionKind.Export, labels.export, labels.exportNamed, () => actions.onExport?.(entry))}
                {button(TemplateBrowserActionKind.Remove, labels.remove, labels.removeNamed, () => actions.onRemove?.(entry))}
                {entry.package !== undefined && canPreviewBlueprint && (
                    <Button label={strings.preview.wholeBlueprint} size='small' variant='outline' onClick={() => onPreviewBlueprint(entry.package!)} />
                )}
            </div>
        </aside>
    );
}
