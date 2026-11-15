// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PackageGroupId } from '../UiProfile/PackageGroupId';
import type { TemplatePickerLabels } from '../TemplatePicker/TemplatePickerLabels';

// Every word the UI-profile designer shows. The host supplies them from its resource file; the editor package has no language of its own.
export interface UiProfileDesignerStrings {
    // `{application}` is the application's name.
    windowTitle: string;
    windowLabel: string;

    saveState: {
        saved: string;
        pending: string;
        saving: string;
        failed: string;
        retry: string;
    };

    undo: string;
    redo: string;
    undoNamed: string;
    redoNamed: string;
    design: string;
    preview: string;
    inspector: string;

    loading: string;
    loadFailed: string;
    retryLoad: string;


    nodes: {
        application: string;
        shell: string;
        theme: string;
        packages: string;
        sampleData: string;
    };

    // The edits, named for the history ("Undo <label>").
    edits: {
        colorScheme: string;
        accent: string;
        theme: string;
        name: string;
        newScreenTemplate: string;
        sizeClass: string;
        addPackage: string;
        removePackage: string;
        reorderPackages: string;
        offerTemplates: string;
        stopOfferingTemplates: string;
        shell: string;
        shellOptions: string;
        shellVersion: string;
        sampleData: string;
        sampleDataMapping: string;
        sampleDataBinding: string;
        logo: string;
        font: string;
        corners: string;
        menuMode: string;
        menuTheme: string;
    };

    properties: {
        nothingSelected: string;
        colorScheme: string;
        colorSchemeDescription: string;
        light: string;
        dark: string;
        accent: string;
        accentDescription: string;
        name: string;
        nameDescription: string;
        targetPlatform: string;
        targetPlatformDescription: string;
        web: string;
        sizeClass: string;
        sizeClassDescription: string;
        compact: string;
        regular: string;
        expanded: string;
        authoring: string;
        newScreensStartFrom: string;
        newScreensStartFromDescription: string;
        noNewScreenTemplate: string;
        unavailableTemplate: string;
        applicationTemplate: string;
        theme: string;
        themeDescription: string;
        themeIncompatible: string;
        activeSampleData: string;
        activeSampleDataDescription: string;
    };

    // The Sample data node.
    sampleDataSection: {
        generated: string;
        noShapes: string;
        mapped: string;
        manage: string;
        closeManage: string;
        previewWith: string;
        previewing: string;
        generatedName: string;
        resetPreview: string;
        overrideNote: string;
    };

    // The words of the template picker that chooses what new screens start from.
    templatePicker: TemplatePickerLabels;

    // The Packages node: one list in priority order, the catalog to add from and the answer to "who supplies this component?".
    packages: {
        hint: string;
        priority: string;
        roles: Record<PackageGroupId, string>;
        always: string;
        chosen: string;
        neededBy: string;
        shell: string;
        offersTemplates: string;
        raise: string;
        lower: string;
        orderKept: string;
        remove: string;
        fixed: string;
        stillRequired: string;
        cannotRemove: string;
        stopOfferingTemplates: string;
        add: string;
        catalogTitle: string;
        closeCatalog: string;
        filterAll: string;
        filterLabel: string;
        addNamed: string;
        alreadyNeeded: string;
        alreadyChosen: string;
        offerTemplates: string;
        isShell: string;
        resolver: {
            label: string;
            placeholder: string;
            supplied: string;
            overrides: string;
            notIncluded: string;
            unknown: string;
        };
    };


    problems: {
        none: string;
        heading: string;
        packageSelectionInvalid: string;
        packageMissing: string;
        packageVersionConflict: string;
        packageCycle: string;

        // `{readModel}` is the bound read model and `{pack}` the pack it is bound to.
        sampleDataBindingInvalidReadModel: string;
        sampleDataBindingUnknownReadModel: string;
        sampleDataBindingNoData: string;

        // `{name}` is the navigation entry whose target does not resolve.
        navTargetMissing: string;
        noShell: string;
        error: string;
        warning: string;
        goTo: string;
        onNode: string;
    };

    // What the designer says when there is nothing yet.
    firstRun: {
        heading: string;
    };

    canvas: {
        noScreen: string;
        sampleDataNote: string;
        region: string;
    };

