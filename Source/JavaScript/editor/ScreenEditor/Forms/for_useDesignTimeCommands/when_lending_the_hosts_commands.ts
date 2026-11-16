// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import type { ScreenEditorEnvironment } from '../../Host/ScreenEditorHost';
import { useDesignTimeCommands } from '../useDesignTimeCommands';

const slices: readonly StateChangeSlice[] = [{ id: 'order', name: 'Place order', origin: [], inputs: [] }];

const Form = ({ register }: { register?: ScreenEditorEnvironment['registerDesignTimeCommands'] }) => {
    useDesignTimeCommands(slices, register);
    return createElement('form');
};

describe('when the host lends a command registrar', () => {
    let registered: readonly StateChangeSlice[];
    const register = (provided: readonly StateChangeSlice[]) => {
        registered = provided;
        return () => undefined;
    };

    beforeAll(() => renderToStaticMarkup(createElement(Form, { register })));

    it('should register the slices while drawing, before effects run', () => registered.should.equal(slices));
});

describe('when the host lends no command registrar', () => {
    it('should draw without registering commands', () => renderToStaticMarkup(createElement(Form)).should.equal('<form></form>'));
});
