// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { CSSProperties } from 'react';
import { isCanvas, isDockPanel, isGrid, isStackPanel, isWrapPanel } from '@cratis/scene.engine';
import { Dock, GridUnitType, Orientation } from '@cratis/scene.model';
import type { ColumnDefinition, GridLength, Panel, RowDefinition, SceneElement } from '@cratis/scene.model';

/**
 * Turns a panel into the CSS that arranges it, and a child into the CSS that places it inside one.
 *
 * The panels say what an arrangement *is*; this says what it looks like on the web. A second renderer -
 * native, desktop - answers the same question with its own platform's layout primitives, which is why
 * this lives in `Scene.React` rather than in the model or the engine.
 *
 * Where a panel needs to say something about an individual child - which grid cell, which edge - it does
 * so through that child's own `properties` bag, because the model has no attached properties of its own.
 * The keys are the ones the model's documentation names: `Grid.Row`, `Grid.Column`, `Grid.RowSpan`,
 * `Grid.ColumnSpan` and `Dock`.
 */

const track = (length: GridLength): string => {
    switch (length.unitType) {
        case GridUnitType.Auto: return 'auto';
        case GridUnitType.Absolute: return `${length.value}px`;
        case GridUnitType.Star: return `${length.value}fr`;
    }
};

const bound = (minimum: number, maximum: number, size: string): string =>
    minimum === 0 && !Number.isFinite(maximum)
        ? size
        : `minmax(${minimum}px, ${Number.isFinite(maximum) ? `${maximum}px` : size})`;

const rowTrack = (row: RowDefinition): string => bound(row.minimumHeight, row.maximumHeight, track(row.height));
const columnTrack = (column: ColumnDefinition): string => bound(column.minimumWidth, column.maximumWidth, track(column.width));

const number = (value: unknown): number | undefined => (typeof value === 'number' ? value : undefined);

/** The CSS that arranges a panel's own children. */
export function panelStyle(panel: Panel): CSSProperties | undefined {
    if (isCanvas(panel)) {
        // Absolutely placed children need a positioned ancestor to be placed against, and the canvas is
        // that ancestor rather than whatever happens to be above it.
        return {
            position: 'relative',
            width: panel.extent?.width ?? undefined,
            height: panel.extent?.height ?? undefined,
        };
    }

    if (isGrid(panel)) {
        return {
            display: 'grid',
            gridTemplateRows: panel.rows.map(rowTrack).join(' ') || undefined,
            gridTemplateColumns: panel.columns.map(columnTrack).join(' ') || undefined,
        };
    }

    if (isDockPanel(panel)) {
        // Docking has no single CSS primitive. A column of rows with a middle that grows is the shape a
        // dock panel actually produces, and `lastChildFill` decides whether the final child is that
        // middle or just another docked edge.
        return { display: 'flex', flexDirection: 'column' };
    }

    if (isStackPanel(panel)) {
        return {
            display: 'flex',
            flexDirection: panel.orientation === Orientation.Horizontal ? 'row' : 'column',
            gap: panel.spacing ? `${panel.spacing}px` : undefined,
        };
    }

    if (isWrapPanel(panel)) {
        return {
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: panel.orientation === Orientation.Horizontal ? 'row' : 'column',
        };
    }

    return undefined;
}

/** The CSS that places one child within its panel, or `undefined` when the panel places children implicitly. */
export function childStyle(panel: Panel, child: SceneElement, index: number): CSSProperties | undefined {
    const properties = child.properties ?? {};

    if (isCanvas(panel)) {
        const left = number(properties['Canvas.Left']);
        const top = number(properties['Canvas.Top']);
        const right = number(properties['Canvas.Right']);
        const bottom = number(properties['Canvas.Bottom']);
        // A child that names no edge is not placed by the canvas at all, so it keeps whatever flow the
        // renderer would otherwise have given it rather than being pinned to the origin.
        if (left === undefined && top === undefined && right === undefined && bottom === undefined) return undefined;
        return { position: 'absolute', left, top, right, bottom };
    }

    if (isGrid(panel)) {
        const row = number(properties['Grid.Row']);
        const column = number(properties['Grid.Column']);
        const rowSpan = number(properties['Grid.RowSpan']) ?? 1;
        const columnSpan = number(properties['Grid.ColumnSpan']) ?? 1;
        if (row === undefined && column === undefined) return undefined;
        return {
            gridRow: row === undefined ? undefined : `${row + 1} / span ${rowSpan}`,
            gridColumn: column === undefined ? undefined : `${column + 1} / span ${columnSpan}`,
        };
    }

    if (isDockPanel(panel)) {
        const dock = properties['Dock'] as Dock | undefined;
        const isFill = panel.lastChildFill && index === (panel.children?.length ?? 0) - 1;
        if (isFill) return { flex: '1 1 auto', minHeight: 0 };
        // Left and right dock along the cross axis of the column the panel lays out, so they become a row
        // of their own rather than a sibling in the column.
        return dock === Dock.Left || dock === Dock.Right
            ? { alignSelf: dock === Dock.Left ? 'flex-start' : 'flex-end', flex: '0 0 auto' }
            : { flex: '0 0 auto' };
    }

    if (isWrapPanel(panel)) {
        if (panel.itemWidth === undefined && panel.itemHeight === undefined) return undefined;
        return { width: panel.itemWidth, height: panel.itemHeight, flex: '0 0 auto' };
    }

    return undefined;
}
