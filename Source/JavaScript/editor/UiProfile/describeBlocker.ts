// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProfileBlocker } from './ProfileBlocker';
import { UiProfileStrings } from './UiProfileStrings';
import { formatMessage } from './formatMessage';

/**
 * The sentence a blocker shows - what is wrong and what to do about it.
 *
 * @param blocker The blocker.
 * @param strings The host's labels.
 * @returns The localized sentence.
 */
export function describeBlocker(blocker: ProfileBlocker, strings: UiProfileStrings): string {
    return formatMessage(strings.blockers[blocker.kind], { subject: blocker.subject, detail: blocker.detail, found: blocker.found });
}
