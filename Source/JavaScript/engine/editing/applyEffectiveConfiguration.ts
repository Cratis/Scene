// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ContentControl, EffectiveConfiguration, ExternalComponent, ItemsControl, Panel, SceneElement } from '@cratis/scene.model';
import { isContentControl, isExternalComponent, isItemsControl, isPanel } from '../elementKind';

/**
 * Returns the element tree a renderer should draw once effective configuration is applied: each configurable
 * component carries its resolved properties.
 *
 * Pure, and structure-sharing - an element with nothing to change comes back as the same object, so a renderer
 * that memoizes on identity does not redraw what did not change. There is no design-time flag here or anywhere
 * downstream: a screen being edited and a screen being played go through this same function.
 *
 * @param element The element tree from the template or screen.
 * @param configuration What {@link resolveEffectiveConfiguration} produced for the chain the tree sits in.
 */
export function applyEffectiveConfiguration(element: SceneElement, configuration: EffectiveConfiguration): SceneElement {
    if (isExternalComponent(element)) {
        const resolved = configuration.components.find(candidate => candidate.component === element.id);
        let changed = resolved !== undefined;

        const slots: typeof element.slots = {};
        for (const [name, children] of Object.entries(element.slots)) {
            const mapped = children.map(child => applyEffectiveConfiguration(child, configuration));
            if (mapped.some((child, index) => child !== children[index])) changed = true;
            slots[name] = mapped;
        }

        const updated: ExternalComponent = { ...element, properties: resolved?.properties ?? element.properties, slots };
        return changed ? updated : element;
    }

    if (isContentControl(element)) {
        const content = applyEffectiveConfiguration(element.content, configuration);
        const updated: ContentControl = { ...element, content };
        return content === element.content ? element : updated;
    }

    if (isItemsControl(element)) {
        const itemTemplate = applyEffectiveConfiguration(element.itemTemplate, configuration);
        const updated: ItemsControl = { ...element, itemTemplate };
        return itemTemplate === element.itemTemplate ? element : updated;
    }

    if (isPanel(element)) {
        const children = element.children.map(child => applyEffectiveConfiguration(child, configuration));
        const updated: Panel = { ...element, children };
        return children.some((child, index) => child !== element.children[index]) ? updated : element;
    }

    return element;
}
