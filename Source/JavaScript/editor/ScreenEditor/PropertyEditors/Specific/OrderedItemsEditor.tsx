// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OrderedItemEditor } from '@cratis/components/ConfigurationEditor';
import type { DestinationReference, InspectedProperty } from '@cratis/scene.model';
import { IconPropertyField } from '../../../Icons/IconPropertyField';
import { toOrderedItems, toCapabilities, proposalToEdits, type SceneOrderedItem } from '../../Collections/orderedItems';
import { destinationProblems, type DestinationTargets } from '../../Destinations/destinationProblems';
import { destinationTargetsOf, unique } from '../../Destinations/destinationTargetsOf';
import { allowedIconChoices } from '../../Properties/allowedIconChoices';
import { iconMessagesOfItems } from '../../Properties/iconDiagnostics';
import { DestinationReferenceFields } from '../../Inspector/DestinationReferenceFields';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// A collection of things an author lists and orders - navigation items - drawn by the ordered-item editor, with the destination each item leads
// to. Items are added, removed, reordered and edited as the Scene collection edits they are, through the session, so undo, redo and the
// dirty state see them. It needs the session: without one there is nothing to apply an edit to.
export const OrderedItemsEditor = ({ context }: PropertyEditorProps<unknown>) => {
    const { session } = context;
    if (!session) return null;
    const { controller, environment, property, screenStrings: strings } = session;
    const componentId = context.selection?.id ?? '';
    const destinations = environment.destinations;
    const icons = context.lookups.icons;
    const { items, fixed } = toOrderedItems(property);
    const messages = iconMessagesOfItems(icons.diagnostics, property.descriptor.path);
    const capabilities = toCapabilities(property);
    const editableDestination = capabilities.fields.destination !== 'readonly' || property.editable;
    const destinationItems = [...fixed, ...items].filter(item => item.destination !== undefined || item.destinationReference !== undefined || editableDestination);
    const targets = destinationTargetsOf(environment, controller.document);
    const destinationOptions = destinationMetadataOptions(targets, property);
    const updateDestination = (item: SceneOrderedItem, destination: DestinationReference | undefined) => {
        controller.setCollectionItemDestination(componentId, property.descriptor.path, item.id, destination, strings.properties.destination.label);
    };

    return (
        <section className='studio-editor-properties__collection'>
            <OrderedItemEditor<SceneOrderedItem>
                items={items}
                fixedItems={fixed}
                capabilities={capabilities}
                destinations={destinations}
                validation={messages}
                renderIconField={field => (
                    <IconPropertyField
                        value={field.value}
                        onChange={field.onChange}
                        allowed={allowedIconChoices(property.descriptor.item?.properties.find(descriptor => descriptor.path === 'icon')?.choices)}
                        catalog={icons.catalog}
                        adapters={icons.adapters}
                        readOnly={field.readOnly}
                        showMessage={false}
                        invalid={field.invalid}
                        strings={strings.properties.icon}
                        pickerLabels={strings.properties.iconPickerLabels}
                        aria-label={field['aria-label']}
                        aria-describedby={field['aria-describedby']}
                    />
                )}
                aria-label={property.descriptor.label}
                createItem={() => ({ id: globalThis.crypto.randomUUID(), label: '', values: {} })}
                onChange={proposal => controller.applyAll(proposalToEdits(componentId, property, proposal), strings.properties.itemsLabel)}
            />
            {destinationItems.length > 0 && (
                <div className='studio-editor-destinations'>
                    <strong>{strings.properties.destination.label}</strong>
                    {destinationItems.map(item => (
                        <DestinationReferenceFields
                            key={item.id}
                            id={`${componentId}-${property.descriptor.path}-${item.id}`}
                            label={item.label}
                            value={item.destinationReference}
                            destinations={destinations}
                            slots={destinationOptions.slots}
                            dialogTemplates={destinationOptions.dialogTemplates}
                            problems={destinationProblems(item.destinationReference, targets)}
                            disabled={!editableDestination || fixed.some(fixedItem => fixedItem.id === item.id)}
                            strings={strings.properties.destination}
                            onChange={destination => updateDestination(item, destination)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

// The slots and dialogs offered for a destination: the ones that exist, and the ones items already name, so a value
// that no longer exists is still shown - and reported - rather than silently dropped from the choice.
function destinationMetadataOptions(targets: DestinationTargets, property: InspectedProperty): { slots: string[]; dialogTemplates: string[] } {
    const itemSlots = (property.items ?? []).map(item => isDestinationReference(item.values.destination) ? item.values.destination.slot : undefined).filter(isString);
    const itemDialogs = (property.items ?? []).map(item => isDestinationReference(item.values.destination) ? item.values.destination.dialog : undefined).filter(isString);
    return { slots: unique([...targets.slots, ...itemSlots]), dialogTemplates: unique([...targets.dialogTemplates, ...itemDialogs]) };
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isDestinationReference(value: unknown): value is DestinationReference {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
