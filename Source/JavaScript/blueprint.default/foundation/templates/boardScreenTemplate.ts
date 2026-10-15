// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The board: columns mapped to a status or stage, cards that move between them - by dragging or by each card's own Move-to menu, so the board is as
 * usable from a keyboard and a screen reader as with a pointer.
 */
export const boardScreenTemplate: ScreenTemplate = {
    name: 'BoardScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'toolbar' }, { name: 'board' }],
    arrangement: {
        root: column([slotLeaf('header'), row([slotLeaf('toolbar')], 8), slotLeaf('board')], 12),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('toolbar'), slotLeaf('board')], 16) }],
    },
    content: {
        header: [component('board-header', 'pageHeader', { title: 'Pipeline', subtitle: 'Drag a deal to a new stage' })],
        toolbar: [component('board-search', 'globalSearch', { placeholder: 'Search the pipeline', label: 'Search the pipeline' })],
        board: [component('board-columns', 'kanbanBoard', { columns: fromQuery('PipelineColumns'), cards: fromQuery('PipelineCards') })],
    },
    displayName: 'Board',
    description: 'Columns mapped to a stage with cards that move by dragging or by menu.',
    metadata: { ...foundationTemplateProvenance, type: 'Board', category: 'Foundation / Board', thumbnail: thumbnailOf('BoardScreen') },
};
