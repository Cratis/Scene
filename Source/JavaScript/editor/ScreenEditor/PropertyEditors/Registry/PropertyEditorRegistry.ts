// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import type { PropertyEditor } from './PropertyEditorProps';

// Loads an editor when it is first needed, so the sidebar carries only the editors the selection uses (PE5).
// An editor is any component of \`PropertyEditorProps\`; what its value is typed as is its own business, so the loader accepts them all.
export type PropertyEditorLoader = () => Promise<(props: never) => ReactNode>;

// How an editor was found: by the property's own `editorKind`, by what a package contributes, or as the default for its value type.
export type EditorResolutionTier = 'kind' | 'package' | 'default';

export interface EditorResolution {
    // The id the editor is registered under.
    id: string;
    tier: EditorResolutionTier;
}

export interface ResolveOptions {
    // Whether a package's design-time bundle contributes an editor for this property; a contribution is a second resolver tier,
    // ahead of the defaults and behind an `editorKind` the registry itself knows.
    packageEditor?: boolean;
}

// The editor a property of this value type gets when it names none. `enum` splits on how many choices there are: up to four read best
// as chips, more as a dropdown with a filter (spec 8.1).
export const maximumChipChoices = 4;

export function defaultEditorId(descriptor: PropertyDescriptor): string | undefined {
    switch (descriptor.valueType) {
        case PropertyValueType.String: return 'text';
        case PropertyValueType.Number: return 'number';
        case PropertyValueType.Boolean: return 'boolean';
        case PropertyValueType.Enum: return (descriptor.choices ?? []).length <= maximumChipChoices ? 'enum' : 'select';
        case PropertyValueType.Icon: return 'icon';
        case PropertyValueType.Destination: return 'navigationTarget';
        case PropertyValueType.QueryReference: return 'queryBinding';
        case PropertyValueType.Collection: return 'collection';
        case PropertyValueType.Object: return descriptor.properties !== undefined ? 'object' : 'undescribed';
        // A value that is any JSON has no editor of its own: it is edited through the `editorKind` that says what it holds, and one that says nothing is
        // reported - a box of JSON text would only hide that the descriptor does not say how to edit it.
        case PropertyValueType.Json: return 'undescribed';
        default: return 'undescribed';
    }
}

// The ids editors are registered under and how to load them. Open: a blueprint or a plugin registers an editor of its own, or replaces a
// built-in one, and everything that resolves afterwards sees it (PE5).
export class PropertyEditorRegistry {
    readonly #loaders = new Map<string, PropertyEditorLoader>();
    readonly #loaded = new Map<string, PropertyEditor<unknown>>();
    readonly #loading = new Map<string, Promise<PropertyEditor<unknown>>>();

    register(id: string, loader: PropertyEditorLoader): this {
        this.#loaders.set(id, loader);
        this.#loaded.delete(id);
        this.#loading.delete(id);
        return this;
    }

    // The editor once it has been loaded, or nothing yet. Drawing never suspends: whoever draws an editor that is not here asks `load` and draws
    // again when it arrives, so an editor already on screen is never hidden and shown again while another loads.
    loadedOf(id: string): PropertyEditor<unknown> | undefined {
        return this.#loaded.get(id);
    }

    // Loads an editor, once however many ask. A loader that fails is forgotten, so the next ask tries again.
    load(id: string): Promise<PropertyEditor<unknown>> {
        const loaded = this.#loaded.get(id);
        if (loaded) return Promise.resolve(loaded);
        const pending = this.#loading.get(id);
        if (pending) return pending;
        const loader = this.#loaders.get(id);
        if (!loader) return Promise.reject(new Error(`No property editor is registered as '${id}'.`));

        const started = loader().then(editor => {
            const component = editor as unknown as PropertyEditor<unknown>;
            if (this.#loading.get(id) === started) { this.#loaded.set(id, component); this.#loading.delete(id); }
            return component;
        }, (error: unknown) => {
            if (this.#loading.get(id) === started) this.#loading.delete(id);
            throw error;
        });
        this.#loading.set(id, started);
        return started;
    }

    has(id: string): boolean {
        return this.#loaders.has(id);
    }

    get ids(): readonly string[] {
        return [...this.#loaders.keys()];
    }

    loaderOf(id: string): PropertyEditorLoader | undefined {
        return this.#loaders.get(id);
    }

    // The editor for a property, in this order: the editor its `editorKind` names, when the registry knows it; one a package
    // contributes; the default for its value type. Nothing when none applies - the host reports that rather than drawing a box of text.
    // A `json` property has no default: it is edited through the `editorKind` that says what it holds, or reported.
    resolve(descriptor: PropertyDescriptor, options: ResolveOptions = {}): EditorResolution | undefined {
        if (descriptor.editorKind !== undefined && this.#loaders.has(descriptor.editorKind)) return { id: descriptor.editorKind, tier: 'kind' };
        if (options.packageEditor === true && descriptor.editorKind !== undefined) return { id: descriptor.editorKind, tier: 'package' };

        const fallback = defaultEditorId(descriptor);
        return fallback !== undefined && this.#loaders.has(fallback) ? { id: fallback, tier: 'default' } : undefined;
    }
}
