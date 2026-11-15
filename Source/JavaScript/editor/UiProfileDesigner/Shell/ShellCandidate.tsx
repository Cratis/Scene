// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import { Button } from '@cratis/components/Common';
import { ShellDiagnosticCode, ShellSlotAction, type SlotRemaps, type ShellSlotMove } from '@cratis/scene.engine';
import type { TemplateReference } from '@cratis/scene.model';
import type { UiProfileSettings } from '../../UiProfile/UiProfileSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import { formatMessage } from '../../UiProfile/formatMessage';
import { ProfileCanvas } from '../Window/ProfileCanvas';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { remapChoicesOf, remapFromKey, remapKey, remapRowsOf } from './remapRows';
import { planSwitchTo, type ShellSwitchContext } from './shellSwitch';
import type { ShellSwitchToApply } from './applyShellSwitchToDocuments';
import { shellDisplayName } from './shellDisplayName';

export interface ShellCandidateProps {
    settings: UiProfileSettings;
    context: ShellSwitchContext;

    // The template selected in the browser, as the profile would store it.
    candidate: TemplateReference | undefined;
    strings: UiProfileDesignerStrings;

    // Whether the host can move content out of a slot. Without it a switch that needs that is not offered.
    canRemap: boolean;
    onUse: (settings: UiProfileSettings, remaps: SlotRemaps, name: string, moves: readonly ShellSlotMove[], application: ShellSwitchToApply) => void;
}

const previewSize = { width: 600, height: 420 };
const decided = [ShellSlotAction.MoveToPrimary, ShellSlotAction.MapTo, ShellSlotAction.Drop];

