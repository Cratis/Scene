// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconEntry, IconReference, formatIconReference } from '@cratis/scene.model';
import { EffectiveIconEntry, referencesOfEntry } from './EffectiveIconEntry';
import { IconCatalogSource } from './IconCatalogSource';
import { IconDiagnostic } from './IconDiagnostic';
import { IconLibraryResolution } from './IconLibraryResolution';
import { IconQuery } from './IconQuery';
import { IconResolution } from './IconResolution';
import { IconSearchResult } from './IconSearchResult';
import { ResolvedIconLibrary } from './ResolvedIconLibrary';
import { matchesIconQuery } from './matchesIconQuery';

/**
 * The icons a profile can actually use: the active libraries from {@link resolveIconLibraries}, with their
 * catalogs loaded on demand.
 *
 * Opening it costs nothing - no catalog is read until a query or a lookup needs that library, and a
 * query narrowed to one library reads only that one. A catalog is loaded once and kept; a load that
 * fails is not kept, so the next call tries again. Everything that goes wrong is reported as an
 * {@link IconDiagnostic}; nothing is ever answered with a different icon than the one asked for.
 */
export class EffectiveIconCatalog {
    readonly #sources: Map<string, IconCatalogSource>;
    readonly #loads = new Map<string, Promise<IconEntry[]>>();
    readonly #loaded = new Set<string>();

    /**
     * @param resolution The active libraries and the problems found with them.
     * @param sources The catalog source of each library; a library with none is active but reports
     * 'catalog-unavailable' when its icons are needed.
     */
    constructor(readonly resolution: IconLibraryResolution, sources: IconCatalogSource[]) {
        this.#sources = new Map(sources.map((source) => [source.library, source]));
    }

    /**
     * The active libraries, with provenance.
     */
    get libraries(): ResolvedIconLibrary[] {
        return this.resolution.libraries;
    }

    /**
     * Problems with the libraries themselves, known without loading any catalog.
     */
    get diagnostics(): IconDiagnostic[] {
        return this.resolution.diagnostics;
    }

    /**
     * Whether a library's catalog has been read yet.
     */
    isLoaded(library: string): boolean {
        return this.#loaded.has(library);
    }

    /**
     * The entries of one library, loading its catalog if this is the first time it is needed.
     * Resolves to `undefined` when the library is not active.
     *
     * @throws Whatever the library's source throws, or an Error when an active library has no source.
     */
    async entriesOf(library: string): Promise<IconEntry[] | undefined> {
        if (!this.libraries.some((resolved) => resolved.library === library)) return undefined;

        let load = this.#loads.get(library);
        if (!load) {
            const source = this.#sources.get(library);
            if (!source) throw new Error(`The icon library '${library}' is active but has no catalog source`);

            load = source.loadEntries();
            this.#loads.set(library, load);
            load.then(
                () => this.#loaded.add(library),
                () => this.#loads.delete(library)
            );
        }

        return load;
    }

    /**
     * Searches the catalogs of the libraries the query covers - all of them, or the one it names.
     */
    async search(query: IconQuery = {}): Promise<IconSearchResult> {
        const covered = this.libraries.filter((resolved) => query.library === undefined || resolved.library === query.library);
        const outcomes = await Promise.all(covered.map(async (resolved) => this.#entriesOrDiagnostic(resolved)));

        const entries: EffectiveIconEntry[] = [];
        const diagnostics: IconDiagnostic[] = [];
        outcomes.forEach((outcome, position) => {
            const library = covered[position];
            if ('diagnostic' in outcome) {
                diagnostics.push(outcome.diagnostic);
                return;
            }

            for (const entry of outcome.entries.filter((candidate) => matchesIconQuery(candidate, query))) {
                entries.push({ library, entry, references: referencesOfEntry(library.library, entry) });
            }
        });

        return { entries, diagnostics };
    }

    /**
     * Every active library's icons whose name or key is exactly `name` (ignoring case) - the several
     * candidates a bare legacy icon name could have meant. More than one is a real answer, not a tie to
     * break: it is the author's decision which library the icon comes from.
     */
    async findByName(name: string): Promise<EffectiveIconEntry[]> {
        const wanted = name.trim().toLowerCase();
        const { entries } = await this.search({});
        return entries.filter(({ entry }) => entry.key.toLowerCase() === wanted || entry.name.toLowerCase() === wanted);
    }

    /**
     * The categories in use, sorted, across all libraries or one.
     */
    async categories(library?: string): Promise<string[]> {
        const { entries } = await this.search({ library });
        return [...new Set(entries.flatMap(({ entry }) => entry.categories))].sort();
    }

    /**
     * Looks a reference up: the icon it names, or exactly why there is none.
     */
    async resolve(reference: IconReference): Promise<IconResolution> {
        const library = this.libraries.find((resolved) => resolved.library === reference.library);
        if (!library) {
            return this.#unresolved(reference, 'missing-library', `The icon library '${reference.library}' is not active in this profile`);
        }

        const incompatible = this.diagnostics.find((diagnostic) => diagnostic.kind === 'incompatible-version' && diagnostic.library === library.library);
        if (incompatible) return { isResolved: false, reference, diagnostic: { ...incompatible, reference } };

        const outcome = await this.#entriesOrDiagnostic(library);
        if ('diagnostic' in outcome) return { isResolved: false, reference, diagnostic: { ...outcome.diagnostic, reference } };

        const entry = outcome.entries.find((candidate) => candidate.key === reference.key);
        if (!entry) {
            return this.#unresolved(reference, 'missing-icon', `The icon library '${library.library}' has no icon '${reference.key}'`);
        }

        if (reference.variant !== undefined && !(entry.variants ?? []).includes(reference.variant)) {
            return this.#unresolved(reference, 'missing-variant', `The icon '${formatIconReference({ library: library.library, key: entry.key })}' has no '${reference.variant}' variant`);
        }

        return { isResolved: true, reference, library, entry };
    }

    async #entriesOrDiagnostic(library: ResolvedIconLibrary): Promise<{ entries: IconEntry[] } | { diagnostic: IconDiagnostic }> {
        try {
            return { entries: (await this.entriesOf(library.library)) ?? [] };
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            return { diagnostic: { kind: 'catalog-unavailable', library: library.library, message: `The catalog of '${library.library}' could not be loaded: ${reason}` } };
        }
    }

    #unresolved(reference: IconReference, kind: IconDiagnostic['kind'], message: string): IconResolution {
        return { isResolved: false, reference, diagnostic: { kind, library: reference.library, message, reference } };
    }
}
