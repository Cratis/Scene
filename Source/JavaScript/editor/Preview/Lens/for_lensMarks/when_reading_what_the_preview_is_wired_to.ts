// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describeLensMarks, LensMarkKind, type LensNode } from '../lensMarks';
import { defaultLensStrings } from '../LensStrings';

const node = (attributes: Record<string, string>): LensNode => ({ getAttribute: name => attributes[name] ?? null });

const nodes = [
    node({ 'data-scene-slice': 'Catalog.Products.SetPrice', 'data-scene-opens': 'drawer', 'data-scene-enablement': 'enabled' }),
    node({ 'data-scene-slice': 'Catalog.Products.Withdraw', 'data-scene-opens': 'dialog', 'data-scene-enablement': 'disabled', title: 'Withdraw is for item, so it waits for a row.' }),
    node({ 'data-scene-warning': 'emptySlice' }),
    node({ 'data-preview-query': 'AllProducts' }),
    node({ 'data-scene-query': 'AllProducts', 'data-scene-query-parameter': 'status', 'data-scene-filter-control': 'select' }),
    node({ 'data-scene-id': 'featured' }),
    node({ 'data-scene-id': 'heading' }),
];

describe('when reading what the preview is wired to', () => {
    const marks = describeLensMarks({ querySelectorAll: () => nodes }, new Set(['featured']), defaultLensStrings);

    it('should mark every hooked button, data component, filter and unbound text and nothing else', () => marks.length.should.equal(6));
    it('should say the slice a hook runs and where it opens', () => marks[0].label.should.equal('SetPrice · drawer'));
    it('should not call an enabled hook blocked', () => marks[0].blocked.should.be.false);
    it('should call a disabled hook blocked', () => marks[1].blocked.should.be.true);
    it('should give the reason a hook is disabled as Scene says it', () => marks[1].reason?.should.equal('Withdraw is for item, so it waits for a row.'));
    it('should mark a button that is hooked to no slice', () => marks[2].kind.should.equal(LensMarkKind.UnlinkedHook));
    it('should say the query a data component shows', () => marks[3].label.should.equal('query AllProducts'));
    it('should say the parameter a filter sets', () => marks[4].label.should.equal('filter → AllProducts.status'));
    it('should mark text bound to nothing', () => marks[5].kind.should.equal(LensMarkKind.UnboundText));
});
