// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Fragment } from 'react';
import { Breadcrumb as PrimeBreadcrumb } from 'primereact/breadcrumb';
import { RegisteredComponentProps, useOptionalSceneNavigation, useSceneNavigationModel } from '@cratis/scene.react';
import { MenuEntry } from './MenuEntry';
import { readBoolean, readOptionalString, readRecords, recordString } from './elementProperties';
import { locationTrail } from './locationTrail';
import { useShellLink } from './useShellLink';

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
 *
 * Inside a navigation host the crumbs navigate through the host (they swap the primary region, never the address of the page that
 * hosts the application), and a trail the element does not author - no `items` - is derived from where the host is (spec N4):
 * the module and features down to the screen on the page, from the host's navigation model.
 */
export function Breadcrumb({ element }: RegisteredComponentProps) {
    const home = readOptionalString(element, 'homeTargetScreen');
    const navigation = useOptionalSceneNavigation();
    const model = useSceneNavigationModel();
    const authored = readRecords(element, 'items');
    const derive = authored.length === 0 && readBoolean(element, 'followLocation', true) && navigation !== undefined && model !== undefined;
    const trail = derive
        ? locationTrail(model, navigation.primaryScreen).map((crumb): MenuEntry & { screen?: string } => ({ label: crumb.label, screen: crumb.targetScreen }))
        : authored.map((item): MenuEntry & { screen?: string } => ({ label: recordString(item, 'label'), screen: recordString(item, 'targetScreen') || undefined }));

    return (
        <div data-scene-id={element.id}>
            <PrimeBreadcrumb.Root>
                <PrimeBreadcrumb.List>
                    {home && (
                        <PrimeBreadcrumb.Item>
                            <Crumb id={`${element.id}-home`} screen={home} label='Home' ariaLabel='Home'>
                                <i className='pi pi-home' aria-hidden='true' />
                            </Crumb>
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
                                {entry.screen ? (
                                    <Crumb id={`${element.id}-${index}`} screen={entry.screen} label={entry.label}>
                                        {entry.label}
                                    </Crumb>
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

function Crumb({ id, screen, label, ariaLabel, children }: { id: string; screen: string; label: string; ariaLabel?: string; children: React.ReactNode }) {
    const link = useShellLink(screen, { source: 'breadcrumb', id, label });
    return (
        <PrimeBreadcrumb.Link as='a' href={link.href ?? `#/${screen}`} aria-label={ariaLabel} onClick={link.onClick} data-nav-problem={link.dead ? 'navTargetMissing' : undefined}>
            {children}
        </PrimeBreadcrumb.Link>
    );
}
