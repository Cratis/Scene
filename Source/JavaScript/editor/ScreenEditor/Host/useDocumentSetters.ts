// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback } from 'react';
import type { Behavior, DestinationReference, DialogTemplate, Form, SceneDocument, SceneElement, ScreenTemplate, Slot, TemplateMetadata } from '@cratis/scene.model';
import { chooseScreenTemplate } from '../Templates/chooseScreenTemplate';
import { screenName } from '../Document/studioScreen';
import { changeDocumentInSession, type ScreenEditSession } from '../Session/EditSession';
import { updateElementInDocument } from '../Document/updateElementInDocument';
import type { ScreenEditorEnvironment } from './ScreenEditorHost';

export const useDocumentSetters = (commit: (change: (current: ScreenEditSession) => ScreenEditSession) => unknown, environment: ScreenEditorEnvironment) => {
    const setScreenForms = useCallback((forms: Form[], label: string) => {
        commit(current => {
            const screens = current.document.screens.map(screen => screen.name === screenName ? { ...screen, forms } : screen);
            return changeDocumentInSession(current, { ...current.document, screens }, label);
        });
    }, [commit]);

    const changeDocument = useCallback((change: (document: SceneDocument) => SceneDocument, label: string) => {
        commit(current => changeDocumentInSession(current, change(current.document), label));
        return { applied: true };
    }, [commit]);

    const setScreenTemplateSlots = useCallback((templateName: string, slots: Slot[], label: string) => {
        commit(current => {
            const screenTemplates = current.document.screenTemplates.map(template => template.name === templateName ? { ...template, slots } : template);
            return changeDocumentInSession(current, { ...current.document, screenTemplates }, label);
        });
    }, [commit]);

    // Scene has no edit for a template's metadata, so it is changed on the document, as one undo step like any other.
    const setScreenTemplateMetadata = useCallback((templateName: string, metadata: TemplateMetadata | undefined, label: string) => {
        commit(current => {
            const screenTemplates = current.document.screenTemplates.map(template => {
                if (template.name !== templateName) return template;
                const { metadata: _, ...rest } = template;
                return metadata ? { ...rest, metadata } : rest;
            });
            return changeDocumentInSession(current, { ...current.document, screenTemplates }, label);
        });
    }, [commit]);

    const setDialogTemplates = useCallback((dialogTemplates: DialogTemplate[], label: string) => {
        commit(current => changeDocumentInSession(current, { ...current.document, dialogTemplates }, label));
    }, [commit]);

    const setCollectionItemDestination = useCallback((componentId: string, path: string, itemId: string, destination: DestinationReference | undefined, label: string) => {
        commit(current => changeDocumentInSession(current, updateElementInDocument(current.document, componentId, element => updateItemDestination(element, path, itemId, destination)), label));
    }, [commit]);

    const setScreenTemplate = useCallback((template: ScreenTemplate | undefined, label: string) => {
        const packaged = [...environment.runtime.bundles.flatMap(bundle => bundle.screenTemplates ?? []), ...(environment.ownTemplates ?? [])];
        commit(current => changeDocumentInSession(current, chooseScreenTemplate(current.document, template, packaged), label));
    }, [commit, environment.runtime.bundles, environment.ownTemplates]);

    const setElementBehaviors = useCallback((elementId: string, behaviors: Behavior[] | undefined, label: string) => {
        commit(current => changeDocumentInSession(current, updateElementInDocument(current.document, elementId, element => {
            if (behaviors) element.behaviors = behaviors;
            else delete element.behaviors;
        }), label));
    }, [commit]);

    return { setScreenForms, changeDocument, setScreenTemplateSlots, setScreenTemplateMetadata, setDialogTemplates, setCollectionItemDestination, setScreenTemplate, setElementBehaviors };
};

function updateItemDestination(element: SceneElement, path: string, itemId: string, destination: DestinationReference | undefined): void {
    const collection = element.properties[path];
    if (!Array.isArray(collection)) return;
    element.properties[path] = collection.map(item => isRecord(item) && item.id === itemId ? withDestination(item, destination) : item);
}

function withDestination(item: Record<string, unknown>, destination: DestinationReference | undefined): Record<string, unknown> {
    if (isRecord(item.values)) {
        const values = { ...item.values };
        if (destination) values.destination = destination;
        else delete values.destination;
        return { ...item, values };
    }
    const next = { ...item };
    if (destination) next.destination = destination;
    else delete next.destination;
    return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}
