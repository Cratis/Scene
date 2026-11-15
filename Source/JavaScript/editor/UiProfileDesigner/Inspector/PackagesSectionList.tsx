// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { MoveDirection, PackageEditOutcome, addPackage, findSupplier, movePackage, removePackage } from '@cratis/scene.engine';
import { formatMessage } from '../../UiProfile/formatMessage';
import type { DesignedProfile } from '../Session/DesignedProfile';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { Field } from './Field';
import type { SceneAnswers } from './sceneAnswers';
import { withPackageEdit } from './sceneProfileOf';

export interface PackagesSectionListProps {
    settings: DesignedProfile;
    answers: SceneAnswers;
    strings: UiProfileDesignerStrings;
    onEdit: (next: DesignedProfile, label: string) => void;

    /** Called with Scene's sentence when an edit was refused or did more than was asked, so the status bar can say so. */
    onNote?: (message: string) => void;
}

/**
 * The Packages section: the ordered list with Scene's reason for every row and the lock on the ones that cannot go, what can be added, and who
 * supplies each component a package list overlaps on. Every answer and every edit is Scene's; this draws them.
 */
export const PackagesSectionList = ({ settings, answers, strings, onEdit, onNote }: PackagesSectionListProps) => {
    const text = strings.editor.packages;
    const [component, setComponent] = useState('');
    const { packageList } = answers;

    const edit = (made: ReturnType<typeof addPackage>, label: string) => {
        if (made.outcome === PackageEditOutcome.Refused) { onNote?.(made.message); return; }
        if (made.outcome === PackageEditOutcome.Unchanged) return;
        onEdit(withPackageEdit(settings, made), label);
        if (made.message !== '') onNote?.(made.message);
    };

    const collisions = packageList.suppliers.filter(row => row.others.length > 0);
    const supplier = component.trim() === '' ? undefined : findSupplier(packageList, component.trim());

    return (
        <>
            <p className='studio-inspector-order'>{text.order}</p>
            <ol className='studio-inspector-packages' aria-label={strings.nodes.packages}>
                {packageList.rows.map(row => (
                    <li key={row.name} data-package={row.name} data-locked={row.lock !== undefined || undefined} tabIndex={0}
                        onKeyDown={event => {
                            if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') || event.target !== event.currentTarget) return;
                            event.preventDefault();
                            const direction = event.key === 'ArrowUp' ? MoveDirection.Up : MoveDirection.Down;
                            if (direction === MoveDirection.Up ? row.canMoveUp : row.canMoveDown) edit(movePackage(answers.profile, answers.manifests, row.name, direction), strings.edits.reorderPackages);
                        }}>
                        <div className='studio-inspector-packages__main'>
                            <span className='studio-inspector-packages__name'>{row.displayName}</span>
                            <span className='studio-inspector-packages__version'>{row.version}</span>
                            <span className='studio-inspector-packages__reason'>{row.reason.text}</span>
                            {row.lock !== undefined && <span className='studio-inspector-packages__lock' title={row.lock.text}>{text.locked}: {row.lock.text}</span>}
                        </div>
                        <div className='studio-inspector-packages__actions'>
                            <button type='button' aria-label={formatMessage(text.up, { name: row.displayName })} disabled={!row.canMoveUp} onClick={() => edit(movePackage(answers.profile, answers.manifests, row.name, MoveDirection.Up), strings.edits.reorderPackages)}>↑</button>
                            <button type='button' aria-label={formatMessage(text.down, { name: row.displayName })} disabled={!row.canMoveDown} onClick={() => edit(movePackage(answers.profile, answers.manifests, row.name, MoveDirection.Down), strings.edits.reorderPackages)}>↓</button>
                            <button type='button' aria-label={formatMessage(text.remove, { name: row.displayName })} disabled={row.lock !== undefined} title={row.lock?.text} onClick={() => edit(removePackage(answers.profile, answers.manifests, row.name), strings.edits.removePackage)}>×</button>
                        </div>
                    </li>
                ))}
            </ol>
            <Field label={text.add}>
                {packageList.addable.length === 0
                    ? <p className='studio-inspector-field__hint'>{text.allAdded}</p>
                    : (
                        <div className='studio-inspector-cards studio-inspector-cards--packages'>
                            {packageList.addable.map(item => (
                                <button key={item.name} type='button' title={item.text} onClick={() => edit(addPackage(answers.profile, answers.manifests, item.name), strings.edits.addPackage)}>
                                    <span className='studio-inspector-card__title'>{item.displayName}</span>
                                    <span className='studio-inspector-card__meta'>{item.description}</span>
                                    {item.alsoAdds.length > 0 && <span className='studio-inspector-card__note'>{item.text}</span>}
                                </button>
                            ))}
                        </div>
                    )}
            </Field>
            <Field label={text.suppliers}>
                {collisions.length === 0
                    ? <p className='studio-inspector-field__hint'>{text.noCollisions}</p>
                    : (
                        <table className='studio-inspector-suppliers'>
                            <tbody>
                                {collisions.map(row => (
                                    <tr key={row.component}>
                                        <th scope='row'>{row.component}</th>
                                        <td>{formatMessage(text.supplier, { component: row.component, winner: row.winner })}</td>
                                        <td>{formatMessage(text.overrides, { others: row.others.join(', ') })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                <label className='studio-inspector-resolver'>
                    <span>{text.resolverLabel}</span>
                    <input type='text' value={component} placeholder={text.resolverPlaceholder} onChange={event => setComponent(event.target.value)} />
                </label>
                {supplier !== undefined && <p className='studio-inspector-field__hint' role='status'>{formatMessage(text.supplier, { component: supplier.component, winner: supplier.winner })}{supplier.others.length > 0 ? ` ${formatMessage(text.overrides, { others: supplier.others.join(', ') })}` : ''}</p>}
                {component.trim() !== '' && supplier === undefined && <p className='studio-inspector-field__hint' role='status'>{formatMessage(text.resolverUnknown, { component: component.trim() })}</p>}
            </Field>
        </>
    );
};
