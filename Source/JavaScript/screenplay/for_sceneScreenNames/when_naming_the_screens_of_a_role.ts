// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describe, expect, it } from 'vitest';
import { SceneScreenNames, primarySceneScreen, roleOf, sceneNameOf, screenplayNameOf } from '../sceneScreenNames';

describe('when reading the role a screen belongs to', () => {
    it('should take a plain name as the role itself', () => expect(roleOf('Buyer')).toEqual('Buyer'));
    it('should take the part before the separator', () => expect(roleOf('Buyer__History')).toEqual('Buyer'));
    it('should leave a leading separator alone, which is not a role', () => expect(roleOf('__History')).toEqual('__History'));
});

describe('when reading which screen of the document a name is', () => {
    it('should take a plain name as the screen the editor opens', () => expect(sceneNameOf('Buyer')).toEqual(primarySceneScreen));
    it('should take the part after the separator', () => expect(sceneNameOf('Buyer__History')).toEqual('History'));
    it('should be the inverse of naming', () => expect(screenplayNameOf('Buyer', sceneNameOf('Buyer__History'))).toEqual('Buyer__History'));
});

describe('when naming the screens of one role', () => {
    const names = SceneScreenNames.forScreenplay('Buyer', ['Buyer', 'Buyer__History']);

    it('should call the role\'s own screen the one the editor opens', () => expect(names.toScene('Buyer')).toEqual(primarySceneScreen));
    it('should call the other screen what it was written as', () => expect(names.toScene('Buyer__History')).toEqual('History'));
    it('should name them back', () => expect(names.toScreenplay('History')).toEqual('Buyer__History'));
});

describe('when naming screens written under names of their own', () => {
    const names = SceneScreenNames.ofOwnScreens(['Printout', 'Label']);

    it('should let the first one be the screen the editor opens', () => expect(names.toScene('Printout')).toEqual(primarySceneScreen));
    it('should leave the rest as they were written', () => expect(names.toScene('Label')).toEqual('Label'));
    it('should remember what the first one was written as', () => expect(names.toScreenplay(primarySceneScreen)).toEqual('Printout'));

    it('should leave the first alone when a screen is already called that', () => {
        const already = SceneScreenNames.ofOwnScreens(['Printout', primarySceneScreen]);
        expect(already.toScene('Printout')).toEqual('Printout');
        expect(already.toScene(primarySceneScreen)).toEqual(primarySceneScreen);
    });
});

describe('when handing out element ids', () => {
    const names = SceneScreenNames.forScreenplay('Buyer', ['Buyer']);

    it('should give the first one the id asked for', () => expect(names.uniqueElementId('title')).toEqual('title'));
    it('should number the next one', () => expect(names.uniqueElementId('title')).toEqual('title-2'));
    it('should keep numbering', () => expect(names.uniqueElementId('title')).toEqual('title-3'));
    it('should not number a different id', () => expect(names.uniqueElementId('table-orderrow')).toEqual('table-orderrow'));
});
