// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { screenEditorPrimeReactDefaults } from '../screenEditorPrimeReactDefaults';

type Entry = { props?: { styles?: unknown } };
const entries = screenEditorPrimeReactDefaults as unknown as Record<string, Entry>;
const hasStyles = (key: string) => entries[key]?.props?.styles !== undefined;

// The PrimeReact primitives Scene's PrimeReact package draws with, by the root that carries the look. Left out of the provider's defaults,
// each is drawn with the right markup and no look at all - a button that is plain text, a card with no surface, a field with no box.
const drawnByScene = ['Button', 'Card.Root', 'Checkbox.Root', 'DataTable.Root', 'Dialog.Root', 'Message.Root', 'ProgressBar.Root', 'Slider.Root', 'Tag', 'Tooltip.Root', 'Accordion.Root', 'Timeline.Root'];

describe('when looking at the component styles handed to PrimeReact', () => {
    it('should have an entry for each component Scene draws', () => drawnByScene.filter(key => entries[key] === undefined).should.deep.equal([]));
    it('should give each of them styles', () => drawnByScene.filter(key => !hasStyles(key)).should.deep.equal([]));
    it('should cover a good part of the library', () => Object.keys(entries).length.should.be.greaterThan(60));
});
