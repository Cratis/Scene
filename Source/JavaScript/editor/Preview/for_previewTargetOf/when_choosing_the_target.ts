// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PreviewNodeKind, type PreviewNodeRef } from '../PreviewScene';
import { previewTargetOf } from '../previewTargetOf';

const node = (kind: PreviewNodeKind, sceneId: string): PreviewNodeRef => ({ id: 'a-board-id', kind, sceneId });

describe('when choosing what the preview host shows for a node of the board', () => {
    it('should show a module by its name, for its first feature in the shell', () => (previewTargetOf(node(PreviewNodeKind.Module, 'Sales')) as object).should.deep.equal({ module: 'Sales' }));
    it('should show a feature in its module, named by its path', () => (previewTargetOf(node(PreviewNodeKind.Feature, 'Sales.Orders')) as object).should.deep.equal({ module: 'Sales', feature: 'Sales.Orders' }));
    it('should show a sub-feature in the module it is under', () => (previewTargetOf(node(PreviewNodeKind.Feature, 'Sales.Orders.Returns')) as object).should.deep.equal({ module: 'Sales', feature: 'Sales.Orders.Returns' }));
    it('should show a slice by its path', () => (previewTargetOf(node(PreviewNodeKind.Slice, 'Sales.Orders.PlaceOrder')) as object).should.deep.equal({ slice: 'Sales.Orders.PlaceOrder' }));
    it('should show nothing for no node', () => (previewTargetOf(undefined) === undefined).should.be.true);
});
