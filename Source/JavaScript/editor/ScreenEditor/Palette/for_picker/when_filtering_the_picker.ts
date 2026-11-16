// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { buildPickerView, frequentGroupId, highlightParts, visibleRows, type PickerEntry } from '../componentPickerModel';

const entry = (key: string, label: string, category: string, keywords: string[] = [], badge = label.slice(0, 2)): PickerEntry =>
    ({ key, label, badge, category, keywords, payload: { kind: 'component', componentName: key, package: 'P' } });

// The spec's own example (screenshot p19): "ta" finds Data table, Tabs, Timeline (via the keyword "table") and Tag input.
const entries = [
    entry('button', 'Button', 'Actions'),
    entry('dataTable', 'Data table', 'Data display', ['grid']),
    entry('list', 'List', 'Data display'),
    entry('timeline', 'Timeline', 'Data display', ['history', 'table']),
    entry('tabs', 'Tabs', 'Navigation'),
    entry('topbar', 'Topbar', 'Navigation'),
    entry('tagInput', 'Tag input', 'Input'),
    entry('mystery', 'Mystery', 'Other'),
];
const view = (query: string, usage = {}, groups = {}) => buildPickerView({ entries, usage, query, groups, frequentTitle: 'Frequently used' });
const used = { dataTable: { count: 5, last: 2 }, button: { count: 9, last: 1 } };

describe('when the picker has no filter', () => {
    const groups = view('', used);

    it('should list Frequently used first, then the categories in the model\'s order, unknown ones last', () =>
        groups.map(group => group.title).should.deep.equal(['Frequently used', 'Navigation', 'Data display', 'Input', 'Actions', 'Other']));
    it('should put the most used first, with the count of what it lists', () => {
        groups[0].rows.map(row => row.entry.key).should.deep.equal(['button', 'dataTable']);
        groups[0].count.should.equal(2);
    });
    it('should count each category', () => groups.find(group => group.id === 'Data display')!.count.should.equal(3));
    it('should open Frequently used and close every category, until the author says otherwise', () => groups.map(group => group.expanded).should.deep.equal([true, false, false, false, false, false]));
    it('should hide Frequently used when nothing was used', () => view('').map(group => group.id).should.not.include(frequentGroupId));
    it('should open the first category when Frequently used is hidden', () => view('')[0].expanded.should.be.true);
    it('should keep the author\'s open and closed groups', () => {
        const chosen = view('', used, { 'Data display': true, [frequentGroupId]: false });
        chosen.find(group => group.id === 'Data display')!.expanded.should.be.true;
        chosen[0].expanded.should.be.false;
    });
});

describe('when the picker is filtered with "ta"', () => {
    const groups = view('ta', used);

    it('should list only what matches, in groups, hiding those with none', () => groups.map(group => group.title).should.deep.equal(['Frequently used', 'Navigation', 'Data display', 'Input']));
    it('should find Data table, Tabs, Timeline and Tag input', () => groups.slice(1).flatMap(group => group.rows.map(row => row.entry.label)).should.deep.equal(['Tabs', 'Data table', 'Timeline', 'Tag input']));
    it('should show the used components that match under Frequently used', () => groups[0].rows.map(row => row.entry.key).should.deep.equal(['dataTable']));
    it('should highlight what matched in the name', () => groups[1].rows[0].match.ranges.should.deep.equal([[0, 2]]));
    it('should say a component came in through a keyword, and which', () => {
        const timeline = groups.find(group => group.id === 'Data display')!.rows.find(row => row.entry.key === 'timeline')!;
        timeline.match.via!.should.equal('keyword');
        timeline.match.keyword!.should.equal('table');
    });
    it('should expand every group that matches, whatever the author had closed', () => groups.every(group => group.expanded).should.be.true);
    it('should count what matches, not what the group holds', () => groups.find(group => group.id === 'Data display')!.count.should.equal(2));
    it('should leave the author\'s groups alone, so they are back when the filter clears', () => view('', used, { 'Data display': false })[2].expanded.should.be.false);
    it('should offer nothing for what matches nothing', () => view('zzz').should.deep.equal([]));
});

describe('when reading the rows to reach with the keyboard', () => {
    it('should list the rows of the open groups, in the order they are drawn', () =>
        visibleRows(view('', used, { Navigation: true })).map(({ row }) => row.entry.key).should.deep.equal(['button', 'dataTable', 'tabs', 'topbar']));
    it('should list nothing of a group that is closed', () => visibleRows(view('', used)).map(({ row }) => row.entry.key).should.deep.equal(['button', 'dataTable']));
});

describe('when highlighting a name', () => {
    it('should split it around the ranges', () => highlightParts('Data table', [[2, 4], [5, 7]]).should.deep.equal([
        { text: 'Da', marked: false }, { text: 'ta', marked: true }, { text: ' ', marked: false }, { text: 'ta', marked: true }, { text: 'ble', marked: false },
    ]));
    it('should leave a name nothing matched whole', () => highlightParts('Button', []).should.deep.equal([{ text: 'Button', marked: false }]));
});
