// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState, type ReactNode } from 'react';
import { Tabs } from '@cratis/components/Common';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { InspectorTab } from './InspectorTab';
import { PropertiesPanel } from './PropertiesPanel';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import './ScreenInspector.css';

export interface ScreenInspectorProps {
    strings: ScreenEditorStrings;
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;

    // The template being authored, if any.
    authoringTemplate?: string;

    // The Structure tab's content. The host supplies it so the tree can be shared with the surface's own selection.
    structure: ReactNode;

    // Added to the Screen's properties, which the Properties tab shows while nothing is selected.
    screenProperties?: ReactNode;
    onClose: () => void;
}

// The right-hand inspector with its Properties and Structure tabs. It is Studio chrome that sits beside the
// floating window - never content inside the designed application.
export const ScreenInspector = ({ strings, controller, environment, authoringTemplate, structure, screenProperties, onClose }: ScreenInspectorProps) => {
    const [tab, setTab] = useState<string>(InspectorTab.Properties);
    const ownership = controller.selectedId ? controller.ownershipOf(controller.selectedId) : undefined;

    return (
        <section className='studio-editor-inspector' aria-label={strings.inspectorTitle}>
            <header className='studio-editor-inspector__header'>
                <h2 className='studio-editor-inspector__title'>{strings.inspectorTitle}</h2>
                <button type='button' className='studio-editor-inspector__close' aria-label={strings.closeInspector} title={strings.closeInspector} onClick={onClose}>×</button>
            </header>
            <Tabs
                className='studio-editor-inspector__tabs'
                aria-label={strings.inspectorTitle}
                value={tab}
                onChange={setTab}
                tabs={[
                    {
                        id: InspectorTab.Properties,
                        label: strings.propertiesTab,
                        content: <PropertiesPanel controller={controller} environment={environment} strings={strings} ownership={ownership} authoringTemplate={authoringTemplate} screenProperties={screenProperties} />,
                    },
                    { id: InspectorTab.Structure, label: strings.structureTab, content: structure },
                ]}
            />
        </section>
    );
};
