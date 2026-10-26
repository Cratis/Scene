// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SceneElementView } from '@cratis/scene.react';
import { galleryComponentCatalog, galleryPreviewRegistry, galleryScreenTemplates, resolveElementComponentNames } from '../gallery';
import { defaultBlueprintName } from '../packageName';

const profile = { name: 'Neutral', targetPlatform: 'web', packages: ['core', defaultBlueprintName] };

function renderTemplate(name: string) {
    const template = galleryScreenTemplates.find(candidate => candidate.name === name)!;
    const elements = Object.values(template.content ?? {}).flat().map(element => resolveElementComponentNames(element, profile, galleryComponentCatalog));
    return render(<>{elements.map(element => <SceneElementView key={element.id} element={element} registry={galleryPreviewRegistry} resolveBinding={() => undefined} />)}</>);
}

describe('when rendering the neutral gallery templates', () => {
    afterEach(() => {
        cleanup();
        window.location.hash = '';
    });

    it('should keep Landing actions named, distinguished and navigable without a widget library', () => {
        const { container } = renderTemplate('Landing');
        expect(container.querySelector('[data-scene-unresolved-component]')).toBeNull();
        const signIn = screen.getByRole('button', { name: 'Sign in' });
        expect(signIn.getAttribute('data-emphasis')).toBe('secondary');
        fireEvent.click(signIn);
        expect(window.location.hash).toBe('#/Login');
        for (const start of screen.getAllByRole('button', { name: 'Start free' })) {
            expect(start.getAttribute('data-emphasis')).toBe('primary');
            window.location.hash = '';
            fireEvent.click(start);
            expect(window.location.hash).toBe('#/Register');
        }
        expect(screen.getByRole('button', { name: 'Talk to us' }).getAttribute('data-emphasis')).toBe('secondary');
        for (const title of ['Ship the shell on day one', 'Every mode people expect', 'Themeable to the token', 'The pages you were going to build anyway']) {
            expect(screen.getAllByText(title)).toHaveLength(1);
        }
    });

    it('should keep ModuleWorkspace headings and content without inventing actions', () => {
        const { container } = renderTemplate('ModuleWorkspace');
        screen.getByRole('heading', { name: 'Operations' });
        screen.getByText('Everything the operations module owns');
        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(container.querySelector('[data-scene-unresolved-component]')).toBeNull();
    });

    it('should keep FeatureSection primary and secondary actions and their decorative icons', () => {
        const { container } = renderTemplate('FeatureSection');
        const primary = screen.getByRole('button', { name: 'New' });
        const secondary = screen.getByRole('button', { name: 'Export' });
        expect(primary.getAttribute('data-emphasis')).toBe('primary');
        expect(secondary.getAttribute('data-emphasis')).toBe('secondary');
        expect(primary.querySelector('i.pi-plus')?.getAttribute('aria-hidden')).toBe('true');
        expect(secondary.querySelector('i.pi-download')?.getAttribute('aria-hidden')).toBe('true');
        expect(container.querySelector('[data-scene-unresolved-component]')).toBeNull();
    });

    it('should keep SliceSection headings and content without inventing actions', () => {
        const { container } = renderTemplate('SliceSection');
        screen.getByRole('heading', { name: 'Adjustment' });
        screen.getByText('One behavior, one surface');
        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(container.querySelector('[data-scene-unresolved-component]')).toBeNull();
    });
});
