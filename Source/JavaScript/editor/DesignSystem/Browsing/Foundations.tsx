// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { CSSProperties, ReactNode } from 'react';
import type { DesignSystem, TokenRole } from '@cratis/scene.model';
import { tokenAddress } from '@cratis/scene.engine';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import { fill } from '../fill';
import { NewToken } from '../Editing/NewToken';
import { TokenValueInput } from '../Editing/TokenValueInput';
import { Chip } from '../Parts/Chip';
import { EmptyNote, Panel } from '../Parts/Panel';
import { categoriesOf, roleValueIn, tokensOf, type Foundation } from '../Resolving/designResolution';

export interface FoundationsProps {
    /** The foundation shown. */
    foundation: Foundation;

    /** The design system of the version shown. */
    design: DesignSystem;

    /** The theme shown. */
    theme: string;

    /** The mode colors are shown in. */
    mode: string;

    /** Whether the version shown is the draft, so its tokens can be changed. */
    editable: boolean;

    /** Whether a change is being saved. */
    saving: boolean;

    /** Sets what the theme makes of a token in the mode shown; answers why it could not be set. */
    onSetValue: (category: string, name: string, value: string) => Promise<string | undefined>;

    /** Adds a token with what it is for and a value every mode starts with; answers why it could not be added. */
    onAddToken: (category: string, name: string, description: string, value: string) => Promise<string | undefined>;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

/**
 * What a token looks like: how a type token is drawn, in the style it names.
 *
 * @param role The token role.
 * @param resolved What it resolves to.
 * @returns The style a sample of it is drawn in.
 */
export const typeStyleOf = (role: TokenRole, resolved: string): CSSProperties =>
    role.category === 'font' || role.name.includes('family')
        ? { fontFamily: resolved }
        : role.name.includes('weight') ? { fontWeight: resolved } : { fontSize: resolved };

/**
 * A token drawn as what it is: a swatch, a sample of type, a distance, a shadow.
 *
 * @param role The token role.
 * @param resolved What it resolves to.
 * @param strings The words to use.
 * @returns The sample.
 */
export const tokenSample = (role: TokenRole, resolved: string, strings: DesignSystemEditorStrings): ReactNode => {
    if (resolved === '') return <Chip tone='critical'>{strings.foundations.noValue}</Chip>;
    const label = fill(strings.overview.swatchLabel, { name: role.name, value: resolved });
    switch (role.category) {
        case 'color': return <span className='studio-design-system__swatch' style={{ background: resolved }} aria-label={label} role='img' />;
        case 'type': case 'font': return <span className='studio-design-system__type-sample' style={typeStyleOf(role, resolved)} aria-hidden='true'>Aa</span>;
        case 'radius': return <span className='studio-design-system__swatch studio-design-system__swatch--tint' style={{ borderRadius: resolved }} aria-hidden='true' />;
        case 'space': case 'size': case 'border': return <span className='studio-design-system__distance' style={{ width: resolved }} aria-hidden='true' />;
        case 'shadow': return <span className='studio-design-system__swatch studio-design-system__swatch--card' style={{ boxShadow: resolved }} aria-hidden='true' />;
        default: return <span className='studio-design-system__raw-value'>{resolved}</span>;
    }
};

/**
 * The tokens of one foundation, each shown as what it is - a swatch, a sample of type, a distance, a shadow - with what it
 * is for and, on a draft, changed in place in the theme shown.
 */
export const Foundations = ({ foundation, design, theme, mode, editable, saving, onSetValue, onAddToken, strings }: FoundationsProps) => {
    const { title, description } = strings.foundations[foundation];
    const roles = tokensOf(design, foundation);
    const [firstCategory] = categoriesOf(foundation);

    return (
        <Panel title={title} description={description}>
            {roles.length === 0 && (
                <EmptyNote
                    title={fill(strings.foundations.emptyTitle, { title: title.toLowerCase() })}
                    description={editable ? strings.foundations.emptyEditable : strings.foundations.emptyReadOnly} />
            )}
            <ul className='studio-design-system__rows'>
                {roles.map(role => {
                    const resolved = roleValueIn(design, theme, mode, role);
                    const address = tokenAddress(role);
                    return (
                        <li key={address} className='studio-design-system__row'>
                            {tokenSample(role, resolved, strings)}
                            <span className='studio-design-system__row-main'>
                                <span className='studio-design-system__name'>{address}</span>
                                {role.description !== undefined && role.description !== '' && <span className='studio-design-system__note'>{role.description}</span>}
                            </span>
                            {editable
                                ? <TokenValueInput value={resolved} label={fill(strings.foundations.valueOf, { token: address })} disabled={saving} onCommit={value => onSetValue(role.category, role.name, value)} />
                                : <span className='studio-design-system__raw-value'>{resolved}</span>}
                        </li>
                    );
                })}
            </ul>
            {editable && (
                <div className='studio-design-system__entry'>
                    <NewToken
                        prefix={`${firstCategory}.`}
                        valueLabel={strings.tokenEntry.value}
                        withDescription
                        strings={strings.tokenEntry}
                        onAdd={(name, value, what) => onAddToken(firstCategory, name, what, value)}
                        disabled={saving} />
                </div>
            )}
        </Panel>
    );
};
