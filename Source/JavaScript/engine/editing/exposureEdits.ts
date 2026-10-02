// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    CollectionOperation, DiagnosticCode, ExposedProperty, ExposePropertyEdit, PropertyValueType, SceneDiagnostic,
    SceneDocument, UnexposePropertyEdit,
} from '@cratis/scene.model';
import { findComponentDescriptor } from './DescriptorCatalog';
import { errorDiagnostic } from './diagnostics';
import { EditSession } from './EditSession';
import { grantKey } from './exposureGrants';
import { cloneData } from './pathAccess';

function ownsDeclaration(session: EditSession, owner: string, diagnostics: SceneDiagnostic[]): boolean {
    const level = session.chain.levels.at(-1);
    if (!level || level.owner !== owner) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.NodeNotEditable, `Exposure is declared by the layout or template that owns the component. '${owner}' is not what is being edited.`));
        return false;
    }

    return true;
}

function validateExposure(session: EditSession, property: ExposedProperty, diagnostics: SceneDiagnostic[]): boolean {
    const context = { component: property.component, path: property.path };
    const level = session.chain.levels.at(-1)!;
    const reExposed = property.reExposes !== undefined;

    if (!reExposed && !level.elements.some(candidate => candidate.id === property.component)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.ExposureTargetMissing, `'${level.owner}' has no component '${property.component}'.`, context));
        return false;
    }

    const grant = reExposed ? session.scopeGrants.get(grantKey(property.component, property.path)) : undefined;
    if (reExposed && (!grant || grant.owner !== property.reExposes)) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.ReExposureBroken, `'${property.reExposes}' does not expose '${property.path}' on '${property.component}' to '${level.owner}', so it cannot be passed on.`, context));
        return false;
    }

    const element = level.elements.find(candidate => candidate.id === property.component);
    const descriptor = grant
        ? grant.descriptor
        : findComponentDescriptor(session.context.catalog, element!.componentName)?.properties.find(candidate => candidate.path === property.path);
    if (!descriptor) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.ExposureTargetMissing, `There is no editable property '${property.path}' on '${property.component}'.`, context));
        return false;
    }

    const operations = property.operations ?? [];
    if (descriptor.valueType !== PropertyValueType.Collection) {
        if (operations.length > 0 || property.editableFields !== undefined) {
            diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidEdit, `'${descriptor.label}' is not a collection, so operations and editable fields do not apply.`, context));
            return false;
        }

        return true;
    }

    const known = Object.values(CollectionOperation) as string[];
    const unknown = operations.find(operation => !known.includes(operation));
    if (unknown !== undefined) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.InvalidEdit, `'${unknown}' is not a collection operation.`, context));
        return false;
    }

    const fields = descriptor.item?.properties.map(candidate => candidate.path) ?? [];
    const unknownField = property.editableFields?.find(field => !fields.includes(field));
    if (unknownField !== undefined) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.UnknownCollectionField, `Items of '${descriptor.label}' have no field '${unknownField}'.`, context));
        return false;
    }

    if (grant && (operations.some(operation => !grant.operations.includes(operation))
        || (grant.editableFields !== undefined && (property.editableFields ?? fields).some(field => !grant.editableFields!.includes(field))))) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.ExposureWidensOwner, `'${property.reExposes}' exposed less of '${descriptor.label}' than this re-exposes.`, context));
        return false;
    }

    return true;
}

/**
 * Applies an exposure declaration to a copy of the document.
 *
 * Exposure only narrows: the property has to be one the component's descriptor supports, a collection's
 * operations and fields have to exist, and a re-exposure cannot grant more than the owner it passes on.
 */
export function applyExposeProperty(session: EditSession, edit: ExposePropertyEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    if (!ownsDeclaration(session, edit.owner, diagnostics) || !validateExposure(session, edit.property, diagnostics)) return;

    let declaration = clone.exposures.find(candidate => candidate.owner === edit.owner);
    if (!declaration) {
        declaration = { owner: edit.owner, properties: [] };
        clone.exposures.push(declaration);
    }

    const same = (candidate: ExposedProperty) => candidate.component === edit.property.component
        && candidate.path === edit.property.path && candidate.reExposes === edit.property.reExposes;
    const position = declaration.properties.findIndex(same);
    if (position >= 0) declaration.properties[position] = cloneData(edit.property);
    else declaration.properties.push(cloneData(edit.property));
}

/**
 * Applies an exposure withdrawal to a copy of the document. Values already saved against it are not touched.
 */
export function applyUnexposeProperty(session: EditSession, edit: UnexposePropertyEdit, clone: SceneDocument, diagnostics: SceneDiagnostic[]): void {
    if (!ownsDeclaration(session, edit.owner, diagnostics)) return;

    const declaration = clone.exposures.find(candidate => candidate.owner === edit.owner);
    const remaining = declaration?.properties.filter(candidate => !(candidate.component === edit.component && candidate.path === edit.path));
    if (!declaration || remaining!.length === declaration.properties.length) {
        diagnostics.push(errorDiagnostic(DiagnosticCode.ExposureTargetMissing, `'${edit.owner}' does not expose '${edit.path}' on '${edit.component}'.`, { component: edit.component, path: edit.path }));
        return;
    }

    if (remaining!.length === 0) clone.exposures.splice(clone.exposures.indexOf(declaration), 1);
    else declaration.properties = remaining!;
}
