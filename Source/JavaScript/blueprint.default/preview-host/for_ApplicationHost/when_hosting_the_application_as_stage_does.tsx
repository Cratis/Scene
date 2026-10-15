// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, useContext, useEffect } from 'react';
import { cleanup, render } from '@testing-library/react';
import { DestinationKind } from '@cratis/scene.model';
import { useSceneNavigation } from '@cratis/scene.react';
import { afterEach } from 'vitest';
import { ApplicationHost } from '../ApplicationHost';
import { composeApplicationScreen } from '../composeApplication';
import { element, navigation, ordersApplication, registry, structure, withPrime } from '../for_ScenePreviewHost/given';
import { preview } from '../for_ScenePreviewHost/when_previewing_a_module';
import { ApplicationStructureIndex } from '@cratis/scene.engine';

// React and PrimeReact number the elements they render; the numbers are not part of what is rendered.
const primary = () => document.querySelector('[data-scene-outlet="primary"]')!.innerHTML.replace(/_r_[0-9a-z]+_/g, '_r_');

describe('when hosting the application as Stage does', () => {
    afterEach(cleanup);

    const application = ordersApplication();

    for (const screen of application.screens) {
        describe(`and the feature is ${screen.name}`, () => {
            it('should render what the preview host renders for it', () => {
                const [module, ...rest] = screen.name.split('.');
                const stage = render(withPrime(<ApplicationHost application={ordersApplication()} navigationModel={{ structure: new ApplicationStructureIndex(structure), navigation }} registry={registry} composition={{ logo: navigation.application.logo }} initialScreen={screen.name} />));
                const stageHtml = primary();
                stage.unmount();

                render(preview({ target: { module, feature: rest.join('.') } }));
                primary().should.equal(stageHtml);
            });
        });
    }

    describe('and the composition function is used directly', () => {
        it('should be the element the host renders', () => {
            const composed = composeApplicationScreen(application, application.screens[1]);
            composed.element.should.not.equal(undefined);
        });
    });
});

describe('when a host puts its own scope around the application', () => {
    afterEach(cleanup);

    const HostScope = createContext('no');

    function Marker({ children }: { children: React.ReactNode }) {
        return <HostScope.Provider value='yes'><section data-host-scope='yes'>{children}</section></HostScope.Provider>;
    }

    function Reader() {
        return <span data-reads-scope={useContext(HostScope)} />;
    }

    const application = () => ({ ...ordersApplication(), dialogTemplates: [{ name: 'Confirm', slots: [{ name: 'body' }], content: { body: [element('confirm-text', 'test:page', { title: 'Sure?' })] } } as never] });
    const model = { structure: new ApplicationStructureIndex(structure), navigation };

    it('should draw the screen inside it', () => {
        render(withPrime(<ApplicationHost application={ordersApplication()} navigationModel={model} registry={registry} initialScreen='sales.orders' scope={(_navigation, children) => <Marker>{children}</Marker>} />));
        (document.querySelector('[data-host-scope] [data-scene-outlet="primary"] [data-page="orders"]') !== null).should.equal(true);
    });

    it('should run what the host draws as part of the application, under the scope', () => {
        render(withPrime(<ApplicationHost application={ordersApplication()} navigationModel={model} registry={registry} initialScreen='sales.orders' scope={(_navigation, children) => <Marker>{children}</Marker>}
            renderScreen={() => <Reader />} />));
        document.querySelector('[data-reads-scope]')!.getAttribute('data-reads-scope')!.should.equal('yes');
    });

    describe('and a dialog the document declares is open', () => {
        it('should leave it to the host to draw when it says so, inside the scope', () => {
            render(withPrime(<ApplicationHost application={application()} navigationModel={model} registry={registry} initialScreen='sales.orders'
                scope={(_navigation, children) => <Marker>{children}</Marker>}
                renderDialogTemplate={(template, content) => <aside data-own-dialog={template.name} data-content-id={(content as unknown as { id: string }).id} />}
                children={<OpenDialog name='Confirm' />} />));
            [document.querySelector('[data-host-scope] [data-own-dialog]')?.getAttribute('data-own-dialog'), document.querySelector('[data-own-dialog]')?.getAttribute('data-content-id')].should.deep.equal(['Confirm', 'dialog-Confirm']);
        });

        it('should draw its plain dialog when the host does not say so', () => {
            render(withPrime(<ApplicationHost application={application()} navigationModel={model} registry={registry} initialScreen='sales.orders' children={<OpenDialog name='Confirm' />} />));
            document.querySelector('[role="dialog"][data-scene-dialog="Confirm"]')!.textContent!.should.contain('Sure?');
        });
    });
});

function OpenDialog({ name }: { name: string }) {
    const navigation = useSceneNavigation();
    useEffect(() => {
        navigation.navigate({ kind: DestinationKind.Dialog, dialog: name });
        // Opened once.
    }, []);
    return null;
}
