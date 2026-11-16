// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import type { ComponentDescriptor, ExternalComponent, InspectedProperty, SceneElement } from '@cratis/scene.model';
import { isExternalComponent } from '@cratis/scene.engine';
import type { BindingTypeScope } from '@cratis/scene.engine';
import { visibleProperties } from '../Properties/visibleProperties';
import { childrenOfElement, isCanvasHolding } from '../Selection/sceneTree';
import type { ScreenOutlets } from '../DesignMode/Outlets/screenOutlets';
import { createBindingScope } from '../Binding/bindingScopeTypes';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';
import { editableProperties, groupProperties, isDrawnByItsOwnEditor } from '../Properties/toPropertyGroups';
import { OwnershipBadge } from './OwnershipBadge';
import { DiagnosticList } from './DiagnosticList';
import { isCommandFormType } from '../Forms/commandFormElements';
import { TemplateAuthoringSection } from './TemplateAuthoringSection';
import { LayoutTypeSection } from './LayoutTypeSection';
import { ExternalComponentSections } from './ExternalComponentSections';
import { CommandFormProperties } from './CommandFormProperties';
import { ExposureSection } from './ExposureSection';
import { ActionProperties } from './ActionProperties';
import { PropertyGroups } from './PropertyGroups';
import { createEditorContext } from '../PropertyEditors/Registry/createEditorContext';
import { screenEditorPropertyEditors } from '../PropertyEditors/Registry/screenEditorPropertyEditors';
import { argumentsProperty } from '../Actions/actionBehavior';
import { ToolbarButtonClickEditor } from './ToolbarButtonClickEditor';
import { destinationTargetsOf } from '../Destinations/destinationTargetsOf';
import { withoutIconDiagnostics } from '../Properties/iconDiagnostics';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import type { Ownership } from '../Structure/Ownership';
import { NavigationSection } from './NavigationSection';
import { ToolbarButtonSection } from './ToolbarButtonSection';
import { OutletButtonSection } from './OutletButtonSection';
import { OutletSection } from './OutletSection';
import { SelectionDetailSection } from './DataBindingSections';
import { isToolbarElement } from '../Toolbar/toolbarDiagnostics';

export interface ComponentPropertiesProps {
    controller: ScreenEditorController;
    environment: ScreenEditorEnvironment;
    strings: ScreenEditorStrings;
    ownership: Ownership | undefined;
    authoringTemplate?: string;
    selectedId: string;
    selection: NonNullable<ScreenEditorController['selection']>;
    inspection: NonNullable<ScreenEditorController['inspection']>;
    screenOutlets: ScreenOutlets;
}

const componentDescriptor = (descriptors: readonly ComponentDescriptor[], typeId: string): ComponentDescriptor | undefined =>
    descriptors.find(descriptor => descriptor.component === typeId);
// The action's argument mapping is drawn by the action editor, which knows what its entries mean.
const ownEditors = new Set<string>([argumentsProperty]);

