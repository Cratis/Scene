// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Every word the design system editor shows. The host supplies them from its resource file; the editor package has no language of
// its own, and English defaults ship in `defaultDesignSystemEditorStrings`. A `{name}` in a string is filled in by the editor.

/** The words of what is decided about a conflict in the sources a design system was established from. */
export interface DesignSystemConflictStrings {
    title: string;
    allDecided: string;
    // `{count}` is how many conflicts wait.
    waitingOne: string;
    waitingMany: string;
    kindColor: string;
    kindCorner: string;
    // `{person}` is who decided.
    decidedBy: string;
    // `{count}` is how many times a value is used.
    usedOnce: string;
    usedManyTimes: string;
    kept: string;
    // `{value}` is the value kept.
    keep: string;
    issueRaised: string;
    // `{count}` is how many places still use the value that was given up.
    raiseIssue: string;
    // `{value}` is the value kept.
    keptNotice: string;
    raisedNotice: string;
}

/** The words of what the designs have outside the design system. */
export interface DesignSystemStandardStrings {
    title: string;
    description: string;
    overviewDescription: string;
    noStandardTitle: string;
    noStandardDescription: string;
    loading: string;
    allKeptTitle: string;
    allKeptDescription: string;
    list: string;
    kindColor: string;
    kindToken: string;
    kindComponent: string;
    // `{count}` is how many times, `{where}` the screens.
    usedIn: string;
    usedOnceIn: string;
    // `{suggestion}` is the token to use instead.
    theSystemHas: string;
    fixInAnIssue: string;
    useToken: string;
    proposeToSystem: string;
    // `{count}` is how many values.
    fixAll: string;
    // `{value}` is the value.
    issueTitleOne: string;
    // `{count}` is how many values.
    issueTitleMany: string;
    raisedNotice: string;
    // `{count}` is how many values are outside the design system.
    summaryOne: string;
    summaryMany: string;
    summaryNone: string;
    summaryReading: string;
    seeWhatToFix: string;
}

/** The words of how the draft looks on the screens beside the active version. */
export interface DesignSystemPreviewStrings {
    title: string;
    description: string;
    draw: string;
    drawAgain: string;
    light: string;
    dark: string;
    drawing: string;
    unavailable: string;
    failed: string;
    noScreens: string;
    screens: string;
    breaks: string;
    differs: string;
    same: string;
    active: string;
    draft: string;
    notDrawn: string;
    // `{screen}`, `{version}` and `{mode}`.
    imageAlt: string;
    // `{count}` is how many screens look different, `{total}` how many there are.
    differentOne: string;
    differentMany: string;
    differentNone: string;
    // `{count}` is how many break.
    breaksOne: string;
    breaksMany: string;
    breaksNone: string;
}

export interface DesignSystemEditorStrings {
    title: string;
    description: string;
    loading: string;
    loadFailed: string;
    retry: string;

    noDesignSystemTitle: string;
    noDesignSystemDescription: string;
    unreadableTitle: string;
    unreadableDescription: string;

    navigationLabel: string;
    groups: {
        foundations: string;
        themes: string;
        components: string;
        screenplay: string;
        words: string;
        standard: string;
        draft: string;
    };
    sections: {
        overview: string;
        color: string;
        type: string;
        spacing: string;
        elevation: string;
        themes: string;
        components: string;
        screenplay: string;
        words: string;
        standard: string;
        changes: string;
    };

    banner: {
        // `{version}` is the version number.
        goldenStandard: string;
        none: string;
        // `{version}`, `{author}`.
        draft: string;
        // `{person}` is who submitted it.
        waitingForReview: string;
        versionShown: string;
        active: string;
        draftVersion: string;
        theme: string;
        mode: string;
        openDraft: string;
        startDraft: string;
        startFromStarter: string;
    };

    // The questions asked before a decision is made, and what is said once it is.
    prompts: {
        startDraft: { title: string; message: string };
        startFromStarter: { title: string; message: string };
        // `{version}` is the draft's number.
        discard: { title: string; message: string };
        activate: { title: string; message: string };
        yes: string;
        no: string;
    };
    outcomes: {
        started: string;
        // `{version}` is the draft's number.
        discarded: string;
        submitted: string;
        activated: string;
        saveFailed: string;
        failed: string;
    };

