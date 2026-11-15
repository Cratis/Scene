// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignSystemEditorStrings } from '../../defaultDesignSystemEditorStrings';
import type { DesignSystemConflictEntry } from '../DesignSystemConflict';
import { isDecided, kindLabel, placesToChange, undecidedCount, usageOf } from '../conflicts';

const strings = defaultDesignSystemEditorStrings.conflicts;

const entry = (chosen: string): DesignSystemConflictEntry => ({
    version: 2,
    chosen,
    decidedBy: chosen === '' ? '' : 'ada',
    issueRaised: false,
    conflict: {
        id: 'grey',
        kind: 'color',
        title: 'Two greys for borders',
        options: [
            { value: '#ccc', count: 12, places: [{ source: 'repo: src/index.css', count: 7 }, { source: 'repo: tailwind.config.js', count: 5 }] },
            { value: '#cdcdcd', count: 1, places: [] },
        ],
    },
});

describe('when reading conflicts', () => {
    it('should call a conflict decided once a value is kept', () => isDecided(entry('#ccc')).should.be.true);
    it('should call a conflict undecided until then', () => isDecided(entry('')).should.be.false);
    it('should say how often and where a value is used', () => usageOf(entry('').conflict.options[0], strings).should.equal('12 times - repo: src/index.css (7), repo: tailwind.config.js (5)'));
    it('should say it once for a value used once', () => usageOf(entry('').conflict.options[1], strings).should.equal('1 time'));
    it('should count the places that still use a value given up', () => placesToChange(entry('#ccc')).should.equal(1));
    it('should count the other way when the other value is kept', () => placesToChange(entry('#cdcdcd')).should.equal(12));
    it('should count no places to change before a decision', () => placesToChange(entry('')).should.equal(0));
    it('should name a color conflict', () => kindLabel('color', strings).should.equal('Color'));
    it('should name a corner conflict', () => kindLabel('corner', strings).should.equal('Corner'));
    it('should count the conflicts that wait', () => undecidedCount([entry(''), entry('#ccc'), entry('')]).should.equal(2));
});
