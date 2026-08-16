// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, HTMLAttributes, useState } from 'react';
import { MenuItem } from '../MenuItem';
import { MenuItemAction } from './MenuItemAction';

const barStyle: CSSProperties = { borderBottom: '1px solid var(--scene-surface-border)', color: 'var(--scene-text-color)' };

const tabStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--scene-text-muted-color)',
    cursor: 'pointer',
    font: 'inherit',
    textDecoration: 'none',
};

const selectedTabStyle: CSSProperties = { ...tabStyle, borderBottomColor: 'var(--scene-primary-color)', color: 'var(--scene-text-color)' };

/**
 * The configuration {@link TabMenu} takes.
 */
export interface TabMenuProps extends HTMLAttributes<HTMLElement> {
    /**
     * The destinations to show, in order.
     */
    items?: MenuItem[];

    /**
     * The zero-based entry to start on.
     */
    activeIndex?: number;
}

/**
 * Tab-styled horizontal navigation between destinations. Cratis-owned.
 *
 * This exists because PrimeReact 11 removed `primereact/tabmenu` outright. `primereact/tabs` survives and
 * was the obvious candidate to build on, but it was rejected on purpose: `Tabs.Tab` emits `role="tab"` and
 * an `aria-controls` pointing at the tab panel it expects to sit beside, and a navigation bar has no
 * panels. Adopting it would produce markup that announces panels which do not exist and references ids
 * that resolve to nothing - a real accessibility defect traded for a little less code.
 *
 * So this is a `nav` holding links and buttons, with the current entry marked `aria-current`, which is the
 * pattern the tabs look is imitating. The tab appearance is styling; the semantics are navigation, and
 * they now agree.
 *
 * What it deliberately does not carry over from the v10 `TabMenu`: there is no roving-focus keyboard model
 * with arrow keys moving between entries - the entries are ordinary links and buttons in the tab order -
 * no scroll buttons when the entries overflow, no sliding active-bar animation, and no item templates. The
 * selected entry is held here so the control responds in a preview, exactly as the v10 adapter did.
 */
export function TabMenu({ items = [], activeIndex = 0, ...rest }: TabMenuProps) {
    const [selectedIndex, setSelectedIndex] = useState(activeIndex);

    return (
        <nav {...rest} className='flex items-center gap-2' style={barStyle}>
            {items.map((item, index) => (
                <MenuItemAction
                    key={index}
                    item={item}
                    current={index === selectedIndex}
                    className='inline-flex items-center gap-2 p-3'
                    style={index === selectedIndex ? selectedTabStyle : tabStyle}
                    onActivate={() => setSelectedIndex(index)}
                />
            ))}
        </nav>
    );
}
