// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Screen, ScreenTemplate } from '@cratis/scene.model';
import { LayoutName, appShellLayout, nestScreenTemplates, templateContentInLayout } from '@cratis/scene.blueprint.default';
import { componentsScreenTemplates, nestingChainTemplates } from '../templates';
import { componentsApplicationChrome } from './applicationChrome';
import { componentsNavigationContributions } from './navigation';

/**
 * The gallery: one {@link Screen} per template, ready to boot through the real engine.
 *
 * These exist so a preview is a working miniature application rather than a set of pictures - the same
 * `Screen` shape Stage produces, put through the same `Scene.Engine` and `Scene.React`, with no separate
 * preview pipeline and nothing mocked.
 *
 * They will render with unregistered bindings, and that is the normal design-time state rather than a
 * shortcoming of the gallery. A host owns the generated Arc proxies; a gallery is not a host. What a
 * preview therefore shows is every Arc-bound region as a placeholder naming the binding it wanted, every
 * Arc-free region rendered for real, and a header on each page saying which of the two you are looking at.
 *
 * Every screen renders in the default blueprint's `AppShell`. There is no full-page variant here because
 * there is no Arc-bound page that belongs outside the application shell - a sign-in screen queries nothing
 * and submits no command, so it stays where it already is, in the default blueprint.
 */

/**
 * Builds the {@link Screen} that instantiates one template.
 *
 * A screen is an instance, not a shape: it names the layout it renders in, the template it fills, the
 * content that fills it, and what it contributes elsewhere. Everything structural comes from the template,
 * which is why adding a screen is a handful of lines rather than another copy of the chrome.
 */
function screenFor(template: ScreenTemplate): Screen {
    const placeable = nestScreenTemplates(containmentChainFor(template));

    return {
        name: template.name,
        layout: LayoutName.AppShell,
        screenTemplate: template.name,
        slotContent: mergeSlotContent(componentsApplicationChrome(template.name), templateContentInLayout(placeable, appShellLayout)),
        forms: [],
        contributions: componentsNavigationContributions,
    };
}

/**
 * The chain of templates a screen renders through, outermost first.
 *
 * The eight page templates fit the layout's own `content` slot, so each one's chain is just itself. The
 * three nesting-chain templates are the exception and the only ones that need the walk - which is the
 * honest version of the story: nesting exists for the applications that need it, and costs nothing for the
 * ones that do not.
 */
function containmentChainFor(template: ScreenTemplate): ScreenTemplate[] {
    const depth = nestingChainTemplates.findIndex(candidate => candidate.name === template.name);
    return depth < 0 ? [template] : nestingChainTemplates.slice(0, depth + 1);
}

function mergeSlotContent(chrome: Record<string, Screen['slotContent'][string]>, content: Record<string, Screen['slotContent'][string]>): Screen['slotContent'] {
    const merged: Screen['slotContent'] = { ...chrome };
    for (const [slotName, elements] of Object.entries(content)) {
        merged[slotName] = [...(merged[slotName] ?? []), ...elements];
    }

    return merged;
}

/** One screen per screen template this blueprint provides. */
export const componentsGalleryScreens: Screen[] = componentsScreenTemplates.map(screenFor);

/** One gallery screen by name, for a story or a host that boots a specific one. */
export function componentsGalleryScreen(name: string): Screen | undefined {
    return componentsGalleryScreens.find(screen => screen.name === name);
}
