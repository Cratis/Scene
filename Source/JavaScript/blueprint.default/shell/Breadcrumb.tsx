// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Fragment } from 'react';
import { Breadcrumb as PrimeBreadcrumb } from 'primereact/breadcrumb';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { MenuEntry } from './MenuEntry';
import { readOptionalString, readRecords, recordString } from './elementProperties';

/**
 * The trail above the content.
 *
 * PrimeReact's own `Breadcrumb` does the rendering rather than hand-written markup, because a breadcrumb
 * is an ordinary component with no layout-mode behavior at all - it looks the same in every one of the
 * eight modes. The shell only writes CSS where PrimeReact genuinely has no answer, and this is not one of
 * those places: `Breadcrumb.Root` still supplies the `nav`, its `aria-label` and the list semantics, which
 * is the part that is easy to get wrong by hand.
 *
 * What PrimeReact 11 no longer supplies is the `model` array - the component is composed now, and the
 * `primereact/menuitem` type the array was made of is gone with it, which is why the trail is mapped into
 * this package's own {@link MenuEntry}. The last entry is `Breadcrumb.Current` rather than a link: a trail
 * whose final crumb navigates to the page already open is a link that does nothing, and it takes
 * `aria-current='page'` away from the one element that should carry it.
 */
export function Breadcrumb({ element }: RegisteredComponentProps) {
    const home = readOptionalString(element, 'homeTargetScreen');
    const trail = readRecords(element, 'items').map(
        (item): MenuEntry => ({
            label: recordString(item, 'label'),
            url: recordString(item, 'targetScreen') ? `#/${recordString(item, 'targetScreen')}` : undefined,
        }),
    );

    return (
        <div data-scene-id={element.id}>
            <PrimeBreadcrumb.Root>
                <PrimeBreadcrumb.List>
                    {home && (
                        <PrimeBreadcrumb.Item>
                            <PrimeBreadcrumb.Link as='a' href={`#/${home}`} aria-label='Home'>
                                <i className='pi pi-home' aria-hidden='true' />
                            </PrimeBreadcrumb.Link>
                        </PrimeBreadcrumb.Item>
                    )}
                    {trail.map((entry, index) => (
                        <Fragment key={`${index}-${entry.label}`}>
                            {(!!home || index > 0) && (
                                <PrimeBreadcrumb.Separator>
                                    <i className='pi pi-chevron-right' aria-hidden='true' />
                                </PrimeBreadcrumb.Separator>
                            )}
                            <PrimeBreadcrumb.Item>
                                {entry.url ? (
                                    <PrimeBreadcrumb.Link as='a' href={entry.url}>
                                        {entry.label}
                                    </PrimeBreadcrumb.Link>
                                ) : (
                                    <PrimeBreadcrumb.Current>{entry.label}</PrimeBreadcrumb.Current>
                                )}
                            </PrimeBreadcrumb.Item>
                        </Fragment>
                    ))}
                </PrimeBreadcrumb.List>
            </PrimeBreadcrumb.Root>
        </div>
    );
}
