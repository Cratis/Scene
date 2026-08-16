// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HTMLAttributes, RefObject, useEffect, useState } from 'react';
import { Button } from 'primereact/button';

/**
 * Configuration for {@link ScrollTop}.
 */
export interface ScrollTopProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
    /**
     * How far the target has to have scrolled, in pixels, before the button appears. A button that is
     * always there is clutter; one that appears too late is never found.
     */
    threshold?: number;

    /**
     * The element to watch and return to the top of. Left out, the button watches the window - which is
     * the right default for a page, and the wrong one for a component embedded in a composed screen,
     * which is why the caller supplies it.
     */
    target?: RefObject<HTMLElement | null>;

    /**
     * The icon class to show, so an application using its own icon font is not forced onto `primeicons`.
     */
    icon?: string;
}

/**
 * A button that appears once its target has been scrolled past a threshold and takes the reader back to
 * the top.
 *
 * Cratis owns this component. PrimeReact 10 had `ScrollTop`; PrimeReact 11 removed it with no replacement
 * and no headless hook, and `scrollTop` is a name this package's manifest publishes, so screens are
 * written against it. The button itself is a PrimeReact `Button` - the piece that survived - so the
 * component still picks up whatever theme the application is running, and only the scroll watching is
 * ours.
 *
 * The listener is registered on the target and removed when the component unmounts or the target changes.
 * That is not incidental tidiness: this button is typically mounted inside a scrolling region that a
 * screen creates and destroys as the reader navigates, and a leaked `scroll` handler on a detached
 * element keeps the whole subtree alive.
 *
 * What it deliberately does not carry over from v10: the enter/leave transition (the button appears and
 * disappears outright), `behavior` as a prop - scrolling is always smooth, since an instant jump to the
 * top is disorienting and the only reason v10 exposed it was browsers that lacked support - and the
 * `pt` / passthrough styling hooks, which have no meaning outside PrimeReact's own component base.
 */
export function ScrollTop({ threshold = 400, target, icon = 'pi pi-chevron-up', className, ...rest }: ScrollTopProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = target?.current;
        const source: EventTarget = element ?? window;
        const update = () => setVisible((element ? element.scrollTop : window.scrollY) > threshold);

        update();
        source.addEventListener('scroll', update, { passive: true });
        return () => source.removeEventListener('scroll', update);
    }, [target, threshold]);

    if (!visible) return null;

    const scrollToTop = () => {
        const element = target?.current;
        if (element) element.scrollTo({ top: 0, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Button
            aria-label='Scroll to top'
            {...rest}
            rounded
            className={[target === undefined ? 'fixed bottom-6 right-6 z-40' : 'absolute bottom-3 right-3 z-10', className].filter(Boolean).join(' ')}
            onClick={scrollToTop}>
            <i className={icon} aria-hidden='true' />
        </Button>
    );
}
