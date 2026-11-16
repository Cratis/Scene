// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { buttonForms } from '../primeReactAnatomy';
import { booleanProperty, severityProperty, stringProperty } from '../properties';
import { ButtonLook } from './ButtonLook';
import { PrimeButtonForm } from './PrimeButtonForm';

/**
 * Reads how a Button looks off a Scene element.
 *
 * The `severity` property is the one a design system's Button variants choose by (`primeReactAnatomy`): its value is a severity
 * (`secondary`, `danger`, ...), `primary` for PrimeReact's default, or a form (`outlined`, `text`, `link`), because a design system names
 * all of them in one list of variants. PrimeReact keeps the two apart - severity is a prop, the form is its `variant` - so they are told
 * apart here. The `outlined`, `text` and `link` flags a screen can also set still combine with a severity (an outlined danger button),
 * and when both ways name a form the one in `severity` wins.
 *
 * @param element The element whose properties to read.
 * @returns The severity and the form.
 */
export function readButtonLook(element: SceneElement): ButtonLook {
    const authored = stringProperty(element, 'severity');
    const asForm = buttonForms.find(form => form === authored) as PrimeButtonForm | undefined;
    const severity = asForm === undefined ? severityProperty(element, 'severity') : undefined;

    let variant = asForm;
    if (variant === undefined) {
        if (booleanProperty(element, 'outlined', false)) variant = 'outlined';
        else if (booleanProperty(element, 'text', false)) variant = 'text';
        else if (booleanProperty(element, 'link', false)) variant = 'link';
    }

    return { ...(severity === undefined ? {} : { severity }), ...(variant === undefined ? {} : { variant }) };
}
