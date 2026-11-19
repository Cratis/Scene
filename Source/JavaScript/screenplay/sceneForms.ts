// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { FormSyntax } from './Syntax/ScreenplaySyntax';
import type { JsonObject, JsonValue } from './json';
import { optional } from './sceneValues';

// The import half of SceneForms: a Screenplay form of a module as the form a Scene screen hosts. The fields and
// what fills them travel; a form's own layout, choices and behaviors are not modeled by Screenplay's TypeScript
// compiler, so they are not written here and the screen reports them.
export const formToJson = (form: FormSyntax): JsonObject => ({
    name: form.name,
    forCommand: form.for,
    fields: form.fields.map(fieldToJson),
});

const fieldToJson = (field: FormSyntax['fields'][number]): JsonValue => {
    const json: JsonObject = { name: field.property };
    optional(json, 'sourceProperty', field.from);
    optional(json, 'composeUsing', field.composeUsing);
    optional(json, 'label', field.label);
    return json;
};
