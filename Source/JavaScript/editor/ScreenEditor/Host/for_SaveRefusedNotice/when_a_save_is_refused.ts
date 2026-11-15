// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import { SaveRefusedNotice } from '../SaveRefusedNotice';

const buttonsIn = (node: ReactNode): ReactElement<{ onClick?: () => void; children?: ReactNode }>[] => {
    if (!isValidElement<{ children?: ReactNode }>(node)) return [];
    const own = node.type === 'button' ? [node as ReactElement<{ onClick?: () => void; children?: ReactNode }>] : [];
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return [...own, ...children.flatMap(child => buttonsIn(child))];
};

const message = 'This screen is not built on the template now selected for it.';

describe('when a save is refused and the person can keep editing or discard', () => {
    let kept = 0;
    let discarded = 0;
    const props = { strings: defaultScreenEditorStrings, message, onKeepEditing: () => kept++, onDiscard: () => discarded++ };
    const markup = renderToStaticMarkup(createElement(SaveRefusedNotice, props));
    const buttons = buttonsIn(SaveRefusedNotice(props));
    buttons.forEach(button => button.props.onClick?.());

    it('should say what is wrong', () => markup.should.contain(message));
    it('should offer to keep editing', () => markup.should.contain(defaultScreenEditorStrings.keepEditing));
    it('should offer to discard the changes and close', () => markup.should.contain(defaultScreenEditorStrings.discardAndClose));
    it('should keep editing when asked to', () => kept.should.equal(1));
    it('should discard and close when asked to', () => discarded.should.equal(1));
});

describe('when a save is refused and the host gives no way out', () => {
    const markup = renderToStaticMarkup(createElement(SaveRefusedNotice, { strings: defaultScreenEditorStrings, message }));

    it('should still say what is wrong', () => markup.should.contain(message));
    it('should draw no buttons', () => markup.should.not.contain('<button'));
});
