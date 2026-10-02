// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExposedProperty, ExternalComponent, SceneDiagnostic, SceneNodeKind } from '@cratis/scene.model';

/**
 * One owner in a template chain: a layout, a template or the screen at the end.
 */
export interface TemplateChainLevel {
    /** The name of the layout, template, dialog template or screen. */
    owner: string;

    kind: SceneNodeKind;

    /** The instance this level contributes as: `layout:<name>`, `template:<name>`, `dialog:<name>` or `screen:<name>`. */
    instance: string;

    /** The components the owner contains, each once, by element id. */
    elements: ExternalComponent[];

    /** What the owner exposes - and, for a nested template, re-exposes - to what sits inside it. */
    exposures: ExposedProperty[];
}

/**
 * The nesting a configuration resolves over: the application layout first, then each template down to the one the
 * screen fills, then the screen. A level can only configure what the levels above it exposed, and only reaches
 * past its immediate parent when everything in between re-exposed it.
 */
export interface TemplateChain {
    /** Outermost first. */
    levels: TemplateChainLevel[];

    /** Problems found assembling the chain, such as a template that could not be placed. */
    diagnostics: SceneDiagnostic[];
}
