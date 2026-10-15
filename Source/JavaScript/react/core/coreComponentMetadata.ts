// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory } from '@cratis/scene.model';
import { ComponentMetadata, componentMetadata as m, navigationDesignMode, toolbarDesignMode } from '../packages';

/** The category, icon, keywords and picker badge of every component of the package (CMP1), keyed by bare component name. */
export const coreComponentMetadata: Record<string, ComponentMetadata> = {
    text: m('Text', ComponentCategory.DataDisplay, 'type', ['label', 'paragraph', 'copy']),
    button: m('Button', ComponentCategory.Actions, 'mouse-pointer-click', ['click', 'submit', 'action'], 'Bt'),
    card: m('Card', ComponentCategory.Layout, 'square', ['panel', 'box', 'container']),
    data: m('Data', ComponentCategory.DataDisplay, 'database', ['read model', 'query', 'source']),
    action: m('Command action', ComponentCategory.Actions, 'zap', ['command', 'invoke', 'submit']),
    section: m('Section', ComponentCategory.Layout, 'layout-panel-top', ['group', 'area', 'block']),
    navigate: m('Navigate', ComponentCategory.Navigation, 'corner-down-right', ['link', 'go to', 'route']),
    title: m('Title', ComponentCategory.DataDisplay, 'heading', ['heading', 'header', 'caption']),
    table: m('Table', ComponentCategory.DataDisplay, 'table', ['grid', 'rows', 'list'], 'Tb'),
    column: m('Table column', ComponentCategory.DataDisplay, 'columns-3', ['heading', 'field']),
    summary: m('Summary', ComponentCategory.DataDisplay, 'list', ['details', 'overview', 'facts']),
    field: m('Summary field', ComponentCategory.DataDisplay, 'tag', ['label', 'value', 'pair']),
    code: m('Code', ComponentCategory.DataDisplay, 'code', ['snippet', 'source', 'monospace']),
    file: m('File reference', ComponentCategory.DataDisplay, 'file', ['include', 'import', 'screen file']),
    navigationBar: m('Navigation bar', ComponentCategory.Navigation, 'navigation', ['menu', 'nav', 'links'], undefined, navigationDesignMode({ itemsPath: 'items' })),
    outlet: m('Outlet', ComponentCategory.Layout, 'panel-right', ['region', 'slot', 'side panel']),
    toolbar: m('Toolbar', ComponentCategory.Actions, 'wrench', ['actions', 'buttons', 'command bar'], 'Tl', toolbarDesignMode()),
    sliceDialog: m('Slice dialog', ComponentCategory.Overlay, 'square-pen', ['task dialog', 'state change', 'form', 'command'], undefined),
    toolbarItem: m('Toolbar item', ComponentCategory.Actions, 'mouse-pointer-click', ['button', 'action']),
};
