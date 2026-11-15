// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import type { ChangeLayoutTypeEdit, NodeInspection } from '@cratis/scene.model';
import type { SceneOrderedItem } from '../Collections/orderedItems';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { ComponentProperties } from './ComponentProperties';
import { ScreenProperties } from './ScreenProperties';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import type { Ownership } from '../Structure/Ownership';
import { NavigationSection } from './NavigationSection';
import { useScreenOutlets } from '../DesignMode/Outlets/screenOutlets';
import { defaultDesignModeStrings } from '../DesignMode/DesignModeStrings';
import { regionOf } from '../DesignMode/useDesignMode';
import './PropertiesPanel.css';

export interface PropertiesPanelProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    ownership: Ownership | undefined;

    // The template being authored, if any - what lets the author decide what screens may configure.
    authoringTemplate?: string;
    // Added to the screen's own properties, shown while nothing is selected.
    screenProperties?: ReactNode;
}

// A navigation item is not an element of its own: with one selected, its properties are what the tab shows, not those of the region around it (spec p13-2, p18).
const isNavigationItemSelected = (controller: ScreenEditorController) =>
    controller.selectedItemId !== undefined && regionOf(String((controller.selection as { componentName?: string }).componentName ?? '')) !== undefined;

// The Properties tab, driven entirely by what Scene reports for the selection: the descriptors say which controls to
// draw, the inspection says which of them may be edited and why not, and every change goes back as a Scene edit - so a
// property the template does not expose is shown, with the reason, rather than quietly hidden.
export const PropertiesPanel = ({ controller, environment, strings, ownership, authoringTemplate, screenProperties }: PropertiesPanelProps) => {
    const { inspection, selectedId, selection } = controller;
    const screenOutlets = useScreenOutlets(controller, environment, (strings.designMode ?? defaultDesignModeStrings).outlets);

    // Nothing selected: the screen itself is the implicit subject, so its own settings (template, dialog
    // templates, forms) show here instead of being layered onto every component's own properties. Selecting a
    // component replaces this with that component's own view - these sections never show alongside it.
    if (!selectedId || !selection || !inspection) {
        return <ScreenProperties controller={controller} environment={environment} strings={strings} {...(authoringTemplate ? { authoringTemplate } : {})} {...(screenProperties ? { hostProperties: screenProperties } : {})} />;
    }

    if (isNavigationItemSelected(controller)) {
        return (
            <div className='studio-editor-properties'>
                <NavigationSection controller={controller} environment={environment} strings={strings} />
            </div>
        );
    }

    return <ComponentProperties controller={controller} environment={environment} strings={strings} ownership={ownership} {...(authoringTemplate ? { authoringTemplate } : {})} selectedId={selectedId} selection={selection} inspection={inspection} screenOutlets={screenOutlets} />;
};

export type { NodeInspection, ChangeLayoutTypeEdit, SceneOrderedItem };
