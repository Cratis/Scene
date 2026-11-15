// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext } from 'react';
import type { EnablementPersona } from '@cratis/scene.engine';

// A persona of the model, as the preview strip offers it: its name and the policies it states.
export interface PreviewPersona {
    name: string;
    policies: readonly string[];
}

// What authorizes the command of a slice: policy names and the `and` / `or` operators between them, in postfix order, as the model stores it.
export type PreviewRequirement = readonly string[];

// The requirement of the commands, by the scene's dotted name of the slice that runs them.
export type PreviewAuthorizations = ReadonlyMap<string, PreviewRequirement>;

// What the outlets of the preview are drawn for: who is looking, and what each slice's command asks of them.
export interface PreviewPersonaScope {
    persona?: EnablementPersona;
    authorizations?: PreviewAuthorizations;
}

export const PreviewPersonaContext = createContext<PreviewPersonaScope>({});

const isOperator = (token: string): boolean => token === 'and' || token === 'or';

// The requirement as one line of text, `(Admin or Editor)`: the single name Scene's `authorize` takes for a requirement of more than one policy.
export const requirementText = (requirement: PreviewRequirement): string => {
    const stack: string[] = [];
    for (const token of requirement) {
        if (!isOperator(token)) { stack.push(token); continue; }
        const right = stack.pop();
        const left = stack.pop();
        if (left === undefined || right === undefined) return requirement.join(' ');
        stack.push(`(${left} ${token} ${right})`);
    }
    return stack.join(' ');
};

// Whether a persona that holds these policies satisfies the requirement. An empty requirement is satisfied by everyone.
export const requirementHolds = (requirement: PreviewRequirement, held: ReadonlySet<string>): boolean => {
    if (requirement.length === 0) return true;
    const stack: boolean[] = [];
    for (const token of requirement) {
        if (!isOperator(token)) { stack.push(held.has(token)); continue; }
        const right = stack.pop();
        const left = stack.pop();
        if (left === undefined || right === undefined) return false;
        stack.push(token === 'and' ? left && right : left || right);
    }
    return stack.length === 1 && stack[0];
};

// The `authorize` of a slice's command, as Scene reads it: the one policy, or the text of the requirement when there are several. Nothing when the command is open to everyone.
export const authorizeOf = (requirement: PreviewRequirement | undefined): string | undefined =>
    requirement === undefined || requirement.length === 0 ? undefined : requirementText(requirement);

// The persona Scene checks hooks against. Scene's `authorize` is one name that the persona either has or has not, so a requirement of several policies is
// one name here too, and the persona is taken to have it when it satisfies the requirement. Studio adds no rule to what hides or disables a hook: it only says
// which of the requirements the persona satisfies, and Scene decides.
export const enablementPersonaOf = (persona: PreviewPersona, authorizations: PreviewAuthorizations): EnablementPersona => {
    const held = new Set(persona.policies);
    const policies = new Set(persona.policies);
    for (const requirement of authorizations.values()) {
        const text = authorizeOf(requirement);
        if (text !== undefined && requirementHolds(requirement, held)) policies.add(text);
    }
    return { name: persona.name, policies: [...policies] };
};