    // The canvas's navigation: the *Showing* picker and the peek bar.
    navigation: {
        showing: string;

        // The picker's groups, by Scene's group name (Pages, States, Dialogs).
        groups: Record<string, string>;

        // `{name}` is the destination.
        peeking: string;
        openInEditor: string;
        back: string;

        // `{name}` is the entry that has no target.
        noTarget: string;

        // `{count}` is the number of problems.
        problems: string;
    };
    // The Shell node: the card of the shell in place, choosing another with a preview, and the options the shell offers.
    shell: {
        // Where the shell comes from.
        sourceOwn: string;
        sourceBlueprint: string;

        // `{blueprint}` is the blueprint's name.
        fromBlueprint: string;
        noShell: string;
        change: string;
        edit: string;
        editBlueprintCopy: string;
        create: string;

        // Where a new shell of the application's own starts from.
        start: {
            blank: string;
            copyOfCurrent: string;
            fromAppShell: string;
        };
        version: string;
        options: string;
        noOptions: string;

        // What the pin of a blueprint shell says. `{pin}` is the pin, `{version}` the blueprint's version.
        pin: {
            current: string;
            updateAvailable: string;
            updateBlockedByPin: string;
            notSatisfied: string;
            invalid: string;
            follow: string;
            exact: string;
            latest: string;
        };

        // The dialog that chooses another shell.
        dialog: {
            title: string;
            current: string;
            candidate: string;
            showing: string;
            useThis: string;
            cancel: string;
            usingTheShell: string;
            noChange: string;

            // What the browser says under its list: `{count}` templates are left out because they do not fit `{target}`.
            targetLabel: string;

            // `{blueprint}` is the blueprint that would be added.
            adds: string;
            previewLabel: string;

            // The remap table, shown only when screens place content where the new shell has no slot.
            remap: {
                heading: string;
                intro: string;
                slot: string;
                usedBy: string;
                choose: string;
                chosen: string;

                // `{slot}` is the primary slot, `{target}` the slot chosen.
                moveToPrimary: string;
                mapTo: string;
                drop: string;
                cannotApply: string;
            };

            // What the plan lists: where content goes and what stops the switch.
            plan: {
                heading: string;
                nothingMoves: string;
                blockers: string;
                warnings: string;
            };
        };

        // The edit, for "Undo <label>": `{name}` is the name of the shell.
        switched: string;
    };

    /** The words of the scrolling inspector, the stage, the status bar and the problems panel. */
    editor: {
        sections: {
            app: string;
            shell: string;
            look: string;
            menu: string;
            packages: string;
            sampleData: string;
        };
        sectionIntro: {
            app: string;
            shell: string;
            look: string;
            menu: string;
            packages: string;
            sampleData: string;
        };
        tabs: string;
        inspector: string;
        preview: string;
        stage: string;
        starter: {
            text: string;
            blueprint: string;
            ownShell: string;
            keep: string;
        };
        app: {
            name: string;
            nameHint: string;
            platform: string;
            platformHint: string;
            web: string;
            newScreens: string;
            newScreensHint: string;
            logo: string;
            logoHint: string;
            initials: string;
            initialsHint: string;
            icon: string;
            image: string;
            imageChoose: string;
            imageReplace: string;
            imageRemove: string;
            imageSet: string;
            imageNone: string;
            imageHint: string;
            showName: string;
            kinds: {
                initials: string;
                icon: string;
                image: string;
            };
            icons: {
                box: string;
                layers: string;
                home: string;
                users: string;
                receipt: string;
                package: string;
                database: string;
                palette: string;
            };
            imageTooLarge: string;
            imageUnsupported: string;
        };
        shell: {
            current: string;
            from: string;
            own: string;
            ownHint: string;
            ownPlaceholder: string;
            blueprints: string;
            version: string;
            versionHint: string;
            cardStarts: string;
            change: string;
            edit: string;
            create: string;
        };
        look: {
            scheme: string;
            schemeHint: string;
            light: string;
            dark: string;
            themes: string;
            themeCorners: string;
            themeNeeds: string;
            accent: string;
            accentHint: string;
            accentPlaceholder: string;
            accentColor: string;
            accentReset: string;
            font: string;
            fontHint: string;
            fontSample: string;
            corners: string;
            cornerSharp: string;
            cornerDefault: string;
            cornerRound: string;
            contrast: string;
            contrastGrade: {
                aaa: string;
                aa: string;
                largeTextOnly: string;
                fails: string;
            };
        };
        menu: {
            mode: string;
            modeHint: string;
            theme: string;
            themeHint: string;
            light: string;
            dark: string;
            primary: string;
        };
        packages: {
            order: string;
            up: string;
            down: string;
            remove: string;
            add: string;
            addNamed: string;
            adds: string;
            suppliers: string;
            supplier: string;
            overrides: string;
            noCollisions: string;
            locked: string;
            allAdded: string;
            resolverLabel: string;
            resolverPlaceholder: string;
            resolverUnknown: string;
        };
        sampleData: {
            pack: string;
            generic: string;
            production: string;
            preview: string;
            status: string;
            good: string;
            pending: string;
            bad: string;
            neutral: string;
        };
        header: {
            saved: string;
            saving: string;
            pending: string;
            failed: string;
            retry: string;
            undo: string;
            redo: string;
            undoNamed: string;
            redoNamed: string;
            desktop: string;
            mobile: string;
            device: string;
        };
        status: {
            ready: string;
            nothingYet: string;
            menuSetBy: string;
            themeMoved: string;
            problem: string;
            problems: string;
            noProblems: string;
            size: string;
            regime: string;
            pointer: string;
            touch: string;
            compactWidth: string;
            regularWidth: string;
            drawerNote: string;
            editing: string;
        };
        problems: {
            title: string;
            close: string;
            none: string;
            blocker: string;
            warning: string;
            info: string;
            goTo: string;
            fix: string;
            fixed: string;
            refused: string;
        };
        regions: {
            identity: string;
            shell: string;
            menu: string;
            content: string;
            accent: string;
        };
        chrome: {
            reducedMotion: string;
        };
    };
}
