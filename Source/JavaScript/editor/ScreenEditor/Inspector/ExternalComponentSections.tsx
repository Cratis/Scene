// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentDescriptor, ExternalComponent, InspectedProperty } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { UnapprovedPackageNotice } from './UnapprovedPackageNotice';
import { DesignTimeDesignersSection } from './DesignTimeDesignersSection';
import { DesignTimeActionsSection } from './DesignTimeActionsSection';
import { DesignTimePropertyEditorsSection } from './DesignTimePropertyEditorsSection';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface ExternalComponentSectionsProps {
    component: ExternalComponent;
    descriptor: ComponentDescriptor;

    properties: InspectedProperty[];
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    disabled: boolean;
}

export const ExternalComponentSections = ({ component, descriptor, properties, controller, environment, strings, disabled }: ExternalComponentSectionsProps) => (
    <>
        <UnapprovedPackageNotice descriptor={descriptor} component={component} controller={controller} environment={environment} strings={strings} />
        <DesignTimeDesignersSection component={component} descriptor={descriptor} controller={controller} environment={environment} strings={strings} />
        <DesignTimeActionsSection component={component} descriptor={descriptor} controller={controller} environment={environment} strings={strings} disabled={disabled} />
        <DesignTimePropertyEditorsSection component={component} descriptor={descriptor} properties={properties} controller={controller} environment={environment} strings={strings} disabled={disabled} />
    </>
);
