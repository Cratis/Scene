// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// The value pools generated sample data draws from, per locale. Identical to the TypeScript engine's pools
/// (<c language="csharp">sampleLocales.ts</c>): the shared corpus asserts the generated rows of both byte for byte.
/// </summary>
public static class SampleLocales
{
    /// <summary>The locale used when a tag matches no pool.</summary>
    public const string DefaultLocale = "en-GB";

    static readonly string[] _englishWords = ["review", "quarterly", "update", "invoice", "customer", "delivery", "schedule", "renewal", "report", "follow", "up", "meeting"];

    static readonly Dictionary<string, SampleLocale> _locales = new()
    {
        ["en-GB"] = new SampleLocale(
            ["Oliver", "Amelia", "George", "Isla", "Harry", "Ava", "Jack", "Freya", "Arthur", "Poppy"],
            ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Evans", "Thomas", "Roberts", "Walker", "Wright"],
            ["Northgate Ltd", "Albion Supplies Ltd", "Thames Logistics Ltd", "Pennine Foods Ltd", "Harbour Digital Ltd", "Cotswold Tools Ltd"],
            ["London", "Manchester", "Leeds", "Bristol", "Glasgow", "Cardiff", "Sheffield", "Newcastle"],
            ["example.co.uk", "example.org.uk", "sample.co.uk"],
            "+44 7### ######",
            _englishWords),
        ["en-US"] = new SampleLocale(
            ["James", "Emma", "Michael", "Olivia", "William", "Sophia", "Benjamin", "Mia", "Henry", "Grace"],
            ["Johnson", "Miller", "Davis", "Garcia", "Anderson", "Martin", "Clark", "Lewis", "Young", "Hall"],
            ["Summit Supply Inc", "Bluebird Software Inc", "Redwood Freight Inc", "Lakeside Foods Inc", "Cardinal Tools Inc", "Pioneer Digital Inc"],
            ["New York", "Chicago", "Austin", "Seattle", "Denver", "Boston", "Atlanta", "Portland"],
            ["example.com", "example.net", "sample.com"],
            "+1 (555) ###-####",
            _englishWords),
        ["nb-NO"] = new SampleLocale(
            ["Lars", "Ingrid", "Ola", "Kari", "Henrik", "Sigrid", "Magnus", "Åse", "Bjørn", "Mari"],
            ["Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Pedersen", "Nilsen", "Kristiansen", "Berg", "Haugen"],
            ["Fjordline AS", "Nordlys Handel AS", "Fjellvik Maskin AS", "Bergen Logistikk AS", "Havbruk Partner AS", "Skagerrak Digital AS"],
            ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø", "Drammen", "Kristiansand", "Ålesund"],
            ["eksempel.no", "prove.no", "demo.no"],
            "+47 9## ## ###",
            ["gjennomgang", "kvartal", "oppdatering", "faktura", "kunde", "levering", "avtale", "fornyelse", "rapport", "oppfølging", "møte", "bestilling"]),
        ["sv-SE"] = new SampleLocale(
            ["Erik", "Astrid", "Lars", "Maja", "Anders", "Elsa", "Johan", "Linnéa", "Gustav", "Åsa"],
            ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson"],
            ["Norrlands Handel AB", "Östersund Teknik AB", "Göta Logistik AB", "Skärgården Livs AB", "Malmö Digital AB", "Vättern Verktyg AB"],
            ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Umeå"],
            ["exempel.se", "prov.se", "demo.se"],
            "+46 70 ### ## ##",
            ["granskning", "kvartal", "uppdatering", "faktura", "kund", "leverans", "avtal", "förnyelse", "rapport", "uppföljning", "möte", "beställning"]),
        ["de-DE"] = new SampleLocale(
            ["Lukas", "Anna", "Felix", "Marie", "Jonas", "Sophie", "Maximilian", "Lena", "Paul", "Jördis"],
            ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann"],
            ["Rheinwerk GmbH", "Nordsee Handel GmbH", "Isar Logistik GmbH", "Schwarzwald Technik GmbH", "Elbe Digital GmbH", "Bayern Werkzeug GmbH"],
            ["Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig"],
            ["beispiel.de", "muster.de", "demo.de"],
            "+49 151 ########",
            ["prüfung", "quartal", "aktualisierung", "rechnung", "kunde", "lieferung", "vertrag", "verlängerung", "bericht", "nachfassen", "termin", "bestellung"]),
    };

    static readonly Dictionary<string, string> _languageDefaults = new()
    {
        ["en"] = "en-GB",
        ["nb"] = "nb-NO",
        ["nn"] = "nb-NO",
        ["no"] = "nb-NO",
        ["sv"] = "sv-SE",
        ["de"] = "de-DE"
    };

    /// <summary>
    /// The locale tags that have their own pools.
    /// </summary>
    public static IReadOnlyList<string> Tags { get; } = [.. _locales.Keys];

    /// <summary>
    /// Resolves a BCP 47 tag to a pool: the exact tag (language lower case, region upper case), else the language's default pool,
    /// else <see cref="DefaultLocale"/>.
    /// </summary>
    /// <param name="tag">The locale tag, or null.</param>
    /// <returns>The pool.</returns>
    public static SampleLocale For(string? tag)
    {
        var parts = (tag ?? string.Empty).Trim().Split('-');
        var language = parts[0].ToLowerInvariant();
        var region = parts.Length > 1 ? parts[1].ToUpperInvariant() : string.Empty;
        if (region.Length > 0 && _locales.TryGetValue($"{language}-{region}", out var exact))
        {
            return exact;
        }

        return _locales[_languageDefaults.TryGetValue(language, out var fallback) ? fallback : DefaultLocale];
    }
}
