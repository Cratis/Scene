// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { menuModeCards } from '@cratis/scene.blueprint.default';
import { menuThemes, navigationModes, normalizeNavigationMode } from '@cratis/scene.engine';
import { layoutModes, type LayoutMode } from '@cratis/scene.blueprint.default';
import type { DesignedProfile } from '../Session/DesignedProfile';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';
import { Field, Segmented } from './Field';

export interface MenuSectionProps {
    settings: DesignedProfile;
    strings: UiProfileDesignerStrings;
    onEdit: (next: DesignedProfile, label: string) => void;
}

/** The legacy spelling the shell is configured with for a typed mode: Scene says it. */
const legacyOf = (mode: string): LayoutMode | undefined => layoutModes.find(candidate => candidate === navigationModes.find(info => info.id === normalizeNavigationMode(mode))?.legacy);

/** The Menu section: the eight modes as cards with their schematics - names, descriptions and drawings are Scene's - and the menu theme. */
export const MenuSection = ({ settings, strings, onEdit }: MenuSectionProps) => {
    const text = strings.editor.menu;
    const current = normalizeNavigationMode(settings.navigationMode);
    return (
        <>
            <Field label={text.mode} hint={text.modeHint}>
                <div className='studio-inspector-cards studio-inspector-cards--modes' role='radiogroup' aria-label={text.mode}>
                    {menuModeCards.map(card => (
                        <button key={card.mode} type='button' role='radio' aria-checked={card.mode === current} data-selected={card.mode === current}
                            onClick={() => onEdit({ ...settings, navigationMode: legacyOf(card.mode) ?? settings.navigationMode }, strings.edits.menuMode)}>
                            <span className='studio-inspector-card__schematic' aria-hidden='true' dangerouslySetInnerHTML={{ __html: card.schematic }} />
                            <span className='studio-inspector-card__title'>{card.label}</span>
                            <span className='studio-inspector-card__meta'>{card.description}</span>
                        </button>
                    ))}
                </div>
            </Field>
            <Field label={text.theme} hint={text.themeHint}>
                <Segmented label={text.theme} value={settings.menuTheme ?? 'light'}
                    options={menuThemes.map(theme => ({ value: theme.id as string, label: theme.label }))}
                    onChange={next => onEdit({ ...settings, menuTheme: next === 'light' ? undefined : next }, strings.edits.menuTheme)} />
            </Field>
        </>
    );
};
