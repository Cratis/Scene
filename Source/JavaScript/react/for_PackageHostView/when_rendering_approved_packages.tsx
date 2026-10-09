// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ExternalComponent, PackageKind, SceneElement } from '@cratis/scene.model';
import { ScenePackageBundle } from '../packages/ScenePackageBundle';
import { PackageHostView } from '../packages/PackageHostView';
import { WebViewPackageHost } from '../packages/WebViewPackageHost';

const element = { id: 'custom', componentName: 'Example:button', properties: { label: 'Press' }, slots: {} } as unknown as ExternalComponent;

function CustomButton({ element: renderedElement }: { element: ExternalComponent }) {
    const [clicked, setClicked] = useState(false);
    return <button type='button' onClick={() => setClicked(true)}>{clicked ? 'Clicked' : String(renderedElement.properties.label)}</button>;
}

function customBundle(options: Partial<ScenePackageBundle['manifest']> = {}, designTime = false): ScenePackageBundle {
    return {
        manifest: {
            name: 'Example',
            version: '1.0.0',
            kind: PackageKind.ComponentLibrary,
            dependencies: [],
            components: ['button'],
            layouts: [],
            screenTemplates: [],
            dialogTemplates: [],
            themes: [],
            assets: ['styles/example.css', 'fonts/example.woff2'],
            ...options,
        },
        components: {
            'Example:button': CustomButton,
        },
        ...(designTime ? { designTime: { actions: {} } } : {}),
    } as unknown as ScenePackageBundle;
}

describe('when rendering approved packages', () => {
    it('should render custom components and package assets in the host surface', () => {
        render(<PackageHostView configuration={{
            profile: { name: 'web', targetPlatform: 'web', packages: ['Example'] },
            policy: { allowExecutableImports: false, allowNetworkAssets: false },
            bundles: [customBundle()],
        }} element={element as unknown as SceneElement} />);

        fireEvent.click(screen.getByText('Press'));
        Boolean(screen.getByText('Clicked')).should.equal(true);
        document.querySelectorAll('[data-scene-package-asset="styles/example.css"]').length.should.equal(1);
        document.querySelectorAll('[data-scene-package-font="fonts/example.woff2"]').length.should.equal(1);
    });

    it('should render runtime contributions without loading optional design-time bundles', () => {
        render(<WebViewPackageHost configuration={{
            profile: { name: 'webview', targetPlatform: 'web', packages: ['Example'] },
            policy: { allowExecutableImports: false, allowNetworkAssets: false },
            bundles: [customBundle({}, true)],
        }} element={element as unknown as SceneElement} />);

        fireEvent.click(screen.getByText('Press'));
        Boolean(screen.getByText('Clicked')).should.equal(true);
    });

    it('should block forbidden design-time bundles when a host asks to load them', () => {
        render(<WebViewPackageHost configuration={{
            profile: { name: 'webview', targetPlatform: 'web', packages: ['Example'] },
            policy: { allowExecutableImports: false, allowNetworkAssets: false, loadDesignTime: true },
            bundles: [customBundle({}, true)],
        }} element={element as unknown as SceneElement} />);

        Boolean(screen.getByRole('alert')).should.equal(true);
        (screen.queryByText('Press') === null).should.equal(true);
        document.querySelectorAll('[data-scene-package-asset]').length.should.equal(0);
    });

    it('should block forbidden network assets instead of rendering rejected components', () => {
        render(<WebViewPackageHost configuration={{
            profile: { name: 'webview', targetPlatform: 'web', packages: ['Example'] },
            policy: { allowExecutableImports: true, allowNetworkAssets: false },
            bundles: [customBundle({ assets: ['https://cdn.example.com/example.css'] })],
        }} element={element as unknown as SceneElement} />);

        Boolean(screen.getByRole('alert')).should.equal(true);
        (screen.queryByText('Press') === null).should.equal(true);
        document.querySelectorAll('[data-scene-package-asset]').length.should.equal(0);
    });
});
