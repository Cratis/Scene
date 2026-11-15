// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { bareNameOf, declarationComponents, designTimeSamples, sampleKeysInUse, withSampleProperties } from '../designTimeSamples';
import { defaultPaletteSources } from '../../../Defaults/defaultPaletteSources';

describe('when drawing an element that has set nothing', () => {
    it('should draw a text with words', () => withSampleProperties('core:text', 'text', {}).text!.should.be.a('string').and.not.equal(''));
    it('should draw a table with rows', () => (withSampleProperties('core:table', 'table', undefined).rows as unknown[]).length.should.be.greaterThan(0));
    it('should draw a chart with data', () => (withSampleProperties('PrimeReact:chart', 'chart', {}).data as { datasets: unknown[] }).datasets.length.should.be.greaterThan(0));
});

describe('when drawing an element that has set a property', () => {
    const drawn = withSampleProperties('core:text', 'text', { text: 'Welcome' });

    it('should keep what the element set', () => drawn.text!.should.equal('Welcome'));
});

describe('when drawing an element whose property the author emptied', () => {
    it('should keep it empty for an empty string', () => withSampleProperties('core:text', 'text', { text: '' }).text!.should.equal(''));
    it('should keep it empty for null', () => (withSampleProperties('core:text', 'text', { text: null }).text === null).should.be.true);
    it('should keep an emptied list empty', () => (withSampleProperties('core:table', 'table', { rows: [] }).rows as unknown[]).length.should.equal(0));
});

describe('when drawing an element whose property is not set', () => {
    it('should fall back to the sample for a property that is undefined', () => withSampleProperties('core:text', 'text', { text: undefined }).text!.should.equal('Text'));
});

describe('when a package reuses the name of another', () => {
    it('should take the sample of the package that registered it', () =>
        (withSampleProperties('Cratis.Blueprint.Default:breadcrumb', 'breadcrumb', {}).items as { label: string }[])[0].label.should.equal('Home'));
    it('should take the sample by name for a package with none of its own', () =>
        (withSampleProperties('PrimeReact:breadcrumb', 'breadcrumb', {}).items as string[])[0].should.equal('Home'));
});

describe('when drawing a component nothing is known about', () => {
    it('should pass on exactly what the element set', () => withSampleProperties('Acme:widget', 'widget', { title: 'Mine' }).should.deep.equal({ title: 'Mine' }));
});

describe('when reading a name', () => {
    it('should drop the package', () => bareNameOf('PrimeReact:dataTable').should.equal('dataTable'));
    it('should leave a bare name alone', () => bareNameOf('dataTable').should.equal('dataTable'));
});

describe('when looking at what the palette offers', () => {
    const offered = [...new Set(defaultPaletteSources.flatMap(source => source.components))];

    it('should give every component that needs properties to draw a sample', () => {
        const without = offered.filter(name => !declarationComponents.has(name) && !designTimeSamples[name] && !Object.keys(designTimeSamples).some(key => key.endsWith(`:${name}`)));
        // The few that draw something real from nothing, and the layout/shell parts that only hold other elements.
        const holdersAndSelfSufficient = ['errorBoundary', 'formElement', 'singleResult', 'queryInputForm', 'observableDataTable', 'commandDialog', 'stepperCommandDialog', 'sliceDialog', 'commandForm', 'timeMachine', 'tooltip', 'toolbar', 'appShell', 'fullPageShell', 'sidebar', 'configPanel', 'mask', 'themeSwitcher', 'layoutModeSwitcher', 'rightPanel', 'menu', 'menuItem', 'topbar', 'footer', 'userMenu', 'pageHeader', 'logo', 'arcPageHeader', 'toast', 'dialog', 'slot', 'outletItems', 'bar',
            // The blueprint's own Foundation components (Scene 4.3x-4.6x): the blueprint's gallery screens give them their content; the editor's samples for them are a follow-up.
            'emptyState', 'statCard', 'trendChip', 'statusChip', 'chartWrapper', 'filterBuilder', 'columnChooser', 'savedViewsMenu', 'checklistSection', 'activityFeed', 'avatarStack', 'fileUploader', 'approvalChainStepper', 'orgTree', 'permissionMatrix', 'dataList', 'tabSet', 'subNavigation', 'dialogFrame', 'actionButton', 'notice', 'bulkBar', 'globalSearch', 'notificationsButton', 'kanbanBoard', 'wizardProgress', 'formScreenBody', 'calendarGrid', 'timelineGrid', 'inboxList'];
        without.filter(name => !holdersAndSelfSufficient.includes(name)).should.deep.equal([]);
    });
});

describe('when asking which content comes from the sample', () => {
    it('should name every property the element has not set', () => sampleKeysInUse('PrimeReact:tag', 'tag', {}).should.deep.equal(['value']));
    it('should leave out a property the element set', () => sampleKeysInUse('PrimeReact:tag', 'tag', { value: 'New' }).should.deep.equal([]));
    it('should count an emptied property as set', () => sampleKeysInUse('PrimeReact:tag', 'tag', { value: '' }).should.deep.equal([]));
    it('should name nothing for a component with no sample', () => sampleKeysInUse('Acme:widget', 'widget', {}).should.deep.equal([]));
    it('should never put the sample into what the element holds', () => { const own = {}; withSampleProperties('PrimeReact:tag', 'tag', own); own.should.deep.equal({}); });
});
