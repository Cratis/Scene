// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export type QueryPerformer = (query: string, argumentsValue: unknown, signal: AbortSignal) => Promise<unknown>;

/**
 * Runs query bindings so a newer argument set aborts and ignores older work.
 */
export class AbortableQueryRunner {
    #controller?: AbortController;
    #generation = 0;

    async run(query: string, argumentsValue: unknown, performer: QueryPerformer): Promise<unknown | undefined> {
        this.#controller?.abort();
        const controller = new AbortController();
        const generation = ++this.#generation;
        this.#controller = controller;
        const result = await performer(query, argumentsValue, controller.signal);
        return generation === this.#generation && !controller.signal.aborted ? result : undefined;
    }

    clear(): void {
        this.#controller?.abort();
        this.#generation++;
        this.#controller = undefined;
    }
}
