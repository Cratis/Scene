// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Contribution } from '@cratis/scene.model';
import { aggregateContributions } from '../index';

function contribution(contributionPointName: string, id: string, order?: number): Contribution {
    return { contributionPointName, content: { id, properties: {} }, order };
}

describe('when aggregating by contribution point', () => {
    it('should exclude contributions targeting a different contribution point', () => {
        const result = aggregateContributions([contribution('Navigation', 'a'), contribution('Toolbar', 'b')], 'Navigation');
        result.map(item => item.content.id).should.deep.equal(['a']);
    });

    it('should sort ordered contributions ascending by order', () => {
        const result = aggregateContributions([contribution('Navigation', 'second', 20), contribution('Navigation', 'first', 10)], 'Navigation');
        result.map(item => item.content.id).should.deep.equal(['first', 'second']);
    });

    it('should sort unordered contributions after every ordered one', () => {
        const result = aggregateContributions([contribution('Navigation', 'unordered'), contribution('Navigation', 'ordered', 10)], 'Navigation');
        result.map(item => item.content.id).should.deep.equal(['ordered', 'unordered']);
    });

    it('should preserve original relative order among unordered contributions', () => {
        const result = aggregateContributions([contribution('Navigation', 'first'), contribution('Navigation', 'second')], 'Navigation');
        result.map(item => item.content.id).should.deep.equal(['first', 'second']);
    });
});
