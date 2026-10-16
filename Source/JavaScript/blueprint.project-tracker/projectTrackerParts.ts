// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    Behavior, BindingSourceKind, DialogTemplate, ExternalComponent, InteractionActionKind, InteractionTriggerKind, NavigateAction, OpenDialogAction, SceneElement, ScreenTemplate, TemplateMetadata, TemplateScope,
} from '@cratis/scene.model';
import { component, panel } from '@cratis/scene.blueprint.default';
import { projectTrackerTemplateProvenance } from './templateProvenance';

export { component, panel };

/** The category of every template of this blueprint (spec Part B 1.2: `Business / <domain>`). */
export const projectTrackerCategory = 'Business / Project tracker';

/** The package-relative thumbnail of a template. */
export const thumbnailOf = (templateName: string): string => `thumbnails/${templateName}.svg`;

/** The metadata of a screen template of this blueprint: provenance, a type from the vocabulary, the category, a thumbnail and the levels it applies at. */
export const projectTrackerMetadata = (name: string, type: 'Dashboard' | 'List' | 'Board' | 'Detail' | 'Form' | 'Dialog' | 'Workspace' | 'Timeline', scopes: TemplateScope[]): TemplateMetadata =>
    ({ ...projectTrackerTemplateProvenance, type, category: projectTrackerCategory, thumbnail: thumbnailOf(name), scopes });

/** A button of the foundation: a verb, its emphasis, and the permission rule every action declares (spec Part B 1.5). */
export const actionButton = (id: string, label: string, emphasis: 'primary' | 'secondary' | 'quiet' | 'danger', extra: Record<string, unknown> = {}, behaviors?: Behavior[]): ExternalComponent =>
    ({ ...component(id, 'actionButton', { label, emphasis, permission: 'enabled', ...extra }), ...(behaviors ? { behaviors } : {}) });

/** What pressing an element does: open the named dialog template over the page. */
export const opensDialog = (dialogTemplate: string): Behavior[] =>
    [{ bindings: [{ trigger: { kind: InteractionTriggerKind.Click }, actions: [{ kind: InteractionActionKind.OpenDialog, dialogTemplate } as OpenDialogAction] }] }];

/** What pressing an element does: go to the named screen. */
export const goesTo = (screen: string): Behavior[] =>
    [{ bindings: [{ trigger: { kind: InteractionTriggerKind.Click }, actions: [{ kind: InteractionActionKind.Navigate, screen } as NavigateAction] }] }];

/**
 * What choosing a row of a list does: open the record page, handing it the chosen row's id. The list is single-selection, so choosing a row is
 * opening it - the way a table of records works everywhere.
 */
export const opensRecordOnSelect = (listId: string, screen: string): Behavior[] => [{
    bindings: [{
        trigger: { kind: InteractionTriggerKind.Select },
        actions: [{ kind: InteractionActionKind.Navigate, screen, arguments: [{ name: 'id', value: { kind: BindingSourceKind.ComponentProperty, componentId: listId, path: 'value' } }] } as NavigateAction],
    }],
}];

/**
 * What choosing a row of a list does: open the named dialog over the page - a side sheet with the row's detail, so the list stays where it was.
 */
export const opensDialogOnSelect = (dialogTemplate: string): Behavior[] =>
    [{ bindings: [{ trigger: { kind: InteractionTriggerKind.Select }, actions: [{ kind: InteractionActionKind.OpenDialog, dialogTemplate } as OpenDialogAction] }] }];

/** What a Cancel or Close control does: close the dialog it was opened from. */
export const closesDialog = (): Behavior[] => [{ bindings: [{ trigger: { kind: InteractionTriggerKind.Click }, actions: [{ kind: InteractionActionKind.CloseDialog }] }] }];

/** An element with the given behaviors attached. */
export const withBehaviors = <T extends SceneElement>(element: T, behaviors: Behavior[]): T => ({ ...element, behaviors });

export type ProjectTrackerScreenTemplate = ScreenTemplate;
export type ProjectTrackerDialogTemplate = DialogTemplate;
