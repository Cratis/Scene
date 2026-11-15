// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { OutletContribution } from '@cratis/scene.model';
import { aggregateNavigationItemsWithSource } from './aggregateNavigationItemsWithSource';
import { groupNavigationItems } from './groupNavigationItems';
import './NavigationDesigner.css';

export interface NavigationDesignerProps {
    /** Every contribution in scope - the same input `NavBar` takes, aggregated identically. */
    contributions: OutletContribution[];

    /** Called with a nav item's source `Contribution` when its row is activated - see the README for what this hooks into next. */
    onItemSelected?: (source: OutletContribution) => void;
}

/**
 * The computed-nav tree view for StudioIssues#158: groups and lists the navigation items every screen
 * contributes to the `Navigation` outlet of navigation. Pair with `NavBar` itself (rendered through
 * `PreviewSurface`) for the live AppShell preview half of the issue; this component is the tree/list half.
 */
export function NavigationDesigner({ contributions, onItemSelected }: NavigationDesignerProps) {
    const groups = groupNavigationItems(aggregateNavigationItemsWithSource(contributions));

    return (
        <div className="studio-editor-navigation-designer">
            {groups.map(group => (
                <section key={group.name ?? ''} className="studio-editor-navigation-designer-group">
                    <header className="studio-editor-navigation-designer-group-name">{group.name ?? 'Ungrouped'}</header>
                    <ul className="studio-editor-navigation-designer-items">
                        {group.items.map(({ item, source }) => (
                            <li key={item.id} className="studio-editor-navigation-designer-item" onClick={() => onItemSelected?.(source)}>
                                <span className="studio-editor-navigation-designer-item-label">{item.label}</span>
                                <span className="studio-editor-navigation-designer-item-target">{item.target}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
