// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

/** A data element of a screen: the query it reads, the read model it yields and whether that is a collection. */
export interface PreviewDataSource {
    readonly query: string;
    readonly typeName: string;
    readonly isCollection: boolean;
}

/** A column or a field of a table or a summary: the property it shows and the label it carries. */
export interface PreviewDataField {
    readonly property: string;
    readonly label: string;
}

/**
 * Every data element of the screens: the pairs of a query and the read model it yields that the tables and summaries of the preview read their rows by.
 *
 * @param content Anything that holds screens.
 * @returns The data sources, in the order they are met.
 */
export function previewDataSourcesOf(content: unknown): PreviewDataSource[] {
    const found: PreviewDataSource[] = [];
    const visit = (candidate: unknown): void => {
        if (Array.isArray(candidate)) {
            candidate.forEach(visit);
            return;
        }

        if (!isRecord(candidate)) return;
        const properties = candidate.properties;
        if (typeof candidate.componentName === 'string' && /(^|:)data$/.test(candidate.componentName) && isRecord(properties)
            && typeof properties.query === 'string' && properties.query.length > 0 && typeof properties.typeName === 'string' && properties.typeName.length > 0) {
            found.push({ query: properties.query, typeName: properties.typeName, isCollection: properties.isCollection === true });
        }

        Object.values(candidate).forEach(visit);
    };

    visit(content);
    return found;
}

/**
 * The query a table or a summary of a read model reads its rows from: the one whose data element yields the same read model, a collection for a table and a
 * single record for a summary, and the other kind when the screen has only that one.
 *
 * @param sources The data sources of the screens.
 * @param typeName The read model the table or summary shows.
 * @param wantsCollection Whether it is a table, which shows many rows.
 * @returns The name of the query, or `undefined` when no data element yields that read model.
 */
export function queryOfTypeName(sources: readonly PreviewDataSource[], typeName: string, wantsCollection: boolean): string | undefined {
    const own = sources.filter(source => source.typeName === typeName);
    return (own.find(source => source.isCollection === wantsCollection) ?? own[0])?.query;
}

/**
 * The rows a query's sample data answers, each a plain record.
 *
 * @param result What the render scope holds for the query.
 * @returns The rows; none when the query has no sample data.
 */
export function rowsOfQueryResult(result: unknown): Record<string, unknown>[] {
    if (Array.isArray(result)) return result.filter(isRecord);
    return isRecord(result) ? [result] : [];
}

/**
 * How a value reads in a cell: the text itself, a number as it is, a flag as yes or no, and what is nested as its JSON.
 *
 * @param value The value of the property in a row.
 * @returns The text to show.
 */
export function cellText(value: unknown): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

/**
 * The columns or fields an element carries in one of its slots, in the order they are written.
 *
 * @param element The table or the summary.
 * @param slot The slot that holds them: `columns` or `fields`.
 * @returns The properties and their labels; a label that was not written is the property.
 */
export function previewFieldsOf(element: { slots?: Record<string, readonly unknown[]> }, slot: string): PreviewDataField[] {
    return (element.slots?.[slot] ?? []).filter(isRecord).flatMap(child => {
        const properties = child.properties;
        if (!isRecord(properties) || typeof properties.property !== 'string') return [];
        return [{ property: properties.property, label: typeof properties.label === 'string' && properties.label.length > 0 ? properties.label : properties.property }];
    });
}

/** A binding to a value: a path read from the row of a table (`item.orderId`), or from anywhere else the host can resolve. */
export interface PreviewBinding {
    readonly path?: string;
}

/**
 * How the bindings of an interaction on a row resolve: `item.<field>` is the field of that row - `with orderId from item.orderId` hands the order the person
 * double clicked to the screen it opens - and everything else resolves as it does outside the row.
 *
 * @param row The row.
 * @param outer How a binding resolves outside the row.
 * @returns The resolver for the row.
 */
export function resolveInRow<TBinding extends PreviewBinding>(row: Record<string, unknown>, outer: (binding: TBinding) => unknown): (binding: TBinding) => unknown {
    return binding => {
        const path = typeof binding.path === 'string' ? binding.path : undefined;
        if (path !== undefined && path.startsWith('item.')) {
            return path.slice('item.'.length).split('.').reduce<unknown>((current, segment) => isRecord(current) ? current[segment] : undefined, row);
        }

        return outer(binding);
    };
}

/** What the preview does for the actions a row can start: it goes to the screen, and does nothing else - there is no backend behind a preview. */
export interface PreviewNavigator {
    navigate(destination: { screen: string }): unknown;
}

/**
 * The seam the interactions of a table row run through in the preview. Navigating is the one effect a preview has; a command, a dialog and the rest
 * answer as if nothing happened, because nothing is sent from a preview.
 *
 * @param navigator Where the preview goes when a row says to open a screen, or `undefined` outside a preview.
 * @returns The dispatcher.
 */
export function previewRowDispatcher(navigator: PreviewNavigator | undefined) {
    return {
        executeCommand: async () => ({ isSuccess: true }),
        navigate: (screen: string): void => { navigator?.navigate({ screen }); },
        navigateBack: (): void => undefined,
        openDialog: async () => ({ isConfirmed: false }),
        closeDialog: (): void => undefined,
        refreshQuery: async (): Promise<void> => undefined,
        setState: (): void => undefined,
        notify: (): void => undefined,
        confirm: async () => true,
        raise: async (): Promise<void> => undefined,
    };
}
