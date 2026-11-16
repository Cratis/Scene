// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { validateValue } from '@cratis/scene.engine';
import { withIconReferences } from '../withIconReferences';

const items: PropertyDescriptor = {
    path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection,
    item: { properties: [
        { path: 'id', label: 'Id', group: 'Content', valueType: PropertyValueType.String },
        { path: 'title', label: 'Title', group: 'Content', valueType: PropertyValueType.String },
        { path: 'icon', label: 'Icon', group: 'Content', valueType: PropertyValueType.Icon },
    ] },
};

describe('when checking the buttons of an outlet whose icons are kept as text', () => {
    const buttons = [{ id: 'new', title: 'New product', icon: 'Cratis.Icons.Lucide#plus' }, { id: 'approve', title: 'Approve' }];
    const read = withIconReferences(items, buttons) as { icon?: unknown }[];

    it('should read the icon as the reference it names', () => (read[0].icon as object).should.deep.equal({ library: 'Cratis.Icons.Lucide', key: 'plus' }));
    it('should leave a button without an icon as it is', () => (read[1].icon === undefined).should.be.true);
    it('should fit what the outlet describes', () => (validateValue(items, read) === undefined).should.be.true);
    it('should not change the value it was given', () => (buttons[0].icon as string).should.equal('Cratis.Icons.Lucide#plus'));
});

describe('when checking a button whose icon is no reference at all', () => {
    it('should leave the text for the check to report', () => ((withIconReferences(items, [{ id: 'new', title: 'New', icon: 'plus' }]) as { icon: unknown }[])[0].icon as string).should.equal('plus'));
});
