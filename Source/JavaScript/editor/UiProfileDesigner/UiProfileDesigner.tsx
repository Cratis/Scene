// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme, UiProfile } from '@cratis/scene.model';
import { PackageCatalog } from '@cratis/scene.engine';
import { findComponentCollisions } from './findComponentCollisions';
import { filterCompatibleThemes } from './filterCompatibleThemes';
import './UiProfileDesigner.css';

export interface UiProfileDesignerProps {
    profile: UiProfile;
    catalog: PackageCatalog;
    themes: Theme[];
    onThemeSelected?: (theme: Theme) => void;
}

/**
 * The `ui profile`/theme configuration surface for StudioIssues#160: the package list in override-priority
 * order, every component-name collision among the profile's active packages (which package currently wins,
 * flagged rather than only warned about at build time), and a theme picker pre-filtered to only the themes
 * compatible with every package the profile lists.
 */
export function UiProfileDesigner({ profile, catalog, themes, onThemeSelected }: UiProfileDesignerProps) {
    const collisions = findComponentCollisions(profile, catalog);
    const compatibleThemes = filterCompatibleThemes(profile, themes);

    return (
        <div className="studio-editor-ui-profile-designer">
            <section>
                <header>Packages (override priority, last wins)</header>
                <ol className="studio-editor-ui-profile-designer-packages">
                    {profile.packages.map(packageName => <li key={packageName}>{packageName}</li>)}
                </ol>
            </section>
            <section>
                <header>Component collisions</header>
                {collisions.length === 0 && <p>No colliding component names among active packages.</p>}
                <ul className="studio-editor-ui-profile-designer-collisions">
                    {collisions.map(collision => (
                        <li key={collision.name}>
                            <span className="studio-editor-ui-profile-designer-collision-name">{collision.name}</span>
                            <span> resolves from </span>
                            <strong>{collision.package}</strong>
                            <span>, shadowing {collision.shadows.join(', ')}</span>
                        </li>
                    ))}
                </ul>
            </section>
            <section>
                <header>Theme</header>
                <ul className="studio-editor-ui-profile-designer-themes">
                    {compatibleThemes.map(theme => (
                        <li key={theme.name} onClick={() => onThemeSelected?.(theme)}>
                            {theme.name}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
