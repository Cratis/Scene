// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme as ProfileColorScheme, CornerStyle } from '@cratis/scene.model';
import { contrastAgainstWhite, fontCatalog, fontSampleLine, minimumAccentContrast, switchColorScheme } from '@cratis/scene.engine';
import { ColorScheme } from '@cratis/scene.blueprint.default';
import { chooseTheme } from '@cratis/scene.engine';
import { formatMessage } from '../../UiProfile/formatMessage';
import { normalizeAccent } from '../Properties/normalizeAccent';
import type { DesignedProfile } from '../Session/DesignedProfile';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { Field, Segmented } from './Field';
import type { SceneAnswers } from './sceneAnswers';
import { sceneProfileOf, withPackageEdit } from './sceneProfileOf';
import type { ScenePackageBundle } from '@cratis/scene.react';

export interface LookSectionProps {
    settings: DesignedProfile;
    bundles: ScenePackageBundle[];
    answers: SceneAnswers;
    strings: UiProfileDesignerStrings;
    onEdit: (next: DesignedProfile, label: string) => void;

    /** Called with a line for the status bar when an edit moved something else with it (the theme following the scheme). */
    onNote?: (message: string) => void;
}

/** The Look section: the color scheme, the themes as cards, the accent with its contrast, the font and the corners. Every answer is Scene's. */
export const LookSection = ({ settings, bundles, answers, strings, onEdit, onNote }: LookSectionProps) => {
    const text = strings.editor.look;
    const scheme = settings.colorScheme === ColorScheme.Dark ? ProfileColorScheme.Dark : ProfileColorScheme.Light;
    const themeAccent = answers.themes.find(theme => theme.name === settings.theme)?.tokens?.['primary.color'] ?? '';
    const contrast = settings.accent.length > 0 ? contrastAgainstWhite(settings.accent) : undefined;
    const showing = settings.accent.length > 0 ? settings.accent : themeAccent;

    const changeScheme = (next: ProfileColorScheme.Light | ProfileColorScheme.Dark) => {
        const edit = switchColorScheme(sceneProfileOf(settings, bundles), next, answers.themes);
        onEdit({ ...settings, colorScheme: next === ProfileColorScheme.Dark ? ColorScheme.Dark : ColorScheme.Light, theme: edit.profile.theme ?? settings.theme }, strings.edits.colorScheme);
        if (edit.message !== '') onNote?.(edit.message);
    };

    const pickTheme = (name: string) => {
        const edit = chooseTheme(answers.profile, answers.manifests, name);
        const isDark = answers.themes.find(theme => theme.name === name)?.isDark === true;
        onEdit(withPackageEdit({ ...settings, theme: name, colorScheme: isDark ? ColorScheme.Dark : ColorScheme.Light }, edit), strings.edits.theme);
    };

    return (
        <>
            <Field label={text.scheme} hint={text.schemeHint}>
                <Segmented label={text.scheme} value={scheme === ProfileColorScheme.Dark ? ProfileColorScheme.Dark : ProfileColorScheme.Light}
                    options={[{ value: ProfileColorScheme.Light, label: text.light }, { value: ProfileColorScheme.Dark, label: text.dark }]} onChange={changeScheme} />
            </Field>
            <Field label={text.themes}>
                <div className='studio-inspector-cards' role='radiogroup' aria-label={text.themes}>
                    {answers.themeCards.map(card => (
                        <button key={card.name} type='button' role='radio' aria-checked={card.selected} data-selected={card.selected} data-available={card.available} onClick={() => pickTheme(card.name)}>
                            <span className='studio-inspector-theme__bar' style={{ background: card.accent }} aria-hidden='true' />
                            <span className='studio-inspector-card__title'>{card.name}</span>
                            {card.corners !== undefined && <span className='studio-inspector-card__meta'>{formatMessage(text.themeCorners, { corners: card.corners })}</span>}
                            {card.reason !== undefined && <span className='studio-inspector-card__note'>{card.reason}</span>}
                        </button>
                    ))}
                </div>
            </Field>
            <Field label={text.accent} htmlFor='studio-look-accent-hex' hint={text.accentHint}>
                <div className='studio-inspector-accent'>
                    <input type='color' aria-label={text.accentColor} value={/^#[0-9a-f]{6}$/i.test(showing) ? showing : '#4f46e5'}
                        onChange={event => onEdit({ ...settings, accent: normalizeAccent(event.target.value) }, strings.edits.accent)} />
                    <input id='studio-look-accent-hex' type='text' spellCheck={false} value={settings.accent} placeholder={formatMessage(text.accentPlaceholder, { accent: themeAccent })}
                        onChange={event => onEdit({ ...settings, accent: event.target.value.trim() === '' ? '' : normalizeAccent(event.target.value) || settings.accent }, strings.edits.accent)} />
                    {settings.accent.length > 0 && <button type='button' onClick={() => onEdit({ ...settings, accent: '' }, strings.edits.accent)}>{text.accentReset}</button>}
                </div>
                {contrast?.valid && (
                    <p className='studio-inspector-contrast' data-grade={contrast.grade} data-below={contrast.ratio! < minimumAccentContrast} role='status'>
                        {formatMessage(text.contrast, { ratio: contrast.ratio!.toFixed(1), grade: text.contrastGrade[contrast.grade!] })}
                    </p>
                )}
            </Field>
            <Field label={text.font} htmlFor='studio-look-font' hint={text.fontHint}>
                <select id='studio-look-font' value={settings.font ?? ''} onChange={event => onEdit({ ...settings, font: event.target.value === '' ? undefined : event.target.value }, strings.edits.font)}>
                    <option value=''>{text.cornerDefault}</option>
                    {fontCatalog.map(font => <option key={font.id} value={font.id}>{font.displayName}</option>)}
                </select>
                <p className='studio-inspector-font-sample' style={{ fontFamily: fontCatalog.find(font => font.id === settings.font)?.family }}>{fontSampleLine}</p>
            </Field>
            <Field label={text.corners}>
                <Segmented label={text.corners} value={settings.corners ?? CornerStyle.Default}
                    options={[{ value: CornerStyle.Sharp, label: text.cornerSharp }, { value: CornerStyle.Default, label: text.cornerDefault }, { value: CornerStyle.Round, label: text.cornerRound }]}
                    onChange={next => onEdit({ ...settings, corners: next === CornerStyle.Default ? undefined : next }, strings.edits.corners)} />
            </Field>
        </>
    );
};
