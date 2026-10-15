// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useContext, useEffect, useId, useRef } from 'react';
import { RegisteredComponentProps, SceneNavigationContextInternal } from '@cratis/scene.react';
import { readOptionalString, readStrings } from '../shell/elementProperties';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { isRightToLeft, readLocale } from './formatting';
import { useCompactWidth } from './useCompactWidth';

/** Where a dialog is drawn: in the middle of the page, as a drawer from the inline end, or filling the page. */
export enum DialogPlacement {
    Center = 'center',
    Side = 'side',
    Full = 'full',
}

/** What a dialog is about: an ordinary one, or one that cannot be undone and is drawn in the danger colors. */
export enum DialogTone {
    Default = 'default',
    Danger = 'danger',
}

const focusable = 'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** Reads the placement property, falling back to the center for anything that is not one of the three. */
export function readDialogPlacement(element: RegisteredComponentProps['element']): DialogPlacement {
    const value = readOptionalString(element, 'placement');
    return value === DialogPlacement.Side || value === DialogPlacement.Full ? value : DialogPlacement.Center;
}

/** The placement a dialog is drawn with in a window of the given width class: a phone gets every dialog at full height and width (spec Part B 2.10, 1.5). */
export const placementFor = (requested: DialogPlacement, compact: boolean): DialogPlacement => (compact ? DialogPlacement.Full : requested);

/** The elements a dialog's focus can rest on, in document order, that are not hidden. */
const focusableIn = (host: HTMLElement): HTMLElement[] => Array.from(host.querySelectorAll<HTMLElement>(focusable)).filter(candidate => !candidate.hidden && candidate.closest('[hidden]') === null);

/**
 * The `dialogFrame` component: the head of a dialog template and everything that makes what the host draws around it behave as a dialog.
 *
 * It draws the heading (`title`, `subtitle`), an optional `message` and `consequences` list - what a confirmation says will happen - and a close button.
 * The host draws the box a dialog template opens in (a `role="dialog" aria-modal="true"` element); this component takes that element on and gives it the
 * parts of a dialog that must not differ from one template to the next:
 *
 * - it is named by the heading, takes focus when it opens (the first field, else the primary action, else the close button), keeps Tab inside it, and
 *   gives focus back to whatever opened it when it goes;
 * - Escape and the close button run the behaviors attached to this element (a `CloseDialog` action), and close the dialog themselves when none is attached;
 * - `placement` is `center` (default), `side` (a drawer from the inline end, which a right-to-left locale mirrors) or `full`; on a phone every dialog fills the page;
 * - `tone` `danger` draws a dialog that cannot be undone in the danger colors.
 *
 * Every text it says comes from the strings table and the locale of the element, so an application localizes it like any foundation component.
 */
export function DialogFrame({ element, interactions }: RegisteredComponentProps) {
    const frame = useRef<HTMLElement>(null);
    const heading = useId();
    const navigation = useContext(SceneNavigationContextInternal);
    const compact = useCompactWidth();
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const title = readOptionalString(element, 'title') ?? '';
    const subtitle = readOptionalString(element, 'subtitle');
    const message = readOptionalString(element, 'message');
    const consequences = readStrings(element, 'consequences');
    const placement = placementFor(readDialogPlacement(element), compact);
    const tone = element.properties.tone === DialogTone.Danger ? DialogTone.Danger : DialogTone.Default;

    const onClick = interactions?.onClick;
    const close = useCallback(() => {
        if (onClick) onClick({ stopPropagation: () => undefined });
        else navigation?.closeDialog();
    }, [onClick, navigation]);
    const closeRef = useRef(close);
    closeRef.current = close;

    useEffect(() => {
        const host = frame.current?.closest<HTMLElement>('[role="dialog"]');
        if (!host) return;

        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
        const before = { className: host.className, labelledBy: host.getAttribute('aria-labelledby'), placement: host.getAttribute('data-placement'), tone: host.getAttribute('data-tone') };
        host.classList.add('foundation', 'foundation-dialog-host');
        host.setAttribute('aria-labelledby', heading);
        host.setAttribute('data-placement', placement);
        host.setAttribute('data-tone', tone);
        host.dir = isRightToLeft(locale) ? 'rtl' : host.dir;

        const closeButton = frame.current?.querySelector<HTMLElement>('.foundation-dialog-close');
        const targets = focusableIn(host);
        (targets.find(target => /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) ?? targets.find(target => target !== closeButton) ?? closeButton)?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeRef.current();
            } else if (event.key === 'Tab') {
                const inside = focusableIn(host);
                if (inside.length === 0) { event.preventDefault(); return; }
                const first = inside[0];
                const last = inside[inside.length - 1];
                if (event.shiftKey && (document.activeElement === first || !host.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && (document.activeElement === last || !host.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
            }
        };

        host.addEventListener('keydown', onKeyDown);
        return () => {
            host.removeEventListener('keydown', onKeyDown);
            host.className = before.className;
            for (const [name, value] of [['aria-labelledby', before.labelledBy], ['data-placement', before.placement], ['data-tone', before.tone]] as const) {
                if (value === null) host.removeAttribute(name);
                else host.setAttribute(name, value);
            }

            if (opener?.isConnected) opener.focus();
        };
    }, [heading, placement, tone, locale]);

    return (
        <header ref={frame} className='foundation foundation-dialog-frame' data-scene-id={element.id} data-placement={placement} data-tone={tone} lang={locale} dir={isRightToLeft(locale) ? 'rtl' : undefined}>
            <div className='foundation-dialog-heading'>
                <div className='foundation-dialog-titles'>
                    <h2 id={heading} className='foundation-dialog-title'>{title}</h2>
                    {subtitle && <p className='foundation-dialog-subtitle'>{subtitle}</p>}
                </div>
                <button type='button' className='foundation-dialog-close' aria-label={formatText(strings.dialogClose, { title })} onClick={close}>
                    <FoundationIcon name='close' />
                </button>
            </div>
            {message && <p className='foundation-dialog-message'>{message}</p>}
            {consequences.length > 0 && (
                <ul className='foundation-dialog-consequences' aria-label={strings.dialogConsequences}>
                    {consequences.map(consequence => <li key={consequence}>{consequence}</li>)}
                </ul>
            )}
        </header>
    );
}
