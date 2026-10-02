// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DiagnosticCode, PropertyDescriptor, QueryBinding, QueryCandidate, SceneDiagnostic,
} from '@cratis/scene.model';
import { errorDiagnostic } from './diagnostics';

/**
 * The types of the values a binding can draw from, keyed by binding path. Supplied by the host, which knows what
 * is in scope where the query is used.
 */
export interface BindingTypeScope {
    types: Record<string, string>;
}

const integerTypes = new Set(['int', 'integer', 'int16', 'int32', 'int64', 'short', 'long', 'byte', 'uint', 'uint16', 'uint32', 'uint64']);
const fractionalTypes = new Set(['number', 'float', 'double', 'decimal', 'single']);

function normalizeType(type: string): string {
    return type.trim().toLowerCase().replace(/\?$/, '');
}

/**
 * Whether a value of one type can feed a parameter or field of another.
 *
 * Types compare by name. A whole number may feed a fractional one, never the reverse, and a type called `any` or
 * `unknown` on either side matches anything.
 */
export function areTypesCompatible(sourceType: string, targetType: string): boolean {
    const source = normalizeType(sourceType);
    const target = normalizeType(targetType);
    if (source === target || source === 'any' || target === 'any' || source === 'unknown' || target === 'unknown') return true;
    if (integerTypes.has(source)) return integerTypes.has(target) || fractionalTypes.has(target);
    return fractionalTypes.has(source) && fractionalTypes.has(target);
}

/**
 * Validates a query binding against the query it names and the property it is for.
 *
 * Reports a query that is not among the candidates, a result shape the property cannot bind to, a required
 * parameter nothing supplies, a binding for a parameter the query does not have, an argument whose type does not
 * fit its parameter, and a result binding that names a field the query does not return.
 *
 * @param descriptor The `QueryReference` property the binding is the value of.
 * @param candidate The candidate the binding names, or `undefined` when the host found none.
 * @param binding The binding to check.
 * @param scope The types of the values arguments draw from. Without it argument types are not checked.
 * @returns The problems found; empty when the binding is sound.
 */
export function validateBinding(
    descriptor: PropertyDescriptor,
    candidate: QueryCandidate | undefined,
    binding: QueryBinding,
    scope?: BindingTypeScope,
): SceneDiagnostic[] {
    const path = descriptor.path;
    if (!candidate || candidate.id !== binding.queryId) {
        return [errorDiagnostic(DiagnosticCode.MissingQuery, `The query '${binding.query}' (${binding.queryId}) is not available here.`, { path })];
    }

    const diagnostics: SceneDiagnostic[] = [];
    const allowedShapes = descriptor.constraints?.resultShapes;
    if (allowedShapes && !allowedShapes.includes(candidate.resultShape)) {
        diagnostics.push(errorDiagnostic(
            DiagnosticCode.IncompatibleResultShape,
            `'${descriptor.label}' binds to ${allowedShapes.join(' or ')} results, but '${candidate.name}' returns ${candidate.resultShape}.`,
            { path }));
    }

    for (const argument of binding.arguments) {
        const parameter = candidate.parameters.find(candidateParameter => candidateParameter.name === argument.parameter);
        if (!parameter) {
            diagnostics.push(errorDiagnostic(DiagnosticCode.UnknownParameter, `'${candidate.name}' has no parameter '${argument.parameter}'.`, { path }));
            continue;
        }

        if (!scope) continue;
        const sourceType = scope.types[argument.source.path];
        if (sourceType === undefined) {
            diagnostics.push(errorDiagnostic(DiagnosticCode.UnresolvedArgumentSource, `'${argument.source.path}' is not available to supply '${parameter.name}'.`, { path }));
        } else if (!areTypesCompatible(sourceType, parameter.type)) {
            diagnostics.push(errorDiagnostic(
                DiagnosticCode.ArgumentTypeMismatch,
                `'${argument.source.path}' is ${sourceType} but '${parameter.name}' expects ${parameter.type}.`,
                { path }));
        }
    }

    for (const parameter of candidate.parameters.filter(candidateParameter => candidateParameter.required)) {
        if (!binding.arguments.some(argument => argument.parameter === parameter.name)) {
            diagnostics.push(errorDiagnostic(DiagnosticCode.MissingRequiredParameter, `'${candidate.name}' needs a value for '${parameter.name}'.`, { path }));
        }
    }

    for (const result of binding.results) {
        if (!candidate.resultFields.some(field => field.name === result.field)) {
            diagnostics.push(errorDiagnostic(DiagnosticCode.UnknownResultField, `'${candidate.name}' does not return a field '${result.field}'.`, { path }));
        }
    }

    return diagnostics;
}
