// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ReactNode } from 'react';
import { ApplicationStructure, NavigationModel, NavigationRegionKind, SceneElement } from '@cratis/scene.model';
import { ApplicationStructureIndex, EffectiveNavItem } from '@cratis/scene.engine';
import { RegisteredComponentProps } from '../../renderer';
import { SceneNavigationHost } from '../../navigation/SceneNavigationHost';
import { SceneNavigationModel } from '../../navigation/region/SceneNavigationModel';
import { NavigationRegionView, NavigationRegionViewProps } from '../../navigation/region/NavigationRegionView';
import { CoreOutlet } from '../../navigation/CoreOutlet';

export interface NavigationFixtureView {
    module?: string;
    region: NavigationRegionKind;
    expected: { mode?: string; sources: string; items: string[] };
}

export interface NavigationFixtureCase {
    name: string;
    structure?: ApplicationStructure;
    navigation: NavigationModel;
    slots?: string[];
    views: NavigationFixtureView[];
}

export interface NavigationFixtureCorpus {
    structure: ApplicationStructure;
    cases: NavigationFixtureCase[];
}

/** Loads one of the shared navigation corpora the C# and TypeScript engines are asserted against. */
export function loadNavigationCorpus(file: string): NavigationFixtureCorpus {
    const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../../', file), 'utf-8')) as NavigationFixtureCorpus;
    corpus.cases.forEach(fixture => { fixture.structure ??= corpus.structure; });
    return corpus;
}

function ScreenText({ element }: RegisteredComponentProps) {
    return <span data-screen={element.id}>{String(element.properties.text ?? element.id)}</span>;
}

/** A screen that declares outlets: its `core:outlet` elements are its content, as on a page with a side panel. */
function ScreenWithOutlets({ element, slots }: RegisteredComponentProps) {
    return <section data-screen={element.id}>{String(element.id)}{slots.content}</section>;
}

export const registry = { 'test:text': ScreenText, 'test:page': ScreenWithOutlets, 'core:outlet': CoreOutlet };

const element = (id: string, componentName: string, properties: Record<string, unknown> = {}, content: SceneElement[] = []) =>
    ({ id, componentName, properties, slots: content.length > 0 ? { content } : {} }) as unknown as SceneElement;

/** One screen per feature of the structure, named by the feature's qualified id; `outlets` names the outlets each screen declares. */
export function screensOf(structure: ApplicationStructure, outlets: Record<string, string[]> = {}): Record<string, SceneElement> {
    const screens: Record<string, SceneElement> = {};
    const visit = (prefix: string, features: ApplicationStructure['modules'][number]['features']) => {
        for (const feature of features) {
            const id = `${prefix}.${feature.id}`;
            screens[id] = outlets[id] ? element(id, 'test:page', {}, outlets[id].map(name => element(`${id}.${name}`, 'core:outlet', { name }))) : element(id, 'test:text');
            visit(id, feature.features ?? []);
        }
    };
    structure.modules.forEach(module => visit(module.id, module.features));
    return screens;
}

export interface NavigationApplicationProps {
    structure: ApplicationStructure;
    navigation: NavigationModel;
    initialScreen: string;
    regions?: Partial<NavigationRegionViewProps>[];
    outlets?: Record<string, string[]>;
    isVisible?(item: EffectiveNavItem): boolean;
    frame?(content: ReactNode): ReactNode;
}

/** An application host: every feature a screen, the regions of `regions` as its chrome, the content in the primary outlet. */
export function NavigationApplication({ structure, navigation, initialScreen, regions = [{ region: NavigationRegionKind.Topbar }, { region: NavigationRegionKind.Sidebar }], outlets, isVisible }: NavigationApplicationProps) {
    const model: SceneNavigationModel = { structure: new ApplicationStructureIndex(structure), navigation, ...(isVisible ? { isVisible } : {}) };
    return <SceneNavigationHost navigationModel={model} screens={screensOf(structure, outlets)} initialScreen={initialScreen} registry={registry}
        frame={content => <div data-frame>
            {regions.map((props, position) => <NavigationRegionView key={position} {...props as NavigationRegionViewProps} />)}
            <main>{content}</main>
        </div>} />;
}
