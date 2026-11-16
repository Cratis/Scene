// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignSystemEditorStrings } from '../../defaultDesignSystemEditorStrings';
import { sectionEntries, sectionFrom } from '../designSystemSections';

const entries = (hasDraft: boolean, hasStandard = true) => sectionEntries(defaultDesignSystemEditorStrings, hasDraft, hasStandard);
const added = { id: 'assistant', label: 'Assistant', group: 'Draft', render: () => null };

describe('when choosing a section', () => {
    it('should open the one asked for', () => sectionFrom('components', entries(false)).should.equal('components'));
    it('should open the overview for a name that does not exist', () => sectionFrom('nope', entries(false)).should.equal('overview'));
    it('should open the overview when none is asked for', () => sectionFrom(null, entries(false)).should.equal('overview'));
    it('should open the overview for the changes when there is no draft', () => sectionFrom('changes', entries(false)).should.equal('overview'));
    it('should open the changes when there is a draft', () => sectionFrom('changes', entries(true)).should.equal('changes'));
    it('should open the themes', () => sectionFrom('themes', entries(false)).should.equal('themes'));
    it('should open the words', () => sectionFrom('words', entries(false)).should.equal('words'));
    it('should open what is off the standard when the host can find it', () => sectionFrom('standard', entries(false)).should.equal('standard'));
    it('should open the overview for what is off the standard when the host cannot find it', () => sectionFrom('standard', entries(false, false)).should.equal('overview'));
    it('should open a section the host added', () => sectionFrom('assistant', sectionEntries(defaultDesignSystemEditorStrings, false, true, [added])).should.equal('assistant'));

    describe('and the navigation is drawn', () => {
        it('should offer the changes only with a draft', () => entries(false).some(entry => entry.section === 'changes').should.be.false);
        it('should offer the changes with a draft', () => entries(true).some(entry => entry.section === 'changes').should.be.true);
        it('should offer what is off the standard only when the host can find it', () => entries(false, false).some(entry => entry.section === 'standard').should.be.false);
        it('should start with the overview', () => entries(false)[0].section.should.equal('overview'));
        it('should group the foundations', () => entries(false).filter(entry => entry.group === 'foundations').map(entry => entry.section).should.deep.equal(['color', 'type', 'spacing', 'elevation']));
        it('should list the sections the host added after the editor\'s own', () => {
            const all = sectionEntries(defaultDesignSystemEditorStrings, true, true, [added]);
            all[all.length - 1].should.deep.equal({ section: 'assistant', label: 'Assistant', group: 'Draft' });
        });
        it('should not let a host replace a section of the editor', () =>
            sectionEntries(defaultDesignSystemEditorStrings, false, true, [{ ...added, id: 'themes' }]).filter(entry => entry.section === 'themes').should.have.length(1));
    });
});
