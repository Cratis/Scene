// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';

/** How a number is presented. */
export enum NumberFormat {
    Number = 'number',
    Currency = 'currency',
    Percent = 'percent',
    Compact = 'compact',
}

/**
 * The locale a component formats dates, numbers and currency in: the element's `locale`, else the document language, else the
 * runtime's. Formatting never goes through a fixed locale, so the same screen reads correctly in every one.
 */
export function readLocale(element: ExternalComponent): string {
    const supplied = element.properties.locale;
    if (typeof supplied === 'string' && supplied.length > 0) return supplied;
    if (typeof document !== 'undefined' && document.documentElement.lang) return document.documentElement.lang;
    return typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en';
}

/** Whether the locale reads right to left, so a component can mirror what direction-sensitive CSS cannot. */
export function isRightToLeft(locale: string): boolean {
    try {
        const info = new Intl.Locale(locale) as Intl.Locale & { getTextInfo?: () => { direction: string }; textInfo?: { direction: string } };
        const direction = info.getTextInfo?.().direction ?? info.textInfo?.direction;
        return direction === 'rtl';
    } catch {
        return false;
    }
}

/** Formats a number for a locale, as a plain number, currency, percent (the value is the percentage, 12.5 is 12.5%) or compact. */
export function formatNumber(value: number, locale: string, format: NumberFormat = NumberFormat.Number, currency = 'USD', maximumFractionDigits?: number): string {
    try {
        switch (format) {
            case NumberFormat.Currency:
                return new Intl.NumberFormat(locale, { style: 'currency', currency, ...(maximumFractionDigits === undefined ? {} : { maximumFractionDigits }) }).format(value);
            case NumberFormat.Percent:
                return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: maximumFractionDigits ?? 1 }).format(value / 100);
            case NumberFormat.Compact:
                return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: maximumFractionDigits ?? 1 }).format(value);
            default:
                return new Intl.NumberFormat(locale, { maximumFractionDigits: maximumFractionDigits ?? 2 }).format(value);
        }
    } catch {
        return String(value);
    }
}

/** Reads a number format name, defaulting to a plain number. */
export function readNumberFormat(element: ExternalComponent, property = 'format'): NumberFormat {
    const value = element.properties[property];
    return (Object.values(NumberFormat) as string[]).includes(value as string) ? (value as NumberFormat) : NumberFormat.Number;
}

/** Formats a date or an ISO 8601 date-time for a locale; a value that is not a date is returned as it was written. */
export function formatDate(value: unknown, locale: string, withTime = false): string {
    const date = value instanceof Date ? value : typeof value === 'string' || typeof value === 'number' ? new Date(value) : undefined;
    if (!date || Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '';
    try {
        return new Intl.DateTimeFormat(locale, withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(date);
    } catch {
        return date.toISOString();
    }
}

/** Formats a calendar day (`YYYY-MM-DD`) for a locale, as that day and never shifted by the reader's time zone. */
export function formatDay(day: string, locale: string): string {
    try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));
    } catch {
        return day;
    }
}
