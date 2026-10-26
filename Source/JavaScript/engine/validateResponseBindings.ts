// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingMode, BindingSourceKind, ExecuteCommandAction, InteractionAction, InteractionActionKind, PropertyValueType, SetStateAction } from '@cratis/scene.model';
import { BindingDiagnostic } from './BindingDiagnostic';
import { ResponseContract, ResponseOperand, ResponseValidationContracts, ResponseValidationEntry, ResponseValueType } from './ResponseValidationContracts';

export function responseOperands(action: InteractionAction): { binding: BindingExpression; operand: ResponseOperand }[] {
    const operands: { binding: BindingExpression; operand: ResponseOperand }[] = (action.arguments ?? []).map(argument => ({ binding: argument.value, operand: { kind: 'argument', name: argument.name } }));
    if (action.kind === InteractionActionKind.SetState) operands.push({ binding: (action as SetStateAction).value, operand: { kind: 'stateValue' } });
    if ('message' in action) {
        const message = action.message as { binding?: BindingExpression } | undefined;
        if (message?.binding) operands.push({ binding: message.binding, operand: { kind: 'message' } });
    }
    return operands.filter(operand => operand.binding.kind === BindingSourceKind.CommandResponse);
}

function memberType(type: ResponseValueType, segment: string): ResponseValueType | undefined {
    if (type.kind !== 'object') return undefined;
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(segment)) return undefined;
    if (['constructor', 'prototype', '__proto__'].includes(segment)) return undefined;
    return Object.hasOwn(type.properties, segment) ? type.properties[segment] : undefined;
}

export function projectResponseType(type: ResponseValueType, path: string): ResponseValueType | undefined {
    if (!path) return type.kind === 'array' ? undefined : type;
    let selected = type;
    for (const segment of path.split('.')) {
        const property = memberType(selected, segment);
        if (!property) return undefined;
        selected = { ...property, nullable: selected.nullable || property.nullable };
    }
    return selected;
}

function objectAssignable(source: Extract<ResponseValueType, { kind: 'object' }>, target: ResponseValueType): boolean {
    if (target.kind !== 'object') return false;
    return Object.entries(target.properties).every(([name, type]) => Object.hasOwn(source.properties, name) && responseTypeAssignable(source.properties[name], type));
}

export function responseTypeAssignable(source: ResponseValueType, target: ResponseValueType): boolean {
    if (source.nullable && !target.nullable) return false;
    if (source.kind !== target.kind) return false;
    if (source.kind === 'object') return objectAssignable(source, target);
    if (source.kind === 'array' && target.kind === 'array') return responseTypeAssignable(source.item, target.item);
    return true;
}

function expectedCategory(type: ResponseValueType, expected?: PropertyValueType): boolean {
    if (expected === undefined || expected === PropertyValueType.Json) return true;
    if (expected === PropertyValueType.Collection) return type.kind === 'array';
    if ([PropertyValueType.String, PropertyValueType.Enum, PropertyValueType.Icon, PropertyValueType.Destination, PropertyValueType.QueryReference].includes(expected)) return type.kind === 'string' || type.kind === 'object';
    return type.kind === expected;
}

function compatibleOperand(binding: BindingExpression, response: ResponseContract | undefined, target: ResponseValueType | undefined): boolean {
    if (binding.mode === BindingMode.TwoWay) return false;
    if (response?.kind !== 'value' || !target) return false;
    const source = projectResponseType(response.type, binding.path);
    if (!source) return false;
    return responseTypeAssignable(source, target) && expectedCategory(source, binding.expectedValueType);
}

export function validateResponseAction(action: InteractionAction, response: ResponseContract | undefined, contracts?: ResponseValidationContracts): BindingDiagnostic[] {
    return responseOperands(action).flatMap(({ binding, operand }) => compatibleOperand(binding, response, contracts?.targetType(action, operand)) ? [] : [{ code: 'invalidResponseBinding', message: 'Command response binding requires an available, compatible source and destination.', path: binding.path }]);
}

export function validateResponseBindings(entry: ResponseValidationEntry, contracts: ResponseValidationContracts): BindingDiagnostic[] {
    const diagnostics: BindingDiagnostic[] = [];
    const visit = (actions: InteractionAction[], response?: ResponseContract) => {
        for (const action of actions) {
            diagnostics.push(...validateResponseAction(action, response, contracts));
            const success = action.kind === InteractionActionKind.ExecuteCommand ? contracts.commandResponse((action as ExecuteCommandAction).command) : response;
            visit(action.onSuccess ?? [], success);
            visit(action.onFailure ?? [], action.kind === InteractionActionKind.ExecuteCommand ? undefined : response);
            visit(action.onResult ?? [], response);
        }
    };
    visit(entry.kind === 'form' ? entry.onSubmit : entry.actions, entry.kind === 'form' ? contracts.commandResponse(entry.command) : undefined);
    return diagnostics;
}

function objectValueMatches(value: unknown, type: Extract<ResponseValueType, { kind: 'object' }>): boolean {
    if (typeof value !== 'object') return false;
    if (value === null || Array.isArray(value)) return false;
    return Object.entries(type.properties).every(([name, property]) => Object.hasOwn(value, name) && responseValueMatches((value as Record<string, unknown>)[name], property));
}

export function responseValueMatches(value: unknown, type: ResponseValueType): boolean {
    if (value === null) return type.nullable === true;
    if (type.kind === 'object') return objectValueMatches(value, type);
    if (type.kind === 'array') return Array.isArray(value) && value.every(item => responseValueMatches(item, type.item));
    if (type.kind === 'number') return typeof value === 'number' && Number.isFinite(value);
    return typeof value === type.kind;
}
