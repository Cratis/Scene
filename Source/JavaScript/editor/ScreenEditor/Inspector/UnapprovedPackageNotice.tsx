// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentDescriptor, ExternalComponent } from '@cratis/scene.model';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import { createDesignTimeContext } from './DesignTimeContextFactory';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import { unapprovedPackageOf } from './unapprovedPackageOf';

export interface UnapprovedPackageNoticeProps {
    descriptor: ComponentDescriptor;
    component: ExternalComponent;
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
}

// Says once, and with the way out, that the package of the selected component is not in the application's UI profile.
export const UnapprovedPackageNotice = ({ descriptor, component, controller, environment, strings }: UnapprovedPackageNoticeProps) => {
    const packageDescriptor = environment.runtime.packageDescriptorOf(descriptor);
    const context = createDesignTimeContext(component, packageDescriptor, controller, environment, strings.properties.designTimeActions);
    const actions = environment.runtime.designTime.actions(packageDescriptor, context);
    const unapproved = unapprovedPackageOf(packageDescriptor, environment, actions.map(action => action.diagnostic));
    if (!unapproved) return null;
    return <p className='studio-editor-binding__missing studio-editor-properties__unapproved-package' role='alert'>{strings.properties.packageNotInProfile(unapproved)}</p>;
};
