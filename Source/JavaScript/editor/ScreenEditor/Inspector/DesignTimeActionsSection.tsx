// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { ComponentDescriptor, ExternalComponent } from '@cratis/scene.model';
import { createDesignTimeContext } from './DesignTimeContextFactory';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import { unapprovedPackageOf } from './unapprovedPackageOf';

export interface DesignTimeActionsSectionProps {
    component: ExternalComponent;
    descriptor: ComponentDescriptor;
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    disabled: boolean;
}

// The actions the component's package contributes. Scene's design-time host decides which are shown and which can run -
// one whose availability check throws, or whose package is not loaded, is shown disabled with the reason - and runs them,
// handing the edits to the editor session, which applies them all or none as one undo step.
export const DesignTimeActionsSection = ({ component, descriptor, controller, environment, strings, disabled }: DesignTimeActionsSectionProps) => {
    const [messages, setMessages] = useState<string[]>([]);
    const { designTime, packageDescriptorOf } = environment.runtime;
    const packageDescriptor = packageDescriptorOf(descriptor);
    if ((packageDescriptor.actions ?? []).length === 0) return null;

    const contextFor = (label: string) => createDesignTimeContext(component, packageDescriptor, controller, environment, label);
    const actions = designTime.actions(packageDescriptor, contextFor(strings.properties.designTimeActions));
    // An unapproved package is reported once, by the notice above, not again for each of its actions.
    const unapproved = unapprovedPackageOf(packageDescriptor, environment, actions.map(action => action.diagnostic)) !== undefined;
    const unavailable = unapproved ? [] : actions.flatMap(action => action.diagnostic ? [action.diagnostic] : []);

    const run = (actionId: string, label: string) => {
        const outcome = designTime.runAction(packageDescriptor, actionId, contextFor(label));
        setMessages(outcome.diagnostics);
    };

    return (
        <section className='studio-editor-properties__actions'>
            <strong>{strings.properties.designTimeActions}</strong>
            {actions.filter(action => action.visible).map(action => (
                <button
                    key={action.descriptor.id}
                    type='button'
                    disabled={disabled || !action.enabled}
                    title={unapproved ? action.descriptor.description : action.diagnostic ?? action.descriptor.description}
                    onClick={() => run(action.descriptor.id, action.descriptor.label)}
                >
                    {action.descriptor.label}
                </button>
            ))}
            {[...unavailable, ...messages].length > 0 && (
                <ul className='studio-editor-properties__action-messages'>
                    {[...new Set([...unavailable, ...messages])].map(message => <li key={message}>{message}</li>)}
                </ul>
            )}
        </section>
    );
};
