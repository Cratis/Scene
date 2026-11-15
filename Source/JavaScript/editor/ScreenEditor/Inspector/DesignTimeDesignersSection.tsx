// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentDescriptor, ExternalComponent } from '@cratis/scene.model';
import { ErrorBoundary } from '@cratis/components/Common';
import { createDesignTimeContext } from './DesignTimeContextFactory';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import { unapprovedPackageOf } from './unapprovedPackageOf';

export interface DesignTimeDesignersSectionProps {
    component: ExternalComponent;
    descriptor: ComponentDescriptor;
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
}

// The designer the component's package contributes, as Scene's design-time host resolves it from the descriptor's editor
// kind. One the host cannot load is reported with Scene's reason; one that fails while drawing is replaced by a note, and
// the rest of the inspector carries on.
export const DesignTimeDesignersSection = ({ component, descriptor, controller, environment, strings }: DesignTimeDesignersSectionProps) => {
    const { designTime, packageDescriptorOf } = environment.runtime;
    const packageDescriptor = packageDescriptorOf(descriptor);
    if (unapprovedPackageOf(packageDescriptor, environment)) return null;
    const resolution = designTime.designer(packageDescriptor);
    const Designer = resolution.contribution;
    if (!Designer && !resolution.diagnostic) return null;

    const name = `${resolution.package ?? ''}:${packageDescriptor.editorKind ?? ''}`;
    return (
        <section className='studio-editor-properties__designers'>
            <strong>{strings.properties.designTimeDesigners}</strong>
            {Designer
                ? (
                    <ErrorBoundary key={name} fallback={<p className='studio-editor-binding__missing' role='alert'>{strings.properties.designerFailed(name)}</p>}>
                        <Designer context={createDesignTimeContext(component, packageDescriptor, controller, environment, strings.properties.designTimeDesigners)} />
                    </ErrorBoundary>
                )
                : <p className='studio-editor-binding__missing' role='alert'>{resolution.diagnostic}</p>}
        </section>
    );
};
