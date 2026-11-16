// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from '@cratis/components/Common';
import type { DesignSystem } from '@cratis/scene.model';
import { tokenAddress } from '@cratis/scene.engine';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemOutline } from '../DesignSystemHost';
import { fill } from '../fill';
import { Panel } from '../Parts/Panel';
import { partsInState, resolvedComponentsIn, roleValueIn, tokensOf } from '../Resolving/designResolution';
import { ComponentSample } from './ComponentSample';
import { contrastFindingsOf, unreadableCount } from './contrast';
import { typeStyleOf } from './Foundations';
import { SourceView } from './SourceView';

/** What the overview says about the designs held to the standard. Absent when the host cannot find what is off it. */
export interface OverviewStandard {
    /** Whether the designs have been read. */
    ready: boolean;

    /** How many values are outside the design system. */
    count: number;
}

export interface OverviewProps {
    /** The design system of the version shown. */
    design: DesignSystem;

    /** What the version's Screenplay declares. */
    outline: DesignSystemOutline;

    /** The Screenplay text of the version shown, exactly as the compiler accepted it. */
    screenplay: string;

    /** The theme shown. */
    theme: string;

    /** The mode shown. */
    mode: string;

    /** What is off the standard. Absent when the host cannot say, or the version shown is not the standard. */
    standard?: OverviewStandard;

    /** Opens the list of what is off the standard. */
    onOpenStandard: () => void;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

/**
 * The design system at a glance: how much there is of each kind, the colors, the components drawn from their tokens,
 * and the layouts and templates the Screenplay declares. Everything comes from the version shown.
 */
export const Overview = ({ design, outline, screenplay, theme, mode, standard, onOpenStandard, strings }: OverviewProps) => {
    const words = strings.overview;
    const colors = tokensOf(design, 'color');
    const typeTokens = tokensOf(design, 'type');
    const resolved = resolvedComponentsIn(design, theme, mode);
    const unreadable = unreadableCount(contrastFindingsOf(design).filter(finding => finding.theme === theme));
    const wordCount = Object.keys(design.words?.voice ?? {}).length + Object.keys(design.words?.naming ?? {}).length;
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(screenplay);
        setCopied(true);
    };

    const summary = (): string => {
        if (standard === undefined || !standard.ready) return strings.standard.summaryReading;
        if (standard.count === 0) return strings.standard.summaryNone;
        return fill(standard.count === 1 ? strings.standard.summaryOne : strings.standard.summaryMany, { count: standard.count });
    };

    const stats: [string, number][] = [
        [words.tokens, design.tokens.length],
        [words.themes, design.themes.length],
        [words.components, design.components.length],
        [words.layouts, outline.layouts.length],
        [words.screenTemplates, outline.screenTemplates.length],
        [words.words, wordCount],
        ...(unreadable > 0 ? [[words.hardToRead, unreadable] as [string, number]] : []),
    ];

    return (
        <div className='studio-design-system__stack'>
            <dl className='studio-design-system__stats'>
                {stats.map(([label, value]) => (
                    <div key={label} className='studio-design-system__stat'>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </dl>
            {standard !== undefined && (
                <Panel title={strings.standard.title} description={strings.standard.overviewDescription}>
                    <p className='studio-design-system__sentence'>
                        {summary()}
                        {standard.ready && standard.count > 0 && (
                            <>
                                {' '}
                                <button type='button' className='studio-design-system__link' onClick={onOpenStandard}>{strings.standard.seeWhatToFix}</button>
                            </>
                        )}
                    </p>
                </Panel>
            )}
            <Panel title={words.colorTitle} description={fill(words.colorDescription, { theme, mode })}>
                {colors.length === 0
                    ? <p className='studio-design-system__note'>{words.noColors}</p>
                    : (
                        <ul className='studio-design-system__swatches'>
                            {colors.map(role => {
                                const value = roleValueIn(design, theme, mode, role);
                                return (
                                    <li key={tokenAddress(role)}>
                                        <span
                                            className='studio-design-system__swatch'
                                            role='img'
                                            aria-label={fill(words.swatchLabel, { name: role.name, value: value === '' ? words.missing : value })}
                                            style={{ background: value }} />
                                        <span className='studio-design-system__name'>{role.name}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
            </Panel>
            <Panel title={words.typeTitle} description={words.typeDescription}>
                {typeTokens.length === 0
                    ? <p className='studio-design-system__note'>{words.noType}</p>
                    : (
                        <ul className='studio-design-system__rows'>
                            {typeTokens.map(role => {
                                const value = roleValueIn(design, theme, mode, role);
                                return (
                                    <li key={tokenAddress(role)} className='studio-design-system__row'>
                                        <span className='studio-design-system__type-sample' style={typeStyleOf(role, value)} aria-hidden='true'>Aa</span>
                                        <span className='studio-design-system__row-main studio-design-system__name'>{tokenAddress(role)}</span>
                                        <span className='studio-design-system__raw-value'>{value === '' ? words.missing : value}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
            </Panel>
            {design.components.length > 0 && (
                <Panel title={words.componentsTitle} description={words.componentsDescription}>
                    <ul className='studio-design-system__samples'>
                        {design.components.filter(component => component.variants.length > 0).map(component => (
                            <li key={component.name}>
                                <ComponentSample
                                    parts={partsInState(component.variants[0], resolved.find(candidate => candidate.name === component.name)?.variants[0], 'default')}
                                    label={component.name} />
                            </li>
                        ))}
                    </ul>
                </Panel>
            )}
            <Panel title={words.structureTitle} description={words.structureDescription}>
                <ul className='studio-design-system__tags'>
                    {[...outline.layouts, ...outline.screenTemplates, ...outline.dialogTemplates].map(name => <li key={name}>{name}</li>)}
                </ul>
            </Panel>
            <Panel title={words.sourceTitle} description={words.sourceDescription}>
                <div className='studio-design-system__stack'>
                    <div><Button label={copied ? words.copied : words.copy} icon='pi pi-copy' onClick={() => void copy()} /></div>
                    <SourceView value={screenplay} label={words.sourceLabel} />
                </div>
            </Panel>
        </div>
    );
};
