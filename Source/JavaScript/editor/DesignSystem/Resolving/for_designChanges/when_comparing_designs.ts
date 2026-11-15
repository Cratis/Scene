// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applyDesignChanges } from '../../Testing/applyDesignChange';
import { sampleDesignSystem } from '../../Testing/sampleDesignSystem';
import { addThemeChange, partChange, roleChange, valueChange, wordChange } from '../designEdits';
import { designChanges, nameChanges } from '../designChanges';

describe('when comparing designs', () => {
    const before = sampleDesignSystem();

    describe('and nothing changed', () => {
        it('should find no difference', () => designChanges(before, sampleDesignSystem()).should.deep.equal([]));
    });

    describe('and there is nothing to compare with', () => {
        const changes = designChanges(undefined, before);

        it('should find everything added', () => changes.every(change => change.kind === 'added').should.be.true);
        it('should find the token roles', () => changes.some(change => change.path === 'color.primary (role)').should.be.true);
        it('should find the theme values in every mode', () => changes.some(change => change.path === 'color.primary in Acme dark').should.be.true);
        it('should find the component parts as the variants declare them', () => changes.some(change => change.path === 'Button primary default background' && change.after === 'color.primary').should.be.true);
        it('should find the words', () => changes.some(change => change.path === 'voice tone').should.be.true);
        it('should find the themes', () => changes.some(change => change.path === 'theme Acme' && change.after === 'default').should.be.true);
    });

    describe('and a value, a part, a word, a role and a theme were changed', () => {
        const after = applyDesignChanges(before, [
            valueChange('Acme', true, 'color', 'primary', 'light', '#ff0000'),
            partChange('Button', 'primary', 'hover', 'background', 'color.hover'),
            wordChange('voice', 'tone', 'Warm'),
            roleChange('color', 'accent', 'links'),
            valueChange('Acme', true, 'color', 'accent', undefined, '#00ff00'),
            addThemeChange('Partner', 'Acme'),
        ]);
        const changes = designChanges(before, after);
        const find = (path: string) => changes.find(change => change.path === path);

        it('should find a changed value with what it was and what it is', () => {
            const change = find('color.primary in Acme light')!;
            [change.kind, change.before, change.after].should.deep.equal(['changed', '#1d4ed8', '#ff0000']);
        });
        it('should find an added part', () => find('Button primary hover background')!.kind.should.equal('added'));
        it('should find a changed word', () => find('voice tone')!.after.should.equal('Warm'));
        it('should find an added role', () => find('color.accent (role)')!.after.should.equal('links'));
        it('should find the new role\'s value in every mode', () => [find('color.accent in Acme light')?.after, find('color.accent in Acme dark')?.after].should.deep.equal(['#00ff00', '#00ff00']));
        it('should find an added theme', () => find('theme Partner')!.kind.should.equal('added'));
        it('should find nothing else', () => changes.filter(change => !change.path.includes('Partner') && !change.path.includes('accent')).should.have.length(3));
    });

    describe('and things were removed', () => {
        const after = applyDesignChanges(before, [wordChange('naming', 'order', ''), partChange('Menu', 'default', 'hover', 'background', '')]);
        const changes = designChanges(before, after);

        it('should find a removed word with what it was', () => {
            const change = changes.find(candidate => candidate.path === 'naming order')!;
            [change.kind, change.before, change.after].should.deep.equal(['removed', 'Booking', '']);
        });
        it('should find a removed part', () => changes.find(candidate => candidate.path === 'Menu default hover background')!.kind.should.equal('removed'));
    });

    describe('and names are compared', () => {
        const names = nameChanges(['AppShell', 'Old'], ['AppShell', 'New']);

        it('should find what appeared', () => names.added.should.deep.equal(['New']));
        it('should find what disappeared', () => names.removed.should.deep.equal(['Old']));
    });
});
