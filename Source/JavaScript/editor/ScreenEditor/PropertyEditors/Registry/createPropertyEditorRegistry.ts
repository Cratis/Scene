// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyEditorKind } from '@cratis/scene.model';
import { PropertyEditorRegistry } from './PropertyEditorRegistry';

// The editors the screen editor ships, by id. Every loader is a dynamic `import()`, so the sidebar loads an editor when a selection first
// needs it and the editor bundle carries none of them up front (PE5). An id is a `PropertyEditorKind` or one of the editor kinds a package's
// descriptors have always named; a blueprint or a plugin adds its own with `register`, and registering an existing id replaces the built-in.
export function createPropertyEditorRegistry(): PropertyEditorRegistry {
    const registry = new PropertyEditorRegistry();

    // Generic editors (spec 8.1).
    registry.register(PropertyEditorKind.Text, async () => (await import('../Generic/TextEditor')).TextEditor);
    registry.register(PropertyEditorKind.Number, async () => (await import('../Generic/NumberEditor')).NumberEditor);
    registry.register(PropertyEditorKind.Boolean, async () => (await import('../Generic/BooleanEditor')).BooleanEditor);
    registry.register(PropertyEditorKind.Enum, async () => (await import('../Generic/EnumEditor')).EnumEditor);
    registry.register(PropertyEditorKind.Select, async () => (await import('../Generic/SelectEditor')).SelectEditor);
    registry.register(PropertyEditorKind.Color, async () => (await import('../Generic/ColorEditor')).ColorEditor);
    registry.register(PropertyEditorKind.Icon, async () => (await import('../Generic/IconEditor')).IconEditor);
    registry.register(PropertyEditorKind.List, async () => (await import('../Generic/ListEditor')).ListEditor);
    registry.register(PropertyEditorKind.Reference, async () => (await import('../Generic/ReferenceEditor')).ReferenceEditor);

    // Specific editors (spec 8.2).
    registry.register(PropertyEditorKind.NavigationTarget, async () => (await import('../Specific/NavigationTargetEditor')).NavigationTargetEditor);
    registry.register(PropertyEditorKind.RenderingSlot, async () => (await import('../Specific/RenderingSlotEditor')).RenderingSlotEditor);
    registry.register(PropertyEditorKind.Slice, async () => (await import('../Specific/SliceEditor')).SliceEditor);
    registry.register(PropertyEditorKind.InheritanceMode, async () => (await import('../Specific/InheritanceModeEditor')).InheritanceModeEditor);
    registry.register(PropertyEditorKind.Field, async () => (await import('../Specific/FieldEditor')).FieldEditor);
    registry.register(PropertyEditorKind.ColumnList, async () => (await import('../Specific/ColumnListEditor')).ColumnListEditor);

    // The template picker and the sample-data picker are delivered by their own issues; until they register theirs over these ids, each is the
    // reference editor for its kind of target, which is what they are: a choice among the model's templates, or its sample data packs.
    registry.register(PropertyEditorKind.Template, async () => (await import('../Specific/TemplatePropertyEditor')).TemplatePropertyEditor);
    registry.register(PropertyEditorKind.SampleData, async () => (await import('../Specific/ReferenceTargetEditors')).SampleDataEditor);

    // Structured values: an object by its fields, a collection by its items, a list of plain values by its entries.
    registry.register('object', async () => (await import('../Specific/StructuredPropertyEditor')).StructuredPropertyEditor);
    registry.register('collection', async () => (await import('../Specific/CollectionEditor')).CollectionEditor);
    for (const kind of [PropertyEditorKind.StringList, PropertyEditorKind.NumberList, PropertyEditorKind.StringOrList, PropertyEditorKind.Scalar, PropertyEditorKind.StringMap]) {
        registry.register(kind, async () => (await import('../Specific/StructuredPropertyEditor')).StructuredPropertyEditor);
    }

    // The editor kinds the packages' descriptors have always named, now resolved through the registry like any other.
    registry.register('iconPicker', async () => (await import('../Generic/IconEditor')).IconEditor);
    registry.register('navigationItemTarget', async () => (await import('../Specific/NavigationItemTargetEditor')).NavigationItemTargetEditor);
    registry.register('screenPicker', async () => (await import('../Specific/NavigationTargetEditor')).NavigationTargetEditor);
    registry.register('stateChangeReference', async () => (await import('../Specific/StateChangeEditors')).StateChangeEditor);
    registry.register('hookOpens', async () => (await import('../Specific/HookEditors')).HookOpensEditor);
    registry.register('hookEnabled', async () => (await import('../Specific/HookEditors')).HookEnabledEditor);
    registry.register('commandBinding', async () => (await import('../Specific/StateChangeEditors')).StateChangeEditor);
    registry.register('resultField', async () => (await import('../Specific/FieldEditor')).FieldEditor);
    registry.register('bindingPath', async () => (await import('../Specific/FieldEditor')).FieldEditor);
    registry.register('resultFieldList', async () => (await import('../Specific/FieldListEditor')).FieldListEditor);
    registry.register('queryBinding', async () => (await import('../Specific/QueryBindingPropertyEditor')).QueryBindingPropertyEditor);
    registry.register('bindingExpression', async () => (await import('../Specific/BindingExpressionPropertyEditor')).BindingExpressionPropertyEditor);
    registry.register('undescribed', async () => (await import('../Specific/UndescribedEditor')).UndescribedEditor);
    for (const kind of ['commandFormLayout', 'fieldWidths', 'commandFields', 'commandFormFieldPlacement', 'size', 'gridDefinitions']) {
        registry.register(kind, async () => (await import('../Specific/SummaryEditor')).SummaryEditor);
    }

    return registry;
}
