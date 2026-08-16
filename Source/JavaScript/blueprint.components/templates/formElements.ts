// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { externalComponent } from '@cratis/scene.blueprint.default';
import { CompositeName } from '../CompositeName';

/**
 * The Arc-bound form elements this blueprint's templates are built from.
 *
 * Every field carries a `property` name, which the library turns into an accessor onto the command
 * instance. That indirection is not incidental: a hand-written form binds a field with
 * `value={command => command.number}` and is typechecked against the generated proxy, and a template has
 * no types to check against because it is data. The name is what survives, so the name is what a field
 * carries.
 */

/**
 * A whole form generated from the command's own property descriptors.
 *
 * `commandForm` is `AutoCommandForm`, not `CommandForm`, and that is what makes it worth shipping in a
 * template at all: a template that listed every field by hand would go stale the moment a property was
 * added to the command on the backend, and a stale template is worse than no template. This one follows
 * the command, which is the same guarantee Arc's generated proxies give the rest of the stack.
 *
 * @param exclude Properties the surrounding template places itself, so the generated form does not produce a second copy.
 */
export function commandForm(id: string, command: string, exclude?: string[]): SceneElement {
    return externalComponent(id, CompositeName.CommandForm, { command, exclude });
}

/** A single-line text field bound to one command property. */
export function inputTextField(id: string, property: string, title: string, placeholder?: string): SceneElement {
    return externalComponent(id, CompositeName.InputTextField, { property, title, placeholder });
}

/** A numeric field bound to one command property. */
export function numberField(id: string, property: string, title: string): SceneElement {
    return externalComponent(id, CompositeName.NumberField, { property, title });
}

/** A multi-line text field bound to one command property. */
export function textAreaField(id: string, property: string, title: string, rows = 3): SceneElement {
    return externalComponent(id, CompositeName.TextAreaField, { property, title, rows });
}

/** A date field bound to one command property. */
export function calendarField(id: string, property: string, title: string): SceneElement {
    return externalComponent(id, CompositeName.CalendarField, { property, title });
}

/**
 * A single-selection field over a list the template carries inline.
 *
 * Inline options only. A list that has to come from the backend is a different thing entirely - bind it to
 * a query - because a property bag is the wrong place for data, and a template that embedded a real
 * lookup table would be shipping someone else's reference data.
 */
export function dropdownField(id: string, property: string, title: string, options: { label: string; value: string }[]): SceneElement {
    return externalComponent(id, CompositeName.DropdownField, { property, title, options });
}
