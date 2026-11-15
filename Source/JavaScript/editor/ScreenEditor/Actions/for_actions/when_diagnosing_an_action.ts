// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ActionModel } from '../ActionModel';
import { Opens } from '@cratis/scene.model';
import { ActionProblemKind, diagnoseAction, suggestInputs } from '../diagnoseAction';
import type { StateChangeSlice } from '../StateChangeSlice';

const slice: StateChangeSlice = { id: 's1', name: 'Check out', origin: [], inputs: [{ name: 'toolId', type: 'Guid', required: true }, { name: 'note', type: 'string', required: false }] };
const sources = new Set(['row.id', 'route.equipmentId']);
const model = (inputs: Record<string, string>): ActionModel => ({ sliceId: 's1', sliceName: 'Check out', inputs, opens: Opens.None });
const kinds = (action: ActionModel, slices = [slice]) => diagnoseAction(action, slices, sources).map(problem => problem.kind);

describe('when an action is fully mapped', () => {
    it('should have no problems', () => kinds(model({ toolId: 'row.id' })).should.deep.equal([]));
});

describe('when the slice is gone', () => {
    it('should say so', () => kinds(model({ toolId: 'row.id' }), []).should.deep.equal([ActionProblemKind.MissingSlice]));
});

describe('when a required input has nothing feeding it', () => {
    it('should name the input', () => diagnoseAction(model({}), [slice], sources).should.deep.equal([{ kind: ActionProblemKind.UnmappedInput, input: 'toolId' }]));
});

describe('when an optional input has nothing feeding it', () => {
    it('should not complain', () => kinds(model({ toolId: 'row.id' })).should.not.include(ActionProblemKind.UnmappedInput));
});

describe('when an input is mapped that the command no longer has', () => {
    it('should report it', () => kinds(model({ toolId: 'row.id', gone: 'row.id' })).should.deep.equal([ActionProblemKind.UnknownInput]));
});

describe('when a value comes from somewhere the screen does not offer', () => {
    it('should report it', () => kinds(model({ toolId: 'selection.nothing' })).should.deep.equal([ActionProblemKind.UnknownSource]));
});

describe('when suggesting a mapping', () => {
    it('should wire the inputs that have a matching value and leave the rest', () =>
        suggestInputs(slice, name => name === 'toolId' ? 'row.id' : undefined).should.deep.equal({ toolId: 'row.id' }));
});
