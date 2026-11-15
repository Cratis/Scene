// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComponentPicker } from '../ComponentPicker';
import type { PickerEntry } from '../componentPickerModel';
import { createComponentPickerMemory } from '../componentPickerStorage';

const entry = (key: string, label: string, category: string, badge: string, keywords: string[] = []): PickerEntry =>
    ({ key, label, badge, category, keywords, packageTitle: 'Acme', payload: { kind: 'component', componentName: key, package: 'P' } });
const entries = [entry('button', 'Button', 'Actions', 'Bt'), entry('table', 'Data table', 'Data display', 'Tb', ['grid']), entry('tabs', 'Tabs', 'Navigation', 'Tb')];
const draw = (usage: Record<string, number> = {}) => {
    const memory = createComponentPickerMemory({ getItem: () => null, setItem: () => undefined });
    for (const [key, count] of Object.entries(usage)) for (let time = 0; time < count; time++) memory.recordAdded(key, time);
    return renderToStaticMarkup(createElement(ComponentPicker, { entries, memory, onAdd: () => undefined }));
};

describe('when drawing the picker with nothing used', () => {
    const markup = draw();

    it('should draw the filter with its placeholder', () => markup.should.contain('placeholder="Filter components..."'));
    it('should not draw Frequently used', () => markup.should.not.contain('Frequently used'));
    it('should draw a header for each category, with its count', () => markup.should.match(/Navigation<\/span><span[^>]*>1<\/span>/));
    it('should open only the first category, listing its components with their badges', () => {
        markup.should.contain('data-component="tabs"').and.contain('>Tb<');
        markup.should.not.contain('data-component="button"');
    });
    it('should draw a group header as a button that says whether it is open', () => markup.should.contain('aria-expanded="true"').and.contain('aria-expanded="false"'));
});

describe('when drawing the picker with components used', () => {
    const markup = draw({ button: 3 });

    it('should draw Frequently used first, with a star', () => markup.indexOf('Frequently used').should.be.lessThan(markup.indexOf('Navigation')));
    it('should list the used component there', () => markup.should.contain('data-component="button"'));
    it('should draw the package a component comes from as a secondary label', () => markup.should.contain('>Acme<'));
    it('should draw every component as something that can be dragged', () => markup.should.contain('draggable="true"'));
});
