// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { initialsOf, readPeople, visiblePeople } from './avatarModel';
import { ComponentState, readComponentState } from './ComponentState';
import { formatText, readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';

/**
 * The `avatarStack` component: overlapping avatars for the people on a record, with a "+N" chip for the rest.
 *
 * `people` are names with an optional picture; without one the avatar shows the person's initials. The stack is a labelled group ("5 people"),
 * each avatar is an image named after its person, and the overflow chip says how many more in words. `max` is how many are shown (4 by
 * default) and `size` is `small` or `medium`.
 */
export function AvatarStack({ element, interactions }: RegisteredComponentProps) {
    const people = useMemo(() => readPeople(element.properties.people), [element.properties.people]);
    const strings = readFoundationStrings(element);
    const { shown, hidden } = visiblePeople(people, typeof element.properties.max === 'number' ? element.properties.max : 4);
    const state = readComponentState(element, people.length > 0);
    const size = element.properties.size === 'small' ? 'small' : 'medium';

    return (
        <FoundationFrame element={element} interactions={interactions} name='avatar-stack' state={state} skeleton={[35]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && (
                <ul className='foundation-avatars' role='group' aria-label={formatText(strings.avatarPeople, { count: people.length })} data-size={size}>
                    {shown.map(person => (
                        <li key={person.name} className='foundation-avatar' role='img' aria-label={person.name} title={person.name}>
                            {person.imageUrl ? <img src={person.imageUrl} alt='' /> : <span aria-hidden='true'>{initialsOf(person.name)}</span>}
                        </li>
                    ))}
                    {hidden > 0 && (
                        <li className='foundation-avatar foundation-avatar-more' role='img' aria-label={formatText(strings.avatarOverflow, { count: hidden })}>
                            <span aria-hidden='true'>+{hidden}</span>
                        </li>
                    )}
                </ul>
            )}
        </FoundationFrame>
    );
}
