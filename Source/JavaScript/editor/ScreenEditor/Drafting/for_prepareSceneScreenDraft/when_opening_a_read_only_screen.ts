// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenEditorController } from '../../Host/ScreenEditorController';
import { readOnlyController } from '../../Host/readOnlyController';
import type { PreparedSceneScreenDraft } from '../SceneScreenDraft';

const calls: string[] = [];
const controller = readOnlyController({
    prepareSceneScreenDraft: () => calls.push('prepare'),
    applySceneScreenDraft: () => calls.push('apply'),
    isSceneScreenDraftCurrent: () => true,
} as unknown as ScreenEditorController, 'Read only');
const draft = {} as PreparedSceneScreenDraft;

describe('when opening a read only screen for drafting', () => {
    it('should refuse preparation', () => controller.prepareSceneScreenDraft!('', []).problem!.should.equal('Read only'));
    it('should refuse applying a prepared draft', () => controller.applySceneScreenDraft!(draft).applied.should.be.false);
    it('should refuse previewing a prepared draft', () => controller.isSceneScreenDraftCurrent!(draft).should.be.false);
    it('should not call the writable controller', () => calls.should.deep.equal([]));
});
