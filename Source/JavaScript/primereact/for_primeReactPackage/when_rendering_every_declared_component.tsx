// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { primeReactPackageManifest } from '../primeReactPackage';
import { sceneComponent } from '../storyElements';

/**
 * The end-to-end check the registry spec cannot make.
 *
 * `validatePackageBundle` proves the manifest and the registry agree on *names*. This proves the names
 * actually reach a component: each declared name is put through the real `SceneElementView`, the real
 * renderer and the real registry, and must not come out as the `UnresolvedComponent` placeholder. A
 * misspelled registry key passes every name-level check and only fails here.
 *
 * Each element is rendered with almost nothing configured, which is the second thing this specifies: a
 * component whose data has not been authored yet is an ordinary state on a screen under construction, and
 * it must render empty rather than take the whole screen down with it. This is how PrimeReact's
 * OrganizationChart was found to throw on an empty node list.
 *
 * The `PrimeReactProvider` is not decoration and is new with PrimeReact 11. Every v11 component and
 * headless hook bottoms out in `useBase` -> `usePrimeReact()`, which *throws* when the context is absent
 * rather than falling back to a default configuration - so on v11 this spec fails at `render` for every
 * adapter that touches a PrimeReact component, with an error about the provider rather than about the
 * component. The provider is deliberately given no preset: what is being specified here is that the names
 * resolve and the components survive being unconfigured, not how they look.
 */
describe('when rendering every declared component', () => {
    let unresolved: string[];
    let threw: string[];

    beforeEach(() => {
        // jsdom implements neither `ResizeObserver` nor `IntersectionObserver`. PrimeReact 11's ScrollArea
        // and Carousel observe their own box to size a scrollbar thumb and a page, and the Carousel watches
        // its slides to know which page is on screen. As with `matchMedia` below, these fill an environment
        // gap rather than papering over a defect - every real browser has had both for years, and a
        // component is entitled to assume them.
        //
        // Both stubs observe nothing, which is the right answer here rather than a shortcut: jsdom has no
        // layout to report, and this spec renders each component once and never resizes or scrolls it.
        // Casting through `unknown` avoids spelling out `root`, `rootMargin`, `thresholds` and
        // `takeRecords` to satisfy the real DOM interface, none of which the components read.
        const observerStub = class {
            observe(): void {
                return undefined;
            }
            unobserve(): void {
                return undefined;
            }
            disconnect(): void {
                return undefined;
            }
        };

        if (window.ResizeObserver === undefined) {
            window.ResizeObserver = observerStub as unknown as typeof ResizeObserver;
            globalThis.ResizeObserver = window.ResizeObserver;
        }

        if (window.IntersectionObserver === undefined) {
            window.IntersectionObserver = observerStub as unknown as typeof IntersectionObserver;
            globalThis.IntersectionObserver = window.IntersectionObserver;
        }

        // jsdom implements no `matchMedia`, and PrimeReact's PickList calls it to pick a responsive
        // layout. This fills the environment gap rather than papering over a defect - a real browser
        // has always had it.
        if (window.matchMedia === undefined) {
            window.matchMedia = (query: string) =>
                ({
                    matches: false,
                    media: query,
                    onchange: undefined,
                    addListener: () => undefined,
                    removeListener: () => undefined,
                    addEventListener: () => undefined,
                    removeEventListener: () => undefined,
                    dispatchEvent: () => false,
                }) as unknown as MediaQueryList;
        }

        unresolved = [];
        threw = [];

        for (const name of primeReactPackageManifest.components) {
            const element = sceneComponent(`element-${name}`, name, { text: name, label: name, value: name });
            try {
                const { container, unmount } = render(
                    <PrimeReactProvider>
                        <SceneElementView element={element} registry={primeReactComponents} resolveBinding={() => undefined} />
                    </PrimeReactProvider>
                );
                if (container.querySelector('[data-scene-unresolved-component]') !== null) unresolved.push(name);
                unmount();
            } catch (error) {
                threw.push(`${name}: ${(error as Error).message.split('\n')[0]}`);
            }
        }
    });

    it('should resolve every declared name to a real component', () => {
        unresolved.should.deep.equal([]);
    });

    it('should render every declared component with nothing configured, rather than throwing', () => {
        threw.should.deep.equal([]);
    });
});
