// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { FoundationIcon } from './FoundationIcon';
import { readLocale } from './formatting';
import { StatusTone, readStatusTone, statusToneIcons } from './StatusChip';

/**
 * The `notice` component: one message about the region it sits in - a sign-in error, a warning above a form, a note under a field.
 *
 * It is a live region: a danger or warning notice is an `alert` and any other a `status`, and the region is on the page even while empty, so the
 * message is announced when it arrives rather than only when the page loads. With no `text` nothing is drawn but the empty region, which is what a
 * sign-in screen's error area is until a sign-in fails. `tone` picks the icon and the status colors; the message is always words, never color alone.
 */
export function Notice({ element }: RegisteredComponentProps) {
    const tone = readStatusTone(element.properties.tone ?? StatusTone.Danger);
    const text = readOptionalString(element, 'text') ?? '';
    const title = readOptionalString(element, 'title');
    const urgent = tone === StatusTone.Danger || tone === StatusTone.Warning;

    return (
        <div className='foundation foundation-notice' data-scene-id={element.id} data-tone={tone} data-empty={text === '' || undefined} role={urgent ? 'alert' : 'status'} lang={readLocale(element)}>
            {text !== '' && (
                <>
                    <FoundationIcon name={statusToneIcons[tone]} />
                    <p>{title && <strong>{title} </strong>}{text}</p>
                </>
            )}
        </div>
    );
}
