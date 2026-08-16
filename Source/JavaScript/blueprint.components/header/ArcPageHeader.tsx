// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { BindingKind, resolveElementBinding } from '@cratis/scene.components';
import { deriveArcHeading } from './deriveArcHeading';

/**
 * The one component this blueprint registers: a page header whose heading, trail and design-time state all
 * follow from a single binding name.
 *
 * Every template in this package opens with one, and every template gives it the same binding its body is
 * built around - `AllInvoices` on the list page, `RecordAdjustment` on the command page. Saying it once is
 * the point. A hand-authored header repeats the page's subject in the title, again in the trail, and a
 * third time in the table below it, and those three copies drift the first time anything is renamed.
 *
 * It also reports whether the binding is registered, which is what makes a design-time preview readable.
 * A page whose body is one dashed placeholder is ambiguous - is the name wrong, or has the host simply not
 * wired anything yet? The header answers that at the top of the page, in words, without opening a debugger.
 *
 * The `layout-page-header` class names are the default blueprint's, not this package's. That is this
 * blueprint's whole posture in one detail: it reuses the shell it depends on rather than shipping a rival
 * one, so a page of Arc-bound content sits inside the default shell looking like it belongs there.
 */
export function ArcPageHeader({ element, slots }: RegisteredComponentProps) {
    const query = resolveElementBinding(element, BindingKind.Query);
    const kind = query.name === undefined ? BindingKind.Command : BindingKind.Query;
    const binding = kind === BindingKind.Query ? query : resolveElementBinding(element, BindingKind.Command);
    const heading = deriveArcHeading(element.properties, binding, kind);

    return (
        <div className='layout-page-header' data-scene-id={element.id} data-scene-binding={heading.bindingName}>
            <div>
                <nav className='layout-page-header-trail' aria-label='Breadcrumb'>
                    {heading.trail.join(' › ')}
                </nav>
                <h1 className='layout-page-header-title'>{heading.title}</h1>
                {heading.subtitle && <p className='layout-page-header-subtitle'>{heading.subtitle}</p>}
                <span data-scene-binding-state={heading.isBound ? 'bound' : 'unbound'}>{heading.bindingLabel}</span>
            </div>
            {(slots.actions?.length ?? 0) > 0 && <div className='layout-page-header-actions'>{slots.actions}</div>}
        </div>
    );
}
