// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { sceneScreenDraftReviewVisible } from '../sceneScreenDraftReviewVisibility';

describe('when the review is suspended behind the application preview', () => {
    it('should show the review while it is open and no preview is running', () => sceneScreenDraftReviewVisible(true, false).should.be.true);
    it('should hide the review while the preview is running so the preview is not obstructed', () => sceneScreenDraftReviewVisible(true, true).should.be.false);
    it('should restore the same review when the preview exits', () => {
        const open = true;
        [false, true, false].map(previewing => sceneScreenDraftReviewVisible(open, previewing)).should.deep.equal([true, false, true]);
    });
    it('should not open a closed review because a preview exits', () => sceneScreenDraftReviewVisible(false, false).should.be.false);
});
