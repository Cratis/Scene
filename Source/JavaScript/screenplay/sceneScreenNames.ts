// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The mirror of SceneScreenNames. The editor's own screen is always called 'Screen', so a role's primary screen is
// named after the role and every other screen of the document is the role, a separator and the Scene screen's name.
export const primarySceneScreen = 'Screen';
export const screenNameSeparator = '__';

export const screenplayNameOf = (role: string, sceneScreen: string): string =>
    sceneScreen === primarySceneScreen ? role : role + screenNameSeparator + sceneScreen;

export const roleOf = (screenplayScreen: string): string => {
    const separator = screenplayScreen.indexOf(screenNameSeparator);
    return separator > 0 ? screenplayScreen.slice(0, separator) : screenplayScreen;
};

export const sceneNameOf = (screenplayScreen: string): string => {
    const separator = screenplayScreen.indexOf(screenNameSeparator);
    return separator > 0 ? screenplayScreen.slice(separator + screenNameSeparator.length) : primarySceneScreen;
};

// The names one document's screens go by, and the ids it has handed out. The same document always yields the same
// ids in the same order, so a screen converted twice is the same document twice.
export class SceneScreenNames {
    readonly #toScreenplay = new Map<string, string>();
    readonly #toScene = new Map<string, string>();
    readonly #elementIds = new Set<string>();

    private constructor(readonly role: string, readonly verbatim: boolean, pairs: Iterable<readonly [string, string]>) {
        for (const [scene, screenplay] of pairs) {
            this.#toScreenplay.set(scene, screenplay);
            this.#toScene.set(screenplay, scene);
        }
    }

    // The names of a role's screens, from the Screenplay names they were written under.
    static forScreenplay(role: string, screenplayScreens: Iterable<string>): SceneScreenNames {
        const scenes = distinct([...screenplayScreens].map(sceneNameOf));
        return new SceneScreenNames(role, false, scenes.map(scene => [scene, screenplayNameOf(role, scene)] as const));
    }

    // The names of screens written under names of their own rather than a role's. The first one is the screen the
    // editor opens, so it takes the name 'Screen' unless a screen already has it.
    static ofOwnScreens(screenplayScreens: Iterable<string>): SceneScreenNames {
        const written = distinct([...screenplayScreens]);
        const renameFirst = written.length > 0 && !written.includes(primarySceneScreen);
        return new SceneScreenNames(
            '',
            true,
            written.map((name, index) => [renameFirst && index === 0 ? primarySceneScreen : name, name] as const));
    }

    toScreenplay(sceneScreen: string): string {
        return this.#toScreenplay.get(sceneScreen) ?? sceneScreen;
    }

    toScene(screenplayScreen: string): string {
        return this.#toScene.get(screenplayScreen) ?? screenplayScreen;
    }

    // An id for an element made from a directive that has no name of its own, unique among the ids this document
    // has handed out.
    uniqueElementId(candidate: string): string {
        let unique = candidate;
        for (let suffix = 2; this.#elementIds.has(unique); suffix++) {
            unique = `${candidate}-${suffix}`;
        }
        this.#elementIds.add(unique);
        return unique;
    }
}

const distinct = (values: string[]): string[] => [...new Set(values)];