export const ComponentProperties = ({ controller, environment, strings, ownership, authoringTemplate, selectedId, selection, inspection, screenOutlets }: ComponentPropertiesProps) => {
    const text = strings.properties;
    const scope = useMemo<BindingTypeScope>(() => createBindingScope(environment.availableSources), [environment.availableSources]);
    const inCanvas = isCanvasHolding(controller.composition.roots, selectedId);
    const shown = visibleProperties(inspection.properties, inCanvas, (selection as { properties?: Record<string, unknown> }).properties);
    const { runtime } = environment;
    const descriptor = componentDescriptor(controller.context.catalog.components, inspection.typeId);

    // A package that registers an editor for a property draws it itself, in its own section; every other property is drawn by the editor the
    // registry resolves for it - one that nothing describes is reported there, never shown as a box of JSON.
    const packageDescriptor = descriptor ? runtime.packageDescriptorOf(descriptor) : undefined;
    const drawnByPackage = (property: InspectedProperty): boolean => !!packageDescriptor && runtime.designTime.propertyEditor(packageDescriptor, property.descriptor).contribution !== undefined;
    const registry = environment.propertyEditors?.registry ?? screenEditorPropertyEditors;
    const sceneDiagnostics = [...inspection.diagnostics, ...controller.diagnostics];
    const listed = editableProperties(shown, inspection.typeId, property => ownEditors.has(property.descriptor.path) || drawnByPackage(property));
    const groups = groupProperties(listed);
    const editorInputs = { controller, environment, strings, ownership, ...(authoringTemplate ? { authoringTemplate } : {}), diagnostics: sceneDiagnostics, inCanvas, bindingScope: scope };
    const baseContext = createEditorContext(editorInputs);
    const isAction = inspection.typeId.endsWith('action');
    const isToolbarButton = inspection.typeId.endsWith('toolbarButton');
    const isCommandForm = isCommandFormType(inspection.typeId);
    const locked = ownership !== undefined && ownership !== 'local';
    const properties = (selection as { properties?: Record<string, unknown> }).properties;
    // An outlet of actions - the toolbar since Scene 5 - carries its buttons as its `items`; the button the design mode selected is edited from there.
    const outletItems = isToolbarElement(selection) && /(^|:)outletItems$/.test(inspection.typeId) ? inspection.properties.find(property => property.descriptor.path === 'items') : undefined;

    // An outlet the screen's template or layout declares is edited in the outlet design mode, through every level (StudioIssues#1330); the element's own items
    // are what it draws only where no page around it declares the outlet.
    const drawsOutlet = /(^|:)outletItems$/.test(inspection.typeId);
    const outletName = drawsOutlet && typeof properties?.name === 'string' ? properties.name : undefined;
    const declaredOutlet = outletName && screenOutlets.design(outletName) ? outletName : undefined;
    const elementDrawing = (outlet: string) => findOutletElement(controller.composition.roots, outlet);

    return (
        <div className='studio-editor-properties'>
            <header className='studio-editor-properties__header'>
                <strong>{inspection.label}</strong>
                <span>{inspection.typeId}</span>
                {ownership && <OwnershipBadge ownership={ownership} label={strings.ownership[ownership]} />}
            </header>
            {ownership && <p className='studio-editor-properties__hint'>{strings.ownershipHint[ownership]}</p>}

            <NavigationSection controller={controller} environment={environment} strings={strings} />
            {selection && <ToolbarButtonSection controller={controller} strings={strings} element={selection} />}
            {declaredOutlet && (
                <OutletSection
                    controller={controller} environment={environment} strings={strings} outlet={declaredOutlet} componentId={selectedId}
                    onChooseOutlet={outlet => { const element = elementDrawing(outlet); if (element) controller.select(element); }}
                />
            )}
            {outletItems && !declaredOutlet && controller.selectedItemId !== undefined && (
                <OutletButtonSection controller={controller} strings={strings} componentId={selectedId} items={outletItems} registry={registry} context={baseContext} />
            )}

            <DiagnosticList diagnostics={withoutIconDiagnostics(sceneDiagnostics)} label={text.diagnostics} />

            <LayoutTypeSection inspection={inspection} controller={controller} strings={strings} disabled={ownership !== undefined && ownership !== 'local'} />

            {/* Editing a template's own metadata (not browsing templates for the screen) is the one screen-level
                section that belongs beside a selected component's properties too: it edits the template the
                selection lives inside, not the screen or the component itself. Template browsing, dialog template
                authoring and form authoring are screen-level settings and only show with nothing selected. */}
            {authoringTemplate && (
                <TemplateAuthoringSection
                    controller={controller}
                    environment={environment}
                    strings={strings}
                    disabled={ownership !== undefined && ownership !== 'local'}
                    authoringTemplate={authoringTemplate}
                />
            )}

            {descriptor && isExternalComponent(selection as never) && (
                <ExternalComponentSections
                    component={selection as ExternalComponent}
                    descriptor={descriptor}
                    properties={inspection.properties.filter(property => !isDrawnByItsOwnEditor(inspection.typeId, property.descriptor.path))}
                    controller={controller}
                    environment={environment}
                    strings={strings}
                    disabled={locked}
                />
            )}

            {groups.length === 0 && inspection.properties.length === 0 && <p className='studio-editor-properties-empty'>{text.noProperties}</p>}

            <PropertyGroups groups={groups} selectedId={selectedId} registry={registry} baseContext={baseContext} editorInputs={editorInputs} diagnostics={sceneDiagnostics} onChange={controller.setProperty} />

            {isAction && <ActionProperties controller={controller} environment={environment} strings={strings} elementId={selectedId} properties={properties} disabled={locked} {...(baseContext.lookups.placement ? { placement: baseContext.lookups.placement } : {})} />}

            {isCommandForm && <CommandFormProperties elementId={selectedId} properties={properties} controller={controller} environment={environment} strings={strings} disabled={locked} />}

            <SelectionDetailSection controller={controller} environment={environment} strings={strings} elementId={selectedId} disabled={locked} />

            {isToolbarButton && (
                <ToolbarButtonClickEditor
                    key={selectedId}
                    behaviors={selection.behaviors}
                    targets={destinationTargetsOf(environment, controller.document)}
                    destinations={environment.destinations}
                    slices={environment.stateChangeSlices}
                    strings={strings.properties.toolbarButton}
                    disabled={locked}
                    onChange={behaviors => controller.setElementBehaviors(selectedId, behaviors, strings.properties.toolbarButton.label)}
                />
            )}

            <ExposureSection inspection={inspection} componentId={selectedId} controller={controller} strings={strings} authoringTemplate={authoringTemplate} />
        </div>
    );
};

// The element that draws an outlet on the screen, if the screen places one.
function findOutletElement(roots: readonly SceneElement[], outlet: string): string | undefined {
    for (const element of roots) {
        const drawn = element as unknown as { id: string; componentName?: string; properties?: Record<string, unknown> };
        if (typeof drawn.componentName === 'string' && /(^|:)outletItems$/.test(drawn.componentName) && drawn.properties?.name === outlet) return drawn.id;
        const found = findOutletElement(childrenOfElement(element), outlet);
        if (found) return found;
    }
    return undefined;
}
