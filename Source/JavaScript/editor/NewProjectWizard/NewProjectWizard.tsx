// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme, UiStarter } from '@cratis/scene.model';
import { buildStarterProfile } from '@cratis/scene.engine';
import { selectableStarterThemes } from './selectableStarterThemes';
import './NewProjectWizard.css';

export interface NewProjectWizardProps {
    starters: UiStarter[];
    selectedStarter: UiStarter;
    themes: Record<string, Theme>;
    targetPlatform: string;
    selectedTheme?: Theme;
    onStarterSelected?: (starter: UiStarter) => void;
    onThemeSelected?: (theme: Theme) => void;

    /** Called with a gallery screen's name when its row is activated - live navigation through the real preview surface isn't wired up in this pass. */
    onGalleryScreenSelected?: (screenName: string) => void;
}

/**
 * The starter-selection + gallery-preview steps of StudioIssues#162's new-project wizard. The sandboxed
 * profile shown for the selected starter is built with `buildStarterProfile` (Cratis/Scene#6) unmodified -
 * the same profile the gallery would actually boot through, not an approximation of it. The theme switcher
 * only offers themes `selectableStarterThemes` reports compatible.
 */
export function NewProjectWizard({
    starters,
    selectedStarter,
    themes,
    targetPlatform,
    selectedTheme,
    onStarterSelected,
    onThemeSelected,
    onGalleryScreenSelected,
}: NewProjectWizardProps) {
    const profile = buildStarterProfile(selectedStarter, targetPlatform);
    const selectableThemes = selectableStarterThemes(selectedStarter, themes);

    return (
        <div className="studio-editor-new-project-wizard">
            <section>
                <header>Starter</header>
                <ul className="studio-editor-new-project-wizard-starters">
                    {starters.map(starter => (
                        <li
                            key={starter.name}
                            className={starter.name === selectedStarter.name ? 'studio-editor-new-project-wizard-selected' : undefined}
                            onClick={() => onStarterSelected?.(starter)}
                        >
                            {starter.name}
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                <header>Sandbox profile ({profile.name}, {profile.targetPlatform})</header>
                <p>{profile.packages.join(', ')}</p>
            </section>
            <section>
                <header>Theme</header>
                <ul className="studio-editor-new-project-wizard-themes">
                    {selectableThemes.map(theme => (
                        <li
                            key={theme.name}
                            className={theme.name === selectedTheme?.name ? 'studio-editor-new-project-wizard-selected' : undefined}
                            onClick={() => onThemeSelected?.(theme)}
                        >
                            {theme.name}
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                <header>Gallery</header>
                <ul className="studio-editor-new-project-wizard-gallery">
                    {selectedStarter.gallery.map(screenName => (
                        <li key={screenName} onClick={() => onGalleryScreenSelected?.(screenName)}>
                            {screenName}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
