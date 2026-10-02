// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, DiagnosticSeverity, FlowContainerKind, LayoutType, Orientation, SceneEditKind } from '@cratis/scene.model';
import { flowNodeId } from '../index';
import { createLayoutDocument, homeContext, mainSlot, pageContext, stackPanel } from '../given/a_layout_document';
import { apply, codesOf } from './given/edits';

type Flow = { kind: string; gap: number; columns?: number; rows?: number; children: { span?: number }[] };
const rootOf = (model: ReturnType<typeof createLayoutDocument>) => (model.screenTemplates[0].slots[0].arrangement as unknown as { root: Flow }).root;

describe('when changing a layout type', () => {
    const document = createLayoutDocument();
    const column = flowNodeId(mainSlot, 'root', []);
    const row = flowNodeId(mainSlot, 'root', [0]);

    it('should turn a row into a column without losing anything', () => {
        const outcome = apply(document, { kind: SceneEditKind.ChangeLayoutType, nodeId: row, to: LayoutType.FlowColumn }, pageContext());
        outcome.applied.should.be.true;
        outcome.diagnostics.should.be.empty;
        const changed = rootOf(outcome.model).children[0] as unknown as Flow;
        changed.kind.should.equal(FlowContainerKind.Column);
        changed.gap.should.equal(4);
        changed.children.should.have.length(2);
    });

    describe('from a grid', () => {
        const grid = (() => {
            const asGrid = apply(document, { kind: SceneEditKind.ChangeLayoutType, nodeId: column, to: LayoutType.FlowGrid }, pageContext()).model;
            const root = rootOf(asGrid);
            root.columns = 3;
            root.children[1].span = 2;
            return asGrid;
        })();

        it('should refuse a lossy change and say what would be lost', () => {
            const outcome = apply(grid, { kind: SceneEditKind.ChangeLayoutType, nodeId: column, to: LayoutType.FlowRow }, pageContext());
            outcome.applied.should.be.false;
            codesOf(outcome).should.deep.equal([DiagnosticCode.LossyConversionNotAccepted]);
            outcome.diagnostics[0].message.should.contain('columns').and.contain('span');
        });

        it('should go ahead with a warning when the loss is accepted', () => {
            const outcome = apply(grid, { kind: SceneEditKind.ChangeLayoutType, nodeId: column, to: LayoutType.FlowRow, acceptLoss: true }, pageContext());
            outcome.applied.should.be.true;
            outcome.diagnostics.map(diagnostic => diagnostic.severity).should.deep.equal([DiagnosticSeverity.Warning]);
            const root = rootOf(outcome.model);
            ('columns' in root).should.be.false;
            ('span' in root.children[1]).should.be.false;
            root.kind.should.equal(FlowContainerKind.Row);
        });

        it('should not call a grid with nothing set lossy', () => {
            const empty = apply(document, { kind: SceneEditKind.ChangeLayoutType, nodeId: column, to: LayoutType.FlowGrid }, pageContext()).model;
            apply(empty, { kind: SceneEditKind.ChangeLayoutType, nodeId: column, to: LayoutType.FlowRow }, pageContext()).applied.should.be.true;
        });
    });

    describe('of a panel', () => {
        const withPanels = (() => {
            const copy = structuredClone(document);
            copy.screenTemplates[0].content!.side[0] = stackPanel('stack', [], 6);
            return copy;
        })();

        it('should refuse to drop a spacing that is set', () => {
            codesOf(apply(withPanels, { kind: SceneEditKind.ChangeLayoutType, nodeId: 'element:stack', to: LayoutType.WrapPanel }, pageContext())).should.deep.equal([DiagnosticCode.LossyConversionNotAccepted]);
        });

        it('should convert a stack panel to a wrap panel when the loss is accepted', () => {
            const outcome = apply(withPanels, { kind: SceneEditKind.ChangeLayoutType, nodeId: 'element:stack', to: LayoutType.WrapPanel, acceptLoss: true }, pageContext());
            outcome.applied.should.be.true;
            const panel = outcome.model.screenTemplates[0].content!.side[0] as unknown as Record<string, unknown>;
            ('spacing' in panel).should.be.false;
            (panel.orientation as string).should.equal(Orientation.Vertical);
        });

        it('should convert to a dock panel, which has no orientation, once the loss is accepted', () => {
            const outcome = apply(withPanels, { kind: SceneEditKind.ChangeLayoutType, nodeId: 'element:stack', to: LayoutType.DockPanel, acceptLoss: true }, pageContext());
            outcome.applied.should.be.true;
            (outcome.model.screenTemplates[0].content!.side[0] as unknown as { lastChildFill: boolean }).lastChildFill.should.be.true;
        });
    });

    it('should refuse a change the type does not allow', () => {
        codesOf(apply(document, { kind: SceneEditKind.ChangeLayoutType, nodeId: flowNodeId(mainSlot, 'root', [1]), to: LayoutType.FlowRow }, pageContext())).should.deep.equal([DiagnosticCode.LayoutTypeNotConvertible]);
    });

    it('should refuse something that is not a layout node', () => {
        codesOf(apply(document, { kind: SceneEditKind.ChangeLayoutType, nodeId: 'element:g', to: LayoutType.FlowRow }, pageContext())).should.deep.equal([DiagnosticCode.NotALayoutNode]);
    });

    it('should refuse to change an inherited node', () => {
        codesOf(apply(document, { kind: SceneEditKind.ChangeLayoutType, nodeId: row, to: LayoutType.FlowColumn }, homeContext())).should.deep.equal([DiagnosticCode.NodeNotEditable]);
    });
});
