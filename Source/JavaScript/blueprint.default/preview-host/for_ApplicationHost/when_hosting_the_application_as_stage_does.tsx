// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ApplicationHost } from '../ApplicationHost';
import { composeApplicationScreen } from '../composeApplication';
import { navigation, ordersApplication, registry, structure, withPrime } from '../for_ScenePreviewHost/given';
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
