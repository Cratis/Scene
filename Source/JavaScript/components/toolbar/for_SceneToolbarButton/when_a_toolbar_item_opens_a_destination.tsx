// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DestinationKind, ExternalComponent, SceneElement } from '@cratis/scene.model';
import { RegisteredComponentProps, SceneElementView, SceneNavigationHost, coreComponents, useSceneNavigation } from '@cratis/scene.react';
import { cratisComponents } from '../../cratisComponents';

/**
 * A toolbar item configured with label, icon, presentation and a destination - a dialog, or a slice screen -
 * opens it through the navigation host, and the dialog returns its result to the screen that opened it.
 */
function Close({ element }: RegisteredComponentProps) {
    const navigation = useSceneNavigation();
    return <button type='button' onClick={() => navigation.closeDialog(element.properties.result)}>{String(element.properties.label)}</button>;
}

function Where() {
    const navigation = useSceneNavigation();
    return <output aria-label='where'>{JSON.stringify({ screen: navigation.currentScreen, dialog: navigation.currentDialog ?? null, returned: navigation.dialogResult ?? null })}</output>;
}

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;
const rename = element('rename', 'Cratis.Components:toolbarButton', { title: 'Rename work item', icon: 'pi pi-pencil', active: false, tooltipPosition: 'bottom', destination: { kind: DestinationKind.Dialog, dialog: 'RenameWorkItem' } });
const history = element('history', 'Cratis.Components:toolbarButton', { title: 'Show history', icon: 'pi pi-history', destination: { module: 'Work', feature: 'Items', slice: 'WorkItemHistory' } });

const registry = { ...coreComponents, ...cratisComponents, 'test:close': Close, 'test:where': Where };
const page = (id: string, ...children: SceneElement[]) => ({ id, children }) as unknown as SceneElement;
const screens = {
    WorkItemDetails: page('details', element('details.where', 'test:where'), rename, history),
    WorkItemHistory: page('history', element('history.where', 'test:where')),
};
const dialogs = { RenameWorkItem: page('rename-dialog', element('rename.save', 'test:close', { label: 'Save', result: { renamed: true } })) };
const where = () => JSON.parse(screen.getByLabelText('where').textContent!);

describe('when a toolbar item opens a destination', () => {
    afterEach(cleanup);

    it('should present the configured label and icon', () => {
        render(<SceneNavigationHost screens={screens} dialogs={dialogs} initialScreen='WorkItemDetails' registry={registry} />);
        const button = screen.getByRole('button', { name: 'Rename work item' });
        (button.querySelector('.pi-pencil') !== null || button.innerHTML.includes('pi-pencil')).should.equal(true);
    });

    it('should open its dialog and receive the dialog result', async () => {
        render(<SceneNavigationHost screens={screens} dialogs={dialogs} initialScreen='WorkItemDetails' registry={registry} />);
        fireEvent.click(screen.getByRole('button', { name: 'Rename work item' }));
        where().dialog.should.equal('RenameWorkItem');
        await act(async () => { fireEvent.click(screen.getByText('Save')); });
        where().should.deep.equal({ screen: 'WorkItemDetails', dialog: null, returned: { dialog: 'RenameWorkItem', result: { renamed: true } } });
    });

    it('should open a slice screen', () => {
        render(<SceneNavigationHost screens={screens} dialogs={dialogs} initialScreen='WorkItemDetails' registry={registry} />);
        fireEvent.click(screen.getByRole('button', { name: 'Show history' }));
        where().screen.should.equal('WorkItemHistory');
    });

    it('should announce the destination outside a navigation host', () => {
        const received: unknown[] = [];
        const listener = (event: Event) => received.push((event as CustomEvent).detail.destination);
        globalThis.addEventListener('cratis.scene.navigate', listener);
        render(<SceneElementView element={rename} registry={registry} />);
        fireEvent.click(screen.getByRole('button', { name: 'Rename work item' }));
        globalThis.removeEventListener('cratis.scene.navigate', listener);
        received.should.deep.equal([{ kind: DestinationKind.Dialog, dialog: 'RenameWorkItem' }]);
    });
});
