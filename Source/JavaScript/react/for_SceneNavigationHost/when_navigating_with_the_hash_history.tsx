// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BindingSourceKind, DestinationKind, DestinationReference, ExternalComponent, SceneElement } from '@cratis/scene.model';
import { RegisteredComponentProps } from '../renderer';
import { SceneNavigationHost } from '../navigation/SceneNavigationHost';
import { createHashSceneHistory } from '../navigation/createHashSceneHistory';
import { useSceneNavigation } from '../navigation/SceneNavigationContext';

/**
 * The work item application from the screens-release conformance vector: a list, a details screen reached by
 * `workItemId`, and a toolbar item opening a rename dialog. The URL shapes are the ones the vector asserts.
 */
function Navigate({ element }: RegisteredComponentProps) {
    const navigation = useSceneNavigation();
    return <button type='button' onClick={() => navigation.navigate(element.properties.destination as DestinationReference)}>{String(element.properties.label)}</button>;
}

function Close({ element }: RegisteredComponentProps) {
    const navigation = useSceneNavigation();
    return <button type='button' onClick={() => navigation.closeDialog(element.properties.result)}>{String(element.properties.label)}</button>;
}

function Where() {
    const navigation = useSceneNavigation();
    return <output aria-label='where'>{JSON.stringify({ screen: navigation.currentScreen, parameters: navigation.currentParameters, outlet: navigation.currentOutlet ?? null, returned: navigation.dialogResult ?? null })}</output>;
}

function Page({ slots }: RegisteredComponentProps) {
    return <main>{slots.content}</main>;
}

const registry = { 'test:navigate': Navigate, 'test:close': Close, 'test:where': Where, 'test:page': Page };
const element = (id: string, componentName: string, properties: Record<string, unknown> = {}) => ({ id, componentName, properties, slots: {} }) as unknown as ExternalComponent;
const page = (id: string, ...children: SceneElement[]) => ({ id, componentName: 'test:page', properties: {}, slots: { content: children } }) as unknown as ExternalComponent;

const details: DestinationReference = {
    screen: 'WorkItemDetails',
    outlet: 'detail',
    routeParameterBindings: { workItemId: { kind: BindingSourceKind.DataContext, path: 'selected.workItemId' } },
};
const rename: DestinationReference = { kind: DestinationKind.Dialog, dialog: 'RenameWorkItem' };

const screens = {
    WorkItemList: page('list', element('list.where', 'test:where'), element('list.open', 'test:navigate', { label: 'Open B', destination: details })),
    WorkItemDetails: page('details', element('details.where', 'test:where'), element('details.rename', 'test:navigate', { label: 'Rename', destination: rename })),
};
const dialogs = { RenameWorkItem: page('rename', element('rename.save', 'test:close', { label: 'Save', result: { renamed: true } })) };

const where = () => JSON.parse(screen.getByLabelText('where').textContent!);
const host = () => <SceneNavigationHost screens={screens} dialogs={dialogs} initialScreen='WorkItemList' registry={registry}
    bindingScope={{ dataContext: { selected: { workItemId: 'B' } } }} destinations={[details]} history={createHashSceneHistory(window)} />;

async function popped(change: () => void) {
    await act(async () => {
        const event = new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
        change();
        await event;
    });
}

describe('when navigating with the hash history', () => {
    beforeEach(() => window.history.replaceState(null, '', '/runtime/index.html'));
    afterEach(cleanup);

    it('should open the deep link with its typed parameter', () => {
        window.history.replaceState(null, '', '/runtime/index.html#/WorkItemDetails?workItemId=B');
        render(host());
        where().should.deep.equal({ screen: 'WorkItemDetails', parameters: { workItemId: 'B' }, outlet: 'detail', returned: null });
    });

    it('should write the destination and its parameter into the fragment, keeping the page path', () => {
        render(host());
        fireEvent.click(screen.getByText('Open B'));
        window.location.pathname.should.equal('/runtime/index.html');
        window.location.hash.should.equal('#/WorkItemDetails?workItemId=B');
        where().should.deep.include({ screen: 'WorkItemDetails', parameters: { workItemId: 'B' }, outlet: 'detail' });
    });

    it('should open the toolbar dialog over the details and return its result', async () => {
        render(host());
        fireEvent.click(screen.getByText('Open B'));
        fireEvent.click(screen.getByText('Rename'));
        Boolean(screen.getByRole('dialog', { name: 'RenameWorkItem' })).should.equal(true);

        await popped(() => fireEvent.click(screen.getByText('Save')));
        (screen.queryByRole('dialog') === null).should.equal(true);
        where().should.deep.include({ screen: 'WorkItemDetails', returned: { dialog: 'RenameWorkItem', result: { renamed: true } } });
        window.location.hash.should.equal('#/WorkItemDetails?workItemId=B');
    });

    it('should go back to the list with the browser back button', async () => {
        render(host());
        fireEvent.click(screen.getByText('Open B'));
        await popped(() => window.history.back());
        where().screen.should.equal('WorkItemList');
    });

    it('should follow a fragment changed by hand', async () => {
        render(host());
        await act(async () => {
            window.history.replaceState(null, '', '/runtime/index.html#/WorkItemDetails?workItemId=C');
            window.dispatchEvent(new HashChangeEvent('hashchange'));
        });
        where().should.deep.include({ screen: 'WorkItemDetails', parameters: { workItemId: 'C' } });
    });
});
