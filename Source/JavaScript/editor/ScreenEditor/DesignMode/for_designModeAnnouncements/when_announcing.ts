// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { designModeActions, type DesignModeItem } from '../designModeTypes';
import { defaultDesignModeStrings } from '../DesignModeStrings';
import { actionAnnouncement, refusalReasonOf } from '../designModeAnnouncements';

const item = { label: 'Save', index: 1, count: 4 } as DesignModeItem;
const announce = (actionId: string) => actionAnnouncement(defaultDesignModeStrings, actionId, item);

describe('when announcing what an action did', () => {
    it('should say the item moved to the earlier position', () => announce(designModeActions.moveEarlier).should.equal('Moved Save to position 1 of 4'));
    it('should say the item moved to the later position', () => announce(designModeActions.moveLater).should.equal('Moved Save to position 3 of 4'));
    it('should say the item was duplicated', () => announce(designModeActions.duplicate).should.equal('Duplicated Save'));
    it('should say the item was removed', () => announce(designModeActions.delete).should.equal('Removed Save'));
    it('should say nothing for another action', () => announce('other').should.equal(''));
});

describe('when giving the reason an edit was refused', () => {
    it('should give what the model said first', () => refusalReasonOf({ rejected: 'no', diagnostics: [{ message: 'diag' }] }, 'label').should.equal('no'));
    it('should give the first diagnostic when the model said nothing', () => refusalReasonOf({ diagnostics: [{ message: 'diag' }] }, 'label').should.equal('diag'));
    it('should give the label when there is nothing else', () => refusalReasonOf({ diagnostics: [] }, 'label').should.equal('label'));
});
