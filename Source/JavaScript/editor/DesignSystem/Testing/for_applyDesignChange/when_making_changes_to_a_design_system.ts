// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { addThemeChange, defaultThemeChange, partChange, removeThemeChange, roleChange, valueChange, wordChange } from '../../Resolving/designEdits';
import { applyDesignChange, applyDesignChanges } from '../applyDesignChange';
import { sampleDesignSystem } from '../sampleDesignSystem';

describe('when making changes to a design system', () => {
    const design = sampleDesignSystem();
    const value = (system: typeof design, theme: string, mode: string, address: string) =>
        system.themes.find(candidate => candidate.name === theme)!.modes.find(candidate => candidate.mode === mode)!.tokens[address];

    it('should not touch the design system it was given', () => {
        applyDesignChange(design, wordChange('voice', 'tone', 'Warm'));
        design.words!.voice!.tone.should.equal('Plain and direct. Say what happened, then what to do.');
    });

    it('should set a color of the default theme in one mode only', () => {
        const changed = applyDesignChange(design, valueChange('Acme', true, 'color', 'primary', 'dark', '#ff0000'));
        [value(changed, 'Acme', 'dark', 'color.primary'), value(changed, 'Acme', 'light', 'color.primary')].should.deep.equal(['#ff0000', '#1d4ed8']);
    });
    it('should set a value of another theme in every mode', () => {
        const changed = applyDesignChange(design, valueChange('Brand', false, 'radius', 'content', undefined, '2px'));
        [value(changed, 'Brand', 'light', 'radius.content'), value(changed, 'Brand', 'dark', 'radius.content'), value(changed, 'Acme', 'light', 'radius.content')].should.deep.equal(['2px', '2px', '6px']);
    });
    it('should take a value away when it is empty', () => {
        (value(applyDesignChange(design, valueChange('Acme', true, 'color', 'info', 'light', '')), 'Acme', 'light', 'color.info') === undefined).should.be.true;
    });

    it('should declare a token role', () => applyDesignChange(design, roleChange('color', 'accent', 'links')).tokens.find(role => role.name === 'accent')!.description!.should.equal('links'));
    it('should change what a token role is for', () => applyDesignChange(design, roleChange('color', 'primary', 'the brand')).tokens.find(role => role.name === 'primary')!.description!.should.equal('the brand'));
    it('should remove a token role and its values', () => {
        const changed = applyDesignChange(design, roleChange('color', 'info', ''));
        [changed.tokens.some(role => role.name === 'info'), value(changed, 'Acme', 'light', 'color.info') === undefined].should.deep.equal([false, true]);
    });

    it('should set the token a part takes', () => applyDesignChange(design, partChange('Button', 'primary', 'default', 'text', 'color.text')).components.find(component => component.name === 'Button')!.variants[0].parts.text.should.equal('color.text'));
    it('should set the token a part takes in a state', () => applyDesignChange(design, partChange('Button', 'primary', 'hover', 'background', 'color.hover')).components.find(component => component.name === 'Button')!.variants[0].states!.hover.background.should.equal('color.hover'));
    it('should drop a state when its last override is removed', () => {
        const changed = applyDesignChange(design, partChange('Button', 'primary', 'focus', 'shadow', ''));
        (changed.components.find(component => component.name === 'Button')!.variants[0].states === undefined).should.be.true;
    });

    it('should set a word', () => applyDesignChange(design, wordChange('naming', 'invoice', 'Bill')).words!.naming!.invoice.should.equal('Bill'));
    it('should remove a word', () => (applyDesignChange(design, wordChange('naming', 'order', '')).words!.naming!.order === undefined).should.be.true);

    it('should add a theme as a copy of another', () => {
        const changed = applyDesignChange(design, addThemeChange('Partner', 'Brand'));
        const added = changed.themes.find(theme => theme.name === 'Partner')!;
        [added.isDefault, added.modes[0].tokens['color.primary']].should.deep.equal([false, '#38bdf8']);
    });
    it('should add no theme as a copy of one that is not there', () => applyDesignChange(design, addThemeChange('Partner', 'Nope')).themes.should.have.length(2));
    it('should remove a theme', () => applyDesignChange(design, removeThemeChange('Brand')).themes.map(theme => theme.name).should.deep.equal(['Acme']));
    it('should not remove the default theme', () => applyDesignChange(design, removeThemeChange('Acme')).themes.should.have.length(2));
    it('should make a theme the default', () => applyDesignChange(design, defaultThemeChange('Brand')).themes.map(theme => theme.isDefault).should.deep.equal([false, true]));

    it('should do nothing for something that is not there', () => applyDesignChange(design, partChange('Nope', 'primary', 'default', 'text', 'color.text')).should.deep.equal(design));
    it('should make several changes one after the other', () =>
        applyDesignChanges(design, [wordChange('voice', 'a', '1'), wordChange('voice', 'b', '2')]).words!.voice!.should.include({ a: '1', b: '2' }));
});
