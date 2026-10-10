// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { defaultBlueprint } from '../defaultBlueprint';
import { GalleryScreenPreview, TemplatePreviewState } from '../gallery';

/**
 * The registry a host with this blueprint's real dependencies loaded renders against: `core`, PrimeReact and
 * the blueprint itself. Tables, tags, timelines and form fields resolve to PrimeReact's implementations,
 * so a preview shows the package's own data states rather than placeholders.
 */
export const packageBackedRegistry = mergePackageRegistries([corePackage, primeReactPackage, defaultBlueprint]);

/** jsdom has neither observer; PrimeReact's scroll areas and the shell's media queries need them. */
export function provideBrowserApis() {
    const observer = class {
        observe(): void { return undefined; }
        unobserve(): void { return undefined; }
        disconnect(): void { return undefined; }
    };
    window.ResizeObserver ??= observer as unknown as typeof ResizeObserver;
    window.IntersectionObserver ??= observer as unknown as typeof IntersectionObserver;
    window.matchMedia ??= ((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: () => undefined, removeListener: () => undefined,
        addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
}

export function renderPreview(screenName: string, state: TemplatePreviewState) {
    return render(<PrimeReactProvider>
        <GalleryScreenPreview screenName={screenName} state={state} registry={packageBackedRegistry} />
    </PrimeReactProvider>);
}
