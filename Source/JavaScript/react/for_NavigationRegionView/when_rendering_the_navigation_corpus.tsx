// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { NavigationApplication, loadNavigationCorpus } from './given/navigation_application';

const corpora = ['navigation-inheritance-fixtures.json', 'navigation-targets-fixtures.json'].map(loadNavigationCorpus);

function renderedLines(container: HTMLElement): string[] {
    return Array.from(container.querySelectorAll('li[data-scene-nav-item]')).map(item => {
        const depth = Number(item.getAttribute('data-level'));
        const fields = [item.getAttribute('data-scene-nav-item'), item.getAttribute('data-origin'), item.getAttribute('data-read-only') === 'true' ? 'locked' : 'editable', item.getAttribute('data-slot')];
        return `${'  '.repeat(depth)}${fields.join('|')}`;
    });
}

/** The fixture line reduced to what the DOM carries: id, origin, locked, slot. */
function expectedLine(line: string): string {
    const indent = line.length - line.trimStart().length;
    const fields = line.trim().split('|');
    return `${' '.repeat(indent)}${[fields[0], fields[1], fields[2], fields[4]].join('|')}`;
}

describe('when rendering the shared navigation corpora through the navigation host', () => {
    afterEach(cleanup);

    for (const corpus of corpora) {
        for (const fixture of corpus.cases) {
            for (const view of fixture.views) {
                const where = view.module ?? 'application';
                describe(`and the ${where} ${view.region} of ${fixture.name}`, () => {
                    let container: HTMLElement;
                    let region: Element;

                    beforeEach(() => {
                        const index = new ApplicationStructureIndex(fixture.structure!);
                        const initialScreen = (view.module ? index.firstFeatureId(view.module) : undefined) ?? 'dashboard.overview';
                        ({ container } = render(<NavigationApplication structure={fixture.structure!} navigation={fixture.navigation} initialScreen={initialScreen}
                            regions={[{ region: view.region, ...(view.module ? { module: view.module } : { application: true }), expand: 'all' }]} />));
                        region = container.querySelector('nav[data-scene-nav-region]')!;
                    });

                    it('should render the effective items in order with their origin, lock and slot', () =>
                        renderedLines(container).should.deep.equal(view.expected.items.map(expectedLine)));

                    it('should say where the items come from', () =>
                        region.getAttribute('data-scene-nav-sources')!.should.equal(view.expected.sources.split('|')[0]));

                    it('should carry the region mode', () =>
                        (region.getAttribute('data-scene-nav-mode') ?? undefined)?.should.equal(view.expected.mode));
                });
            }
        }
    }

    it('should have rendered a corpus of cases', () => corpora.every(corpus => corpus.cases.length > 5).should.be.true);
});
