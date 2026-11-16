// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PrimeReactContext, usePrimeReact } from '@primereact/core';
import { PrimeReactContext as PrimeReactConfigContext } from '@primereact/core/config';
import { ScreenEditorPrimeReactProvider } from '../ScreenEditorPrimeReactProvider';

const observe = (wrap: (child: ReturnType<typeof createElement>) => ReturnType<typeof createElement>) => {
    let seen: ReturnType<typeof usePrimeReact> | undefined;
    const probe = () => { seen = usePrimeReact(); return null; };
    renderToStaticMarkup(wrap(createElement(probe)));
    return seen!;
};

describe('when providing primereact to the editor', () => {
    it('should be the one context PrimeReact components read, whichever entry names it', () => (PrimeReactContext === PrimeReactConfigContext).should.be.true);
    it('should give the components below it a PrimeReact context', () => (observe(child => createElement(ScreenEditorPrimeReactProvider, null, child)).config !== undefined).should.be.true);
    it('should hand on what the host configured rather than dropping it', () => {
        const seen = observe(child => createElement(ScreenEditorPrimeReactProvider, { ripple: true, unstyled: true, zIndex: { modal: 4242 } }, child));
        [seen.config.ripple, seen.config.unstyled, seen.config.zIndex?.modal].should.deep.equal([true, true, 4242]);
    });
    it('should leave a component without any provider failing loudly, not guessing a context', () => {
        (() => observe(child => child)).should.throw('PrimeReactProvider not found');
    });
});
