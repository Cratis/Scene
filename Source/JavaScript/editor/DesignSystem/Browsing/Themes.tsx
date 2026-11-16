// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button, TextInput } from '@cratis/components/Common';
import type { DesignSystem } from '@cratis/scene.model';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import { fill } from '../fill';
import { Chip } from '../Parts/Chip';
import { Panel } from '../Parts/Panel';
import { defaultThemeOf } from '../Resolving/designResolution';
import { contrastFindingsOf, unreadableCount } from './contrast';

export interface ThemesProps {
    /** The design system of the version shown. */
    design: DesignSystem;

    /** The theme shown. */
    theme: string;

    /** Whether the version shown is the draft, so its themes can be changed. */
    editable: boolean;

    /** Whether a change is being saved. */
    saving: boolean;

    /** Shows a theme. */
    onShow: (theme: string) => void;

    /** Adds a theme as a copy of another; answers why it could not be added. */
    onAdd: (name: string, copyOf: string) => Promise<string | undefined>;

    /** Removes a theme; answers why it could not be removed. */
    onRemove: (name: string) => Promise<string | undefined>;

    /** Makes a theme the default; answers why it could not be. */
    onMakeDefault: (name: string) => Promise<string | undefined>;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

/**
 * The themes that implement the design system: which is the default - the one an application is drawn in - and, on a draft,
 * adding a theme as a copy of another (a brand variant), removing one and choosing the default.
 */
export const Themes = ({ design, theme, editable, saving, onShow, onAdd, onRemove, onMakeDefault, strings }: ThemesProps) => {
    const words = strings.themes;
    const [name, setName] = useState('');
    const [error, setError] = useState<string | undefined>();
    const source = defaultThemeOf(design);
    const findings = contrastFindingsOf(design);

    const run = async (action: () => Promise<string | undefined>) => setError(await action());
    const add = async () => {
        const problem = await onAdd(name.trim(), source);
        setError(problem);
        if (problem === undefined) setName('');
    };

    return (
        <Panel title={words.title} description={words.description}>
            <ul className='studio-design-system__rows'>
                {design.themes.map(candidate => {
                    const unresolved = candidate.modes.reduce((total, values) => total + (values.problems?.length ?? 0), 0);
                    return (
                        <li key={candidate.name} className='studio-design-system__row'>
                            <span className='studio-design-system__row-main'>
                                <span className='studio-design-system__name'>{candidate.name}</span>
                                <span className='studio-design-system__chips'>
                                    {candidate.isDefault === true && <Chip tone='positive'>{words.isDefault}</Chip>}
                                    {candidate.name === theme && <Chip tone='info'>{words.shown}</Chip>}
                                    {unreadableCount(findings.filter(finding => finding.theme === candidate.name)) > 0 && <Chip tone='critical'>{words.hardToRead}</Chip>}
                                    {unresolved > 0 && <Chip tone='critical'>{fill(words.unresolved, { count: unresolved })}</Chip>}
                                </span>
                                {candidate.description !== undefined && candidate.description !== '' && <span className='studio-design-system__note'>{candidate.description}</span>}
                            </span>
                            {candidate.name !== theme && <Button variant='ghost' label={words.show} onClick={() => onShow(candidate.name)} />}
                            {editable && candidate.isDefault !== true && <Button variant='outline' label={words.makeDefault} disabled={saving} onClick={() => void run(() => onMakeDefault(candidate.name))} />}
                            {editable && candidate.isDefault !== true && <Button variant='ghost' label={words.remove} icon='pi pi-trash' disabled={saving} onClick={() => void run(() => onRemove(candidate.name))} />}
                        </li>
                    );
                })}
            </ul>
            {editable && (
                <form className='studio-design-system__new-token' onSubmit={event => { event.preventDefault(); void add(); }}>
                    <TextInput value={name} onChange={setName} aria-label={words.newName} placeholder={words.newPlaceholder} invalid={error !== undefined} />
                    <Button type='submit' variant='outline' icon='pi pi-plus' label={fill(words.addAsCopy, { source })} disabled={saving || name.trim() === ''} />
                </form>
            )}
            {error !== undefined && <p role='alert' className='studio-design-system__error'>{error}</p>}
        </Panel>
    );
};
