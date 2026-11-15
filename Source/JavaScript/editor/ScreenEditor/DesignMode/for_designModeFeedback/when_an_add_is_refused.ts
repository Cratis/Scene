// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignModeStrings } from '../DesignModeStrings';
import { refusedFeedback } from '../designModeFeedback';

describe('when an add is refused', () => {
    const feedback = refusedFeedback(defaultDesignModeStrings.announce.refused('The tab needs a screen to show'));

    it('should announce it to a screen reader', () => feedback.announcement.should.equal('Not possible: The tab needs a screen to show'));
    it('should show it to everyone else as a notice', () => feedback.notice.should.equal('Not possible: The tab needs a screen to show'));
    it('should say the same in both', () => feedback.notice.should.equal(feedback.announcement));
    it('should say something when there is nothing to add to', () => defaultDesignModeStrings.announce.nothingToAdd.length.should.be.greaterThan(0));
});
