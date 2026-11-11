// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateSlotShape } from '../index';

// The C# twin writes 'null' where TypeScript writes 'undefined' for a missing id: Cratis/Scene#299.
describe('when validating elements without an id', () => {
    const messages = validateSlotShape({
        slotContent: {
            main: [
                { componentName: 'x:action', properties: { opens: 'nope' } },
                { kind: 'button', display: 'bad' },
                { componentName: 'core:action', properties: { presentation: 'modal' } },
            ],
        },
    }).map(diagnostic => diagnostic.message.split(';')[0].split('. Scene 5')[0]);

    it('should name the missing id as undefined', () => messages.should.deep.equal([
        "The action 'undefined' opens 'nope'",
        "The button 'undefined' shows 'bad'",
        "The action 'undefined' stores a presentation",
    ]));
});
