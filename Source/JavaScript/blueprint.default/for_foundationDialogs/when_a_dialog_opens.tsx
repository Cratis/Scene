// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { afterEach, beforeAll, vi } from 'vitest';
import { InteractionActionKind, InteractionTriggerKind } from '@cratis/scene.model';
import { SceneNavigationContextInternal, SceneNavigationContextValue, corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { defaultBlueprint } from '../defaultBlueprint';
import { DialogFrame, DialogPlacement, foundationElement, placementFor } from '../foundation';
import { GalleryDialogPreview, galleryDialogTemplates } from '../gallery';
import { provideBrowserApis } from '../for_templatePreviewStates/given';
import { foundationPack } from './given';

const registry = mergePackageRegistries([corePackage, defaultBlueprint]);
const open = (name: string) => render(<PrimeReactProvider><GalleryDialogPreview dialogName={name} registry={registry} pack={foundationPack} /></PrimeReactProvider>);
const host = (container: HTMLElement) => container.querySelector('[role="dialog"]') as HTMLElement;
const navigationWith = (closeDialog: () => void) => ({ closeDialog }) as unknown as SceneNavigationContextValue;

// Part B 2.10 behaviour: focus trap and restore, Escape, aria-modal, a name for the dialog, the standard placements, and a phone that fills the page.
describe('when a dialog opens', () => {
    beforeAll(provideBrowserApis);
    afterEach(cleanup);

    it('should name the dialog by its heading and keep it modal', () => {
        const { container } = open('ConfirmDialog');
        const dialog = host(container);
        dialog.getAttribute('aria-modal')!.should.equal('true');
        document.getElementById(dialog.getAttribute('aria-labelledby')!)!.textContent!.should.equal('Archive this product?');
        screen.getByRole('dialog', { name: 'Archive this product?' });
    });

    it('should take the host element on: a class to style it, its placement and its tone', () => {
        const { container } = open('ConfirmDialog');
        host(container).classList.contains('foundation-dialog-host').should.equal(true);
        [host(container).dataset.placement, host(container).dataset.tone].should.deep.equal(['center', 'danger']);
    });

    it('should put focus on the first field when the dialog has one', () => {
        open('QuickCreateDialog');
        (document.activeElement as HTMLElement).tagName.should.equal('INPUT');
    });

    it('should put focus on the primary action rather than the close button when the dialog has no field', () => {
        open('ConfirmDialog');
        (document.activeElement as HTMLElement).textContent!.should.equal('Keep it');
    });

    it('should keep Tab inside the dialog, wrapping from the last control to the first and back', () => {
        const { container } = render(<PrimeReactProvider><button>outside</button><GalleryDialogPreview dialogName='ConfirmDialog' registry={registry} pack={foundationPack} /></PrimeReactProvider>);
        const controls = Array.from(host(container).querySelectorAll<HTMLElement>('button'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        last.focus();
        fireEvent.keyDown(host(container), { key: 'Tab' });
        (document.activeElement === first).should.equal(true);
        first.focus();
        fireEvent.keyDown(host(container), { key: 'Tab', shiftKey: true });
        (document.activeElement === last).should.equal(true);
    });

    it('should restore focus to the opener, and the host to how it was, when the dialog is removed', () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        const { unmount } = open('ConfirmDialog');
        (document.activeElement === trigger).should.equal(false);
        unmount();
        (document.activeElement === trigger).should.equal(true);
        trigger.remove();
        (document.querySelector('[role="dialog"]') === null).should.equal(true);
    });

    describe('and asking it to close', () => {
        const frame = (close: () => void, behaviors = false) => {
            const element = { ...foundationElement('dialogFrame', { title: 'Close me' }), ...(behaviors ? { behaviors: [] } : {}) };
            return render(<PrimeReactProvider><SceneNavigationContextInternal.Provider value={navigationWith(close)}>
                <div role='dialog' aria-modal='true'><DialogFrame element={element} slots={{}} /><button>ok</button></div>
            </SceneNavigationContextInternal.Provider></PrimeReactProvider>);
        };

        it('should close the dialog on Escape', () => {
            const close = vi.fn();
            const { container } = frame(close);
            fireEvent.keyDown(host(container), { key: 'Escape' });
            close.mock.calls.length.should.equal(1);
        });

        it('should close the dialog with the close button, named for the dialog', () => {
            const close = vi.fn();
            frame(close);
            fireEvent.click(screen.getByRole('button', { name: 'Close Close me' }));
            close.mock.calls.length.should.equal(1);
        });

        it('should run the behaviors attached to it, and not close the dialog itself, when there are some', () => {
            const close = vi.fn();
            const onClick = vi.fn();
            const element = foundationElement('dialogFrame', { title: 'Mine' });
            const { container } = render(<PrimeReactProvider><SceneNavigationContextInternal.Provider value={navigationWith(close)}>
                <div role='dialog' aria-modal='true'><DialogFrame element={element} slots={{}} interactions={{ onClick }} /></div>
            </SceneNavigationContextInternal.Provider></PrimeReactProvider>);
            fireEvent.keyDown(host(container), { key: 'Escape' });
            [onClick.mock.calls.length, close.mock.calls.length].should.deep.equal([1, 0]);
        });

        it('should attach a CloseDialog action to every Cancel and Close of the dialogs it ships', () => {
            for (const [dialog, label] of [['ConfirmDialog', 'Keep it'], ['QuickCreateDialog', 'Cancel'], ['LookupDialog', 'Cancel'], ['SideSheet', 'Close'], ['FilterDialog', 'Cancel']]) {
                const { container } = open(dialog);
                (screen.getAllByRole('button', { name: label }).length > 0).should.equal(true);
                container.remove();
                cleanup();
            }
        });
    });

    describe('and placing it', () => {
        it('should draw the side sheet as a drawer from the inline end', () => {
            const { container } = open('SideSheet');
            host(container).dataset.placement!.should.equal('side');
        });

        it('should fill the page on a phone whatever the placement asked for', () => {
            [DialogPlacement.Center, DialogPlacement.Side, DialogPlacement.Full].map(placement => placementFor(placement, true)).should.deep.equal(['full', 'full', 'full']);
            [DialogPlacement.Center, DialogPlacement.Side].map(placement => placementFor(placement, false)).should.deep.equal(['center', 'side']);
        });

        it('should draw a right-to-left locale mirrored', () => {
            const element = foundationElement('dialogFrame', { title: 'مرحبا', locale: 'ar' });
            const { container } = render(<PrimeReactProvider><div role='dialog'><DialogFrame element={element} slots={{}} /></div></PrimeReactProvider>);
            host(container).dir.should.equal('rtl');
        });
    });

    it('should say what it says in the strings of the element, so an application localizes it', () => {
        const element = foundationElement('dialogFrame', { title: 'Arkiver', consequences: ['Ordrer beholder den'], strings: { dialogClose: 'Lukk {title}', dialogConsequences: 'Hva som skjer' } });
        render(<PrimeReactProvider><div role='dialog'><DialogFrame element={element} slots={{}} /></div></PrimeReactProvider>);
        screen.getByRole('button', { name: 'Lukk Arkiver' });
        screen.getByRole('list', { name: 'Hva som skjer' });
    });

    it('should list the consequences of a confirmation and draw a destructive one in the danger tone', () => {
        const { container } = open('ConfirmDialog');
        screen.getAllByRole('listitem').map(item => item.textContent).should.deep.equal(['Existing orders keep it', 'It can be restored from the archive']);
        (container.querySelector('.foundation-dialog-frame[data-tone="danger"]') === null).should.equal(false);
        screen.getByRole('button', { name: 'Archive product' });
    });

    it('should carry a CloseDialog action on the Cancel and Close of every dialog it ships, as data the same document runs anywhere', () => {
        const closers = (template: { content?: Record<string, unknown[]> }) => Object.values(template.content ?? {}).flat()
            .flatMap(function walk(element: unknown): unknown[] { const e = element as { behaviors?: unknown[]; children?: unknown[] }; return [e, ...(e.children ?? []).flatMap(walk)]; })
            .filter(element => JSON.stringify((element as { behaviors?: unknown }).behaviors ?? []).includes(InteractionActionKind.CloseDialog));
        galleryDialogTemplates.filter(template => closers(template).length === 0).map(template => template.name).should.deep.equal([]);
        JSON.stringify(closers(galleryDialogTemplates[0])[0]).should.contain(InteractionTriggerKind.Click);
    });
});
