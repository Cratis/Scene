// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PropertyValueType, PropertyEditorKind, type PropertyDescriptor } from '@cratis/scene.model';
import { anEditorContext } from '../../PropertyEditors/Registry/for_PropertyEditorRegistry/given/anEditorContext';
import { createPropertyEditorRegistry } from '../../PropertyEditors/Registry/createPropertyEditorRegistry';
import { inspected, renderedHost } from '../../PropertyEditors/Registry/for_PropertyEditorHost/given/renderedHost';
import { DesignModePopover } from '../DesignModePopover';
import { defaultDesignModeStrings } from '../DesignModeStrings';

const emphasis: PropertyDescriptor = {
    path: 'emphasis', label: 'Emphasis', group: 'Appearance', valueType: PropertyValueType.Enum, editorKind: PropertyEditorKind.Enum,
    choices: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'quiet', label: 'Quiet' }],
};

describe('when a choice of the floating toolbar is drawn in its popover', () => {
    const registry = createPropertyEditorRegistry();
    const property = inspected(emphasis, 'primary', { editTarget: 'node' as never });
    let sidebar = '';
    let popover = '';

    beforeAll(async () => {
        sidebar = await renderedHost(property, [], () => undefined, registry);
        await registry.load(registry.resolve(emphasis)!.id);
        popover = renderToStaticMarkup(createElement(DesignModePopover, {
            registry, property, context: anEditorContext(), componentId: 'c1', anchor: { left: 10, top: 10, width: 60, height: 20 },
            opener: {} as HTMLElement, bounds: { left: 0, top: 0, width: 1000, height: 600 }, title: 'Emphasis', strings: defaultDesignModeStrings, onChange: () => undefined, onClose: () => undefined,
        }));
    });

    it('should be a dialog named for the choice', () => popover.should.contain('role="dialog"').and.contain('aria-label="Emphasis"'));
    it('should hold the editor the registry resolves for the property', () => popover.should.contain('data-editor="enum"'));
    // The editor itself is the same markup in both places (PE3); the Properties tab adds the field's label around it, which the popover leaves to its own heading.
    const controlOf = (markup: string) => markup.slice(markup.indexOf('<div class="studio-editor-field__control">'), markup.lastIndexOf('</div>'));
    it('should hold exactly the editor the Properties tab draws for the same property (PE3)', () => popover.should.contain(controlOf(sidebar)));
    it('should leave out the field label, which the popover heading says', () => popover.should.not.contain('studio-editor-field__label'));
});
