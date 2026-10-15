// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Where a file is in being uploaded. */
export enum UploadStatus {
    Queued = 'queued',
    Uploading = 'uploading',
    Done = 'done',
    Failed = 'failed',
}

/** The rules a selection is checked against before anything is sent. */
export interface UploadRules {
    /** A comma-separated `accept` list: extensions (`.pdf`), MIME types (`image/png`) and wildcards (`image/*`). */
    accept: string;
    maximumBytes: number;
    multiple: boolean;
}

/** What the checker needs of a file. */
export interface SelectedFile {
    name: string;
    size: number;
    type: string;
}

/** Why a file was refused. */
export enum UploadRefusal {
    WrongType = 'wrongType',
    TooLarge = 'tooLarge',
    Single = 'single',
}

/** Whether a file matches an `accept` list; an empty list accepts everything, and matching ignores case. */
export function matchesAccept(file: SelectedFile, accept: string): boolean {
    const patterns = accept.split(',').map(pattern => pattern.trim().toLowerCase()).filter(pattern => pattern.length > 0);
    if (patterns.length === 0) return true;

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return patterns.some(pattern => pattern.startsWith('.') ? name.endsWith(pattern) : pattern.endsWith('/*') ? type.startsWith(pattern.slice(0, -1)) : type === pattern);
}

/** Sorts a selection into the files to take and the reasons for refusing the others. Only the first is taken when one file is allowed. */
export function checkSelection<T extends SelectedFile>(files: T[], rules: UploadRules, alreadySelected = 0): { accepted: T[]; refused: { file: T; reason: UploadRefusal }[] } {
    const accepted: T[] = [];
    const refused: { file: T; reason: UploadRefusal }[] = [];

    for (const file of files) {
        if (!matchesAccept(file, rules.accept)) refused.push({ file, reason: UploadRefusal.WrongType });
        else if (rules.maximumBytes > 0 && file.size > rules.maximumBytes) refused.push({ file, reason: UploadRefusal.TooLarge });
        else if (!rules.multiple && alreadySelected + accepted.length >= 1) refused.push({ file, reason: UploadRefusal.Single });
        else accepted.push(file);
    }

    return { accepted, refused };
}

/** A file size in the largest unit that keeps it under 1024, for the locale. */
export function formatBytes(bytes: number, locale: string): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; }
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: unit === 0 ? 0 : 1 }).format(value)} ${units[unit]}`;
}
