// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.


import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { FoundationIcon } from './FoundationIcon';
import { readFoundationStrings } from './foundationStrings';
import { useUrlState } from './urlState';

/**
 * The `globalSearch` component: a search box for the topbar or a list's toolbar.
 *
 * It is a `search` landmark, named by its label so several on one page stay distinguishable, around a labelled field; the text is the `value` output and, with `urlKey`, is kept in the address so a search is
 * a shareable link. Pressing Escape clears it. The placeholder and the accessible name come from `placeholder` and `label`, and from the
 * strings table when absent, so nothing is hard-coded.
 */
export function GlobalSearch({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const strings = readFoundationStrings(element);
    const [text, setText] = useUrlState(readOptionalString(element, 'urlKey'), readOptionalString(element, 'text'));
    const label = readOptionalString(element, 'label') ?? strings.searchLabel;

    useValueOutput(bindingOutputs, text ?? '');

    return (
        <form role='search' aria-label={label} className='foundation foundation-search' data-scene-id={element.id} onSubmit={event => { event.preventDefault(); interactions?.onChange?.(); }}>
            <FoundationIcon name='filter' />
            <input type='search' aria-label={label} placeholder={readOptionalString(element, 'placeholder') ?? strings.searchPlaceholder} value={text ?? ''}
                onChange={event => { setText(event.target.value); interactions?.onChange?.(); }}
                onKeyDown={event => { if (event.key === 'Escape' && (text ?? '').length > 0) { event.preventDefault(); setText(undefined); } }} />
        </form>
    );
}