    overview: {
        tokens: string;
        themes: string;
        components: string;
        layouts: string;
        screenTemplates: string;
        words: string;
        hardToRead: string;
        colorTitle: string;
        // `{theme}` and `{mode}`.
        colorDescription: string;
        noColors: string;
        typeTitle: string;
        typeDescription: string;
        noType: string;
        componentsTitle: string;
        componentsDescription: string;
        structureTitle: string;
        structureDescription: string;
        sourceTitle: string;
        sourceDescription: string;
        copy: string;
        copied: string;
        sourceLabel: string;
        missing: string;
        // `{name}` is the token, `{value}` what it is.
        swatchLabel: string;
    };

    foundations: {
        color: { title: string; description: string };
        type: { title: string; description: string };
        spacing: { title: string; description: string };
        elevation: { title: string; description: string };
        // `{title}` is the foundation's title in lower case.
        emptyTitle: string;
        emptyEditable: string;
        emptyReadOnly: string;
        noValue: string;
        // `{token}` is the token's address.
        valueOf: string;
    };

    tokenEntry: {
        name: string;
        namePlaceholder: string;
        whatItIsFor: string;
        whatItIsForPlaceholder: string;
        value: string;
        valuePlaceholder: string;
        add: string;
    };

    themes: {
        title: string;
        description: string;
        isDefault: string;
        shown: string;
        hardToRead: string;
        // `{count}` is how many values could not be resolved.
        unresolved: string;
        show: string;
        makeDefault: string;
        remove: string;
        newName: string;
        newPlaceholder: string;
        // `{source}` is the theme the new one is copied from.
        addAsCopy: string;
    };

    components: {
        // `{theme}` is the theme.
        title: string;
        componentLabel: string;
        description: string;
        emptyTitle: string;
        emptyEditable: string;
        emptyReadOnly: string;
        noVariants: string;
        variant: string;
        edit: string;
        editByHand: string;
        // `{component}` and `{variant}`.
        editLabel: string;
        tooLow: string;
        whereUsedTitle: string;
        // `{component}` is the component.
        whereUsedDescription: string;
        whereUsedNone: string;
        whereUsedLabel: string;
        // `{component}` and `{variant}`.
        editingTitle: string;
        editingDescription: string;
        state: string;
        pickAToken: string;
        done: string;
        // `{part}`, `{component}`, `{variant}`.
        partLabel: string;
    };

    words: {
        voiceTitle: string;
        voiceDescription: string;
        namingTitle: string;
        namingDescription: string;
        // `{title}` is the group's title in lower case.
        emptyTitle: string;
        emptyEditable: string;
        emptyReadOnly: string;
        text: string;
        // `{kind}` and `{key}`.
        textOf: string;
    };

    screenplay: {
        profileTitle: string;
        profileDescription: string;
        profile: string;
        theme: string;
        rootTemplate: string;
        platforms: string;
        packages: string;
        layouts: string;
        screenTemplates: string;
        dialogTemplates: string;
        none: string;
        // `{version}` is the version number.
        sourceTitle: string;
        sourceDescription: string;
        // `{file}` is the file's name.
        download: string;
    };

    changes: {
        // `{version}`.
        title: string;
        // `{against}` and `{authors}`.
        description: string;
        againstActive: string;
        againstNothing: string;
        nobody: string;
        emptyTitle: string;
        emptyDescription: string;
        added: string;
        removed: string;
        changed: string;
        layout: string;
        screenTemplate: string;
        reviewTitle: string;
        reviewDescription: string;
        submit: string;
        // `{version}`.
        activate: string;
        discard: string;
        youWroteIt: string;
        // `{person}`.
        waitingFor: string;
    };

    conflicts: DesignSystemConflictStrings;
    standard: DesignSystemStandardStrings;
    preview: DesignSystemPreviewStrings;
}
