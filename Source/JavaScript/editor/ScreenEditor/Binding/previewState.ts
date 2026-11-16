// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryBinding, QueryCandidate } from '@cratis/scene.model';

// What the preview of a data component shows, so an author is never looking at a blank area without knowing why.
export enum PreviewState {
    NoQuery = 'noQuery',
    MissingQuery = 'missingQuery',
    Loading = 'loading',
    Empty = 'empty',
    Error = 'error',
    Ready = 'ready',
}

export interface PreviewInput {
    binding?: QueryBinding;
    candidate?: QueryCandidate;
    isLoading: boolean;
    error?: unknown;
    rowCount?: number;
}

// Decides what a data component's preview is in, from what is known about its binding and its result.
export function previewState({ binding, candidate, isLoading, error, rowCount }: PreviewInput): PreviewState {
    if (!binding) return PreviewState.NoQuery;
    if (!candidate) return PreviewState.MissingQuery;
    if (error !== undefined && error !== null) return PreviewState.Error;
    if (isLoading) return PreviewState.Loading;
    return rowCount === 0 ? PreviewState.Empty : PreviewState.Ready;
}
