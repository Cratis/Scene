// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { TemplateAuthoringSection } from './TemplateAuthoringSection';
import { DialogTemplateAuthoringSection } from './DialogTemplateAuthoringSection';
import { LocationSection } from './LocationSection';
import { FormAuthoringSection } from './FormAuthoringSection';
import { ShellNavigationSection } from './ShellNavigationSection';
import { ScreenOutletsSection } from './ScreenOutletsSection';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface ScreenPropertiesProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    authoringTemplate?: string;
    // What the host adds to the screen's own settings - Studio puts the screen's fit and what it submits here.
    hostProperties?: ReactNode;
}

// Nothing selected: the screen itself is the implicit subject, so its own settings (template, dialog templates, forms) show here instead of being
// layered onto every component's own properties.
export const ScreenProperties = ({ controller, environment, strings, authoringTemplate, hostProperties }: ScreenPropertiesProps) => {
    if (authoringTemplate) {
        return (
            <div className='studio-editor-properties'>
                <TemplateAuthoringSection controller={controller} environment={environment} strings={strings} disabled={false} authoringTemplate={authoringTemplate} />
            </div>
        );
    }
    return (
        <div className='studio-editor-properties'>
            <header className='studio-editor-properties__header'><strong>{strings.properties.screenLabel}</strong></header>
            {hostProperties}
            <LocationSection location={environment.location} strings={strings} />
            <TemplateAuthoringSection controller={controller} environment={environment} strings={strings} disabled={false} />
            <DialogTemplateAuthoringSection controller={controller} strings={strings} disabled={false} />
            <FormAuthoringSection controller={controller} slices={environment.stateChangeSlices} strings={strings} disabled={false} />
            <ShellNavigationSection controller={controller} environment={environment} strings={strings} />
            <ScreenOutletsSection controller={controller} environment={environment} strings={strings} />
        </div>
    );
};
