// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InteractionAction } from '@cratis/scene.model';

export type ResponseValueType = (
    { kind: 'string' | 'number' | 'boolean' } |
    { kind: 'object'; properties: Record<string, ResponseValueType> } |
    { kind: 'array'; item: ResponseValueType }
) & { nullable?: boolean };

export type ResponseContract = { kind: 'void' } | { kind: 'value'; type: ResponseValueType };
export type ResponseOperand = { kind: 'argument'; name: string } | { kind: 'stateValue' } | { kind: 'message' };
export interface ResponseValidationContracts {
    commandResponse(command: string): ResponseContract | undefined;
    targetType(action: InteractionAction, operand: ResponseOperand): ResponseValueType | undefined;
}
export type ResponseValidationEntry =
    { kind: 'actions'; actions: InteractionAction[] } |
    { kind: 'form'; command: string; onSubmit: InteractionAction[] };
