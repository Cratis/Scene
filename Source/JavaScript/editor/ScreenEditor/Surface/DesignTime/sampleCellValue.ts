// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What a table cell or a summary field of a read model shows on the surface before there is data: a plausible value for the property, chosen from its
// name, so the author sees a table with rows and not a heading over nothing. It is design-time content only - it is drawn, never written to the document.
const money = /(price|total|amount|cost|revenue|value|fee|sum|balance)$/i;
const date = /(date|at|on|time|from|until|expires|created|updated)$/i;
const count = /(count|quantity|qty|number|stock|size|lines|onhand|reserved|available|level|points)$/i;
const flag = /^(is|has|can|enabled|active|blocked|published)/i;
const text: Record<string, readonly string[]> = {
    status: ['Draft', 'Approved', 'Shipped'],
    name: ['Acme mug', 'Acme lamp', 'Acme chair'],
    title: ['Acme mug', 'Acme lamp', 'Acme chair'],
    email: ['ada@example.com', 'grace@example.com', 'linus@example.com'],
    sku: ['ACM-1000', 'ACM-1001', 'ACM-1002'],
    category: ['Kitchen', 'Lighting', 'Furniture'],
    currency: ['EUR', 'EUR', 'NOK'],
    market: ['Nordic', 'Nordic', 'DACH'],
    carrier: ['Posten', 'DHL', 'Posten'],
    supplier: ['Nordic Ceramics', 'Lumen AB', 'Oak & Co'],
    description: ['A sample description', 'Another description', 'One more description'],
};

export const sampleRows = 3;

/**
 * A sample value for a property of a read model.
 *
 * @param property The property name, as the table's column or the summary's field names it.
 * @param row Which sample row it is for, so the rows differ.
 * @returns The text to draw in the cell.
 */
export function sampleCellValue(property: string, row: number): string {
    const key = property.replace(/[^a-z0-9]/gi, '');
    const lower = key.toLowerCase();
    const known = Object.entries(text).find(([name]) => lower === name || lower.endsWith(name));
    if (known) return known[1][row % known[1].length];
    if (/id$/i.test(key)) return `${(1000 + row * 7).toString(16).padStart(4, '0')}-${(4100 + row).toString(16)}`;
    if (money.test(key)) return (49 + row * 30).toFixed(2);
    if (count.test(key)) return String(3 + row * 4);
    if (flag.test(key)) return row % 2 === 0 ? 'Yes' : 'No';
    if (date.test(key)) return `2026-10-${String(12 + row).padStart(2, '0')}`;
    return `${property} ${row + 1}`;
}