// What the browser's pane shows when the shell is being chosen: the application drawn in the selected template - its own navigation, sample data and
// theme - with Current and Candidate to flip between, what switching would do, and, only when screens would be left without a slot, what to do with
// their content. What is allowed and what happens to each slot is Scene's (`planShellSwitch`); this draws it and hands the result over as one edit.
export const ShellCandidate = ({ settings, context, candidate, strings, canRemap, onUse }: ShellCandidateProps) => {
    const text = strings.shell.dialog;
    const [remaps, setRemaps] = useState<SlotRemaps>({});
    const [showing, setShowing] = useState<'current' | 'candidate'>('candidate');

    const switched = useMemo(() => candidate === undefined ? undefined : planSwitchTo(settings, candidate, context, remaps), [candidate, settings, context, remaps]);
    const inPlace = useMemo(() => resolveUiProfile(settings, context.bundles), [settings, context.bundles]);
    const candidateResolved = useMemo(() => switched === undefined ? undefined : resolveUiProfile(switched.settings, context.bundles), [switched, context.bundles]);

    const rows = switched === undefined ? [] : remapRowsOf(switched.plan, remaps);
    const slotChoices = switched === undefined ? [] : remapChoicesOf(switched.candidate);
    const remapped = switched?.plan.moves.filter(move => move.screens.length > 0 && decided.includes(move.action)) ?? [];
    // What is left for the slots to decide is the table's; the blockers listed are the other reasons the shell cannot be used.
    const blockers = switched?.plan.blockers.filter(blocker => blocker.code !== ShellDiagnosticCode.ProfileSlotUnplaced) ?? [];
    const noChange = switched === undefined || switched.plan.isNoOp;
    const canUse = switched !== undefined && !noChange && switched.plan.canSwitch && (canRemap || remapped.length === 0);
    const side = noChange || showing === 'current' || candidateResolved === undefined ? 'current' : 'candidate';
    const shown = side === 'current' || candidateResolved === undefined ? inPlace : candidateResolved;
    const shownSettings = side === 'current' || switched === undefined ? settings : switched.settings;

    const use = () => {
        if (switched !== undefined && canUse) onUse(switched.settings, remaps, shellDisplayName(switched.candidate), remapped, { plan: switched.plan, templates: switched.templates });
    };

    return (
        <div className='studio-shell-switch__detail'>
            <div role='radiogroup' aria-label={text.showing} className='studio-shell-switch__toggle'
                onKeyDown={event => { if (event.key === ' ' && (event.target as HTMLElement).getAttribute('role') !== 'radio') { event.preventDefault(); setShowing(value => value === 'current' ? 'candidate' : 'current'); } }}>
                {(['current', 'candidate'] as const).map(name => (
                    <button key={name} type='button' role='radio' aria-checked={side === name} disabled={noChange && name === 'candidate'} onClick={() => setShowing(name)}>{text[name]}</button>
                ))}
            </div>
            <div className='studio-shell-switch__preview' role='region' aria-label={text.previewLabel}>
                <ProfileCanvas key={`${side}|${candidate === undefined ? '' : `${candidate.blueprint ?? ''}|${candidate.id}`}`}
                    settings={shownSettings} resolved={shown} bundles={context.bundles} strings={strings} size={previewSize} previewing onExitPreview={() => undefined} problemCount={0}
                    ownTemplates={context.library.own?.screenTemplates} />
            </div>
            {switched !== undefined && (
                <div className='studio-shell-switch__plan' aria-live='polite'>
                    <h3>{text.plan.heading}</h3>
                    {switched.plan.isNoOp && <p>{text.noChange}</p>}
                    {switched.plan.addPackages.map(name => <p key={name} role='note'>{formatMessage(text.adds, { blueprint: name })}</p>)}
                    {!switched.plan.isNoOp && switched.plan.moves.every(move => move.screens.length === 0) && <p>{text.plan.nothingMoves}</p>}
                    <ul className='studio-shell-switch__moves'>
                        {switched.plan.moves.filter(move => move.screens.length > 0 && !rows.some(row => row.slot === move.slot)).map(move => <li key={move.slot}>{move.description}</li>)}
                    </ul>
                    {rows.length > 0 && (
                        <section className='studio-shell-switch__remap'>
                            <h4>{text.remap.heading}</h4>
                            <p>{text.remap.intro}</p>
                            <table>
                                <thead><tr><th scope='col'>{text.remap.slot}</th><th scope='col'>{text.remap.usedBy}</th><th scope='col'>{text.remap.chosen}</th></tr></thead>
                                <tbody>
                                    {rows.map(row => (
                                        <tr key={row.slot}>
                                            <th scope='row'>{row.slot}</th>
                                            <td>{row.screens.join(', ')}</td>
                                            <td>
                                                <select aria-label={`${text.remap.chosen}: ${row.slot}`} value={remapKey(row.chosen)}
                                                    onChange={event => {
                                                        const decision = remapFromKey(event.target.value, slotChoices);
                                                        setRemaps(previous => {
                                                            const next = { ...previous };
                                                            if (decision === undefined) delete next[row.slot]; else next[row.slot] = decision;
                                                            return next;
                                                        });
                                                    }}>
                                                    <option value=''>{text.remap.choose}</option>
                                                    {slotChoices.map(option => (
                                                        <option key={remapKey(option)} value={remapKey(option)}>
                                                            {option.action === ShellSlotAction.MoveToPrimary ? formatMessage(text.remap.moveToPrimary, { slot: option.target })
                                                                : option.action === ShellSlotAction.MapTo ? formatMessage(text.remap.mapTo, { target: option.target }) : text.remap.drop}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    )}
                    {blockers.length > 0 && (
                        <div role='alert' className='studio-shell-switch__blockers'>
                            <h4>{text.plan.blockers}</h4>
                            <ul>{blockers.map(blocker => <li key={`${blocker.code}:${blocker.subject ?? ''}`}>{blocker.message}</li>)}</ul>
                        </div>
                    )}
                    {!canRemap && remapped.length > 0 && <p role='note'>{text.remap.cannotApply}</p>}
                    {switched.plan.warnings.length > 0 && (
                        <div role='note' className='studio-shell-switch__warnings'>
                            <h4>{text.plan.warnings}</h4>
                            <ul>{switched.plan.warnings.map(warning => <li key={`${warning.code}:${warning.subject ?? ''}`}>{warning.message}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
            <div className='studio-shell-switch__use'>
                <Button label={text.useThis} disabled={!canUse} onClick={use} />
            </div>
        </div>
    );
};
