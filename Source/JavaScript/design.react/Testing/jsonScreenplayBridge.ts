// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Layout, SceneDocument, Screen, ScreenTemplate } from '@cratis/scene.model';
import type { DesignMode } from '@cratis/scene.design';
import type { ScreenplayBridge, ScreenText } from '../Host/DesignCanvasHost';

/** What a screen is stored as by the JSON stand-in: the screen, and the template it is built on so the document can be put together again. */
interface StoredScreen {
    screen: Screen;
    template?: ScreenTemplate;
}

const empty = (layouts: Layout[]): SceneDocument => ({ layouts, screenTemplates: [], dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] });

/**
 * A stand-in for the Screenplay bridge, for stories, specifications and the first run of a host that has no compiler to hand: the "text" is the
 * screen as JSON. A real host stores Screenplay text and reaches `Cratis.Scene.Screenplay`; the canvas cannot tell the difference, because it only
 * hands the text back to the bridge it came from.
 */
export function jsonScreenplayBridge(layouts: Layout[], templates: readonly ScreenTemplate[] = []): ScreenplayBridge {
    return {
        async toDocument(texts: readonly ScreenText[], mode: DesignMode): Promise<SceneDocument> {
            const document = empty(structuredClone(layouts));
            for (const { text } of texts) {
                if (mode === 'templates') {
                    document.screenTemplates.push(JSON.parse(text) as ScreenTemplate);
                    continue;
                }
                const stored = JSON.parse(text) as StoredScreen;
                document.screens.push(stored.screen);
                if (stored.template !== undefined && !document.screenTemplates.some(candidate => candidate.name === stored.template!.name)) document.screenTemplates.push(stored.template);
            }
            return document;
        },

        async toText(document: SceneDocument, screen: string, mode: DesignMode): Promise<string> {
            if (mode === 'templates') {
                const template = document.screenTemplates.find(candidate => candidate.name === screen);
                if (template === undefined) throw new Error(`The document has no template ${screen}.`);
                return JSON.stringify(template);
            }
            const found = document.screens.find(candidate => candidate.name === screen);
            if (found === undefined) throw new Error(`The document has no screen ${screen}.`);
            const template = found.screenTemplate === undefined ? undefined : document.screenTemplates.find(candidate => candidate.name === found.screenTemplate)
                ?? templates.find(candidate => candidate.name === found.screenTemplate);
            return JSON.stringify({ screen: found, ...(template === undefined ? {} : { template }) } satisfies StoredScreen);
        },
    };
}
