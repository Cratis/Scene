// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { timeMachineVersions } from '../timeMachineVersions';

describe('when reading versions', () => {
    describe('and every entry is complete', () => {
        const versions = timeMachineVersions({
            versions: [
                { id: 'v1', label: 'Registered', timestamp: '2026-01-05T10:00:00.000Z', content: 'First' },
                { id: 'v2', label: 'Approved', timestamp: 1767700800000, content: 'Second' },
            ],
        });

        it('should read every version', () => versions.should.have.lengthOf(2));
        it('should read an ISO timestamp', () => versions[0].timestamp.toISOString().should.equal('2026-01-05T10:00:00.000Z'));
        it('should read an epoch timestamp', () => versions[1].timestamp.getTime().should.equal(1767700800000));
        it('should read the content as text', () => versions[0].content!.should.equal('First'));
    });

    describe('and an entry is incomplete or unparseable', () => {
        const versions = timeMachineVersions({
            versions: [
                { id: 'v1', label: 'Registered', timestamp: '2026-01-05T10:00:00.000Z' },
                { label: 'No id', timestamp: '2026-01-05T10:00:00.000Z' },
                { id: 'v3', timestamp: '2026-01-05T10:00:00.000Z' },
                { id: 'v4', label: 'No timestamp' },
                { id: 'v5', label: 'Unparseable', timestamp: 'the fifth of January' },
            ],
        });

        it('should keep only the entries that can be placed on a timeline', () => versions.map(version => version.id).should.deep.equal(['v1']));
        it('should default missing content to empty text', () => versions[0].content!.should.equal(''));
    });

    describe('and no versions property is set', () => {
        it('should read no versions', () => timeMachineVersions({}).should.deep.equal([]));
    });
});
