// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingMode, BindingSourceKind, ExecuteCommandAction, InteractionAction, InteractionActionKind, PropertyValueType, SetStateAction } from '@cratis/scene.model';
import { BindingDiagnostic } from './BindingDiagnostic';
import { ResponseContract, ResponseOperand, ResponseValidationContracts, ResponseValidationEntry, ResponseValueType } from './ResponseValidationContracts';
import { projectResponseType, responseTypeAssignable } from './responseValueTypes';
export { projectResponseType, responseTypeAssignable, responseValueMatches } from './responseValueTypes';

const expectedCategories: Partial<Record<PropertyValueType, ResponseValueType['kind'][]>> = {
    [PropertyValueType.Json]: ['string', 'number', 'boolean', 'object', 'array'],
    [PropertyValueType.Collection]: ['array'],
    [PropertyValueType.String]: ['string', 'object'],
    [PropertyValueType.Enum]: ['string', 'object'],
    [PropertyValueType.Icon]: ['string', 'object'],
    [PropertyValueType.Destination]: ['string', 'object'],
    [PropertyValueType.QueryReference]: ['string', 'object'],
    [PropertyValueType.Number]: ['number'],
    [PropertyValueType.Boolean]: ['boolean'],
};

function messageBinding(action: InteractionAction): BindingExpression | undefined {
    if (!('message' in action)) return undefined;
    return (action.message as { binding?: BindingExpression } | undefined)?.binding;
}

export function responseOperands(action: InteractionAction): { binding: BindingExpression; operand: ResponseOperand }[] {
    const operands: { binding: BindingExpression; operand: ResponseOperand }[] = (action.arguments ?? []).map(argument => ({ binding: argument.value, operand: { kind: 'argument', name: argument.name } }));
    if (action.kind === InteractionActionKind.SetState) operands.push({ binding: (action as SetStateAction).value, operand: { kind: 'stateValue' } });
    const message = messageBinding(action);
    if (message) operands.push({ binding: message, operand: { kind: 'message' } });
    return operands.filter(operand => operand.binding.kind === BindingSourceKind.CommandResponse);
}

function expectedCategory(type: ResponseValueType, expected?: PropertyValueType): boolean {
    if (expected === undefined) return true;
    return expectedCategories[expected]?.includes(type.kind) ?? false;
}

function responseType(response?: ResponseContract): ResponseValueType | undefined {
    return response?.kind === 'value' ? response.type : undefined;
}

function compatibleProjection(binding: BindingExpression, type: ResponseValueType, target: ResponseValueType): boolean {
    const source = projectResponseType(type, binding.path);
    if (!source) return false;
    return responseTypeAssignable(source, target) && expectedCategory(source, binding.expectedValueType);
}

function compatibleOperand(binding: BindingExpression, response: ResponseContract | undefined, target: ResponseValueType | undefined): boolean {
    if (binding.mode === BindingMode.TwoWay) return false;
    if (!target) return false;
    const type = responseType(response);
    if (!type) return false;
    return compatibleProjection(binding, type, target);
}

export function validateResponseAction(action: InteractionAction, response: ResponseContract | undefined, contracts?: ResponseValidationContracts): BindingDiagnostic[] {
    return responseOperands(action).flatMap(({ binding, operand }) => compatibleOperand(binding, response, contracts?.targetType(action, operand)) ? [] : [{ code: 'invalidResponseBinding', message: 'Command response binding requires an available, compatible source and destination.', path: binding.path }]);
}

function successResponse(action: InteractionAction, enclosing: ResponseContract | undefined, contracts: ResponseValidationContracts): ResponseContract | undefined {
    return action.kind === InteractionActionKind.ExecuteCommand ? contracts.commandResponse((action as ExecuteCommandAction).command) : enclosing;
}

function failureResponse(action: InteractionAction, enclosing?: ResponseContract): ResponseContract | undefined {
    return action.kind === InteractionActionKind.ExecuteCommand ? undefined : enclosing;
}

function continuation(actions?: InteractionAction[]): InteractionAction[] {
    return actions ?? [];
}

function visit(actions: InteractionAction[], response: ResponseContract | undefined, contracts: ResponseValidationContracts, diagnostics: BindingDiagnostic[]) {
    for (const action of actions) {
        diagnostics.push(...validateResponseAction(action, response, contracts));
        visit(continuation(action.onSuccess), successResponse(action, response, contracts), contracts, diagnostics);
        visit(continuation(action.onFailure), failureResponse(action, response), contracts, diagnostics);
        visit(continuation(action.onResult), response, contracts, diagnostics);
    }
}

function entryResponse(entry: ResponseValidationEntry, contracts: ResponseValidationContracts): ResponseContract | undefined {
    return entry.kind === 'form' ? contracts.commandResponse(entry.command) : undefined;
}

export function validateResponseBindings(entry: ResponseValidationEntry, contracts: ResponseValidationContracts): BindingDiagnostic[] {
    const diagnostics: BindingDiagnostic[] = [];
    const actions = entry.kind === 'form' ? entry.onSubmit : entry.actions;
    visit(actions, entryResponse(entry, contracts), contracts, diagnostics);
    return diagnostics;
}
