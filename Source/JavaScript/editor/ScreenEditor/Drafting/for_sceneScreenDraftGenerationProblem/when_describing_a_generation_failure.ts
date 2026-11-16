// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneScreenDraftRefusal } from '../SceneScreenDraft';
import { defaultSceneScreenDraftStrings } from '../defaultSceneScreenDraftStrings';
import { sceneScreenDraftGenerationProblem } from '../sceneScreenDraftGenerationProblem';

const problem = (error: unknown) => sceneScreenDraftGenerationProblem(error, defaultSceneScreenDraftStrings);

describe('when describing a generation failure', () => {
    it('should show the message of a refusal', () => problem(new SceneScreenDraftRefusal('Ikke tillatt')).should.equal('Ikke tillatt'));
    it('should show the generic text for an error', () => problem(new Error('TypeError at Handle')).should.equal(defaultSceneScreenDraftStrings.generationFailed));
    it('should not leak the message of an error', () => problem(new Error('TypeError at Handle')).should.not.contain('at Handle'));
    it('should show the generic text for a thrown string', () => problem('boom').should.equal(defaultSceneScreenDraftStrings.generationFailed));
    it('should show the generic text for nothing', () => problem(undefined).should.equal(defaultSceneScreenDraftStrings.generationFailed));
    it('should show the generic text for a refusal without a message', () => problem(new SceneScreenDraftRefusal('')).should.equal(defaultSceneScreenDraftStrings.generationFailed));
});
