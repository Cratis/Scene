// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression, BindingSourceKind } from '@cratis/scene.model';
import type { InteractionContext } from './runActions';
import { ResponseContract, ResponseValueType } from './ResponseValidationContracts';
import { projectResponseType, responseValueMatches } from './validateResponseBindings';

export class ResponseBindingUnavailable extends Error {}

function readMember(value: unknown, segment: string): unknown {
    if (typeof value !== 'object' || Array.isArray(value)) throw new ResponseBindingUnavailable('The command response member is missing.');
    if (!Object.hasOwn(value, segment)) throw new ResponseBindingUnavailable('The command response member is missing.');
    return (value as Record<string, unknown>)[segment];
}

function responseType(contract: ResponseContract | undefined, binding: BindingExpression) {
    if (contract?.kind !== 'value') throw new ResponseBindingUnavailable('The command response is unavailable.');
    const type = projectResponseType(contract.type, binding.path);
    if (!type) throw new ResponseBindingUnavailable('The command response is unavailable.');
    return { root: contract.type, projected: type };
}

function readResponsePath(value: unknown, type: ResponseValueType, segments: string[]): unknown {
    if (value === null) {
        if (!type.nullable) throw new ResponseBindingUnavailable('The command response value is incompatible.');
        return null;
    }
    if (!segments.length) return value;
    const [segment, ...remaining] = segments;
    if (type.kind !== 'object' || !Object.hasOwn(type.properties, segment)) throw new ResponseBindingUnavailable('The command response member is missing.');
    return readResponsePath(readMember(value, segment), type.properties[segment], remaining);
}

function presentResponse(value: unknown): unknown {
    if (value === undefined) throw new ResponseBindingUnavailable('The command response is unavailable.');
    if (value === null) throw new ResponseBindingUnavailable('The command response is unavailable.');
    return value;
}

function resolveResponse(contract: ResponseContract | undefined, value: unknown, binding: BindingExpression): unknown {
    const { root, projected } = responseType(contract, binding);
    const present = presentResponse(value);
    const selected = readResponsePath(present, root, binding.path ? binding.path.split('.') : []);
    if (!responseValueMatches(selected, projected)) throw new ResponseBindingUnavailable('The command response value is incompatible.');
    return selected;
}

export function commandResponseContext(context: InteractionContext, command: string, value: unknown, available = true): InteractionContext {
    const responseContract = available ? context.responseContracts?.commandResponse(command) : undefined;
    return {
        ...context,
        responseContract,
        resolve: binding => binding.kind === BindingSourceKind.CommandResponse ? resolveResponse(responseContract, value, binding) : context.resolve(binding),
    };
}
