// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// How the screens of one role's Scene document are named in Screenplay. The editor's own screen ('Screen') is named after
/// the role, so a role is read back from its screen's name; every other screen of the document is the role's name, a
/// separator and the Scene screen's name.
/// </summary>
public sealed class SceneScreenNames
{
    public const string PrimarySceneScreen = "Screen";
    public const string Separator = "__";

    readonly Dictionary<string, string> _toScreenplay = [with(StringComparer.Ordinal)];
    readonly Dictionary<string, string> _toScene = [with(StringComparer.Ordinal)];
    readonly HashSet<string> _elementIds = [with(StringComparer.Ordinal)];

    /// <summary>
    /// A document whose screens were written in Screenplay under names of their own - not as the screens of a role the document declares - keeps each
    /// name as it was written, so what is exported is what was imported. Its screens belong to no role of their own.
    /// </summary>
    public SceneScreenNames(string role, IEnumerable<string> sceneScreens, bool verbatim = false)
    {
        Role = role;
        Verbatim = verbatim;
        foreach (var scene in sceneScreens.Distinct(StringComparer.Ordinal))
        {
            var screenplay = verbatim ? scene : ScreenplayName(role, scene);
            _toScreenplay[scene] = screenplay;
            _toScene[screenplay] = scene;
        }
    }

    /// <summary>
    /// A document of screens that were written under names of their own, with the Scene name each one has. The first screen is the one the screen
    /// editor opens - the editor's own screen is always called 'Screen' - so it takes that name and the document remembers the one it was written with.
    /// </summary>
    SceneScreenNames(IEnumerable<KeyValuePair<string, string>> sceneToScreenplay)
    {
        Role = string.Empty;
        Verbatim = true;
        foreach (var (scene, screenplay) in sceneToScreenplay)
        {
            _toScreenplay[scene] = screenplay;
            _toScene[screenplay] = scene;
        }
    }

    public string Role { get; }

    public bool Verbatim { get; }

    /// <summary>
    /// The Scene name of each screen of a document written under names of its own, and the name it was written with.
    /// </summary>
    public IReadOnlyDictionary<string, string> Pairs => _toScreenplay;

    public static SceneScreenNames OfOwnScreens(IEnumerable<string> screenplayScreens)
    {
        var written = screenplayScreens.Distinct(StringComparer.Ordinal).ToArray();
        var renameFirst = written.Length > 0 && !written.Contains(PrimarySceneScreen, StringComparer.Ordinal);
        return new(written.Select((name, index) => KeyValuePair.Create(renameFirst && index == 0 ? PrimarySceneScreen : name, name)));
    }

    /// <summary>
    /// The names a document keeps that says its screens were written under names of their own: the pairs it stored, or - in a document
    /// stored before the pairs were - each screen under the name it was written with.
    /// </summary>
    public static SceneScreenNames FromPairs(IEnumerable<KeyValuePair<string, string>> pairs) => new(pairs);

    public static string ScreenplayName(string role, string sceneScreen) =>
        sceneScreen == PrimarySceneScreen ? role : role + Separator + sceneScreen;

    public static string RoleOf(string screenplayScreen)
    {
        var separator = screenplayScreen.IndexOf(Separator, StringComparison.Ordinal);
        return separator > 0 ? screenplayScreen[..separator] : screenplayScreen;
    }

    public static string SceneNameOf(string screenplayScreen)
    {
        var separator = screenplayScreen.IndexOf(Separator, StringComparison.Ordinal);
        return separator > 0 ? screenplayScreen[(separator + Separator.Length)..] : PrimarySceneScreen;
    }

    public static SceneScreenNames ForScreenplay(string role, IEnumerable<string> screenplayScreens, bool verbatim = false) =>
        new(role, verbatim ? screenplayScreens : screenplayScreens.Select(SceneNameOf), verbatim);

    /// <summary>
    /// Whether the Screenplay screen is one of the screens of this document.
    /// </summary>
    public bool Owns(string screenplayScreen) => Verbatim ? _toScene.ContainsKey(screenplayScreen) : RoleOf(screenplayScreen) == Role;

    /// <summary>
    /// The name of the Scene screen a Screenplay screen of this document is.
    /// </summary>
    public string SceneNameFor(string screenplayScreen) => Verbatim ? _toScene.GetValueOrDefault(screenplayScreen, screenplayScreen) : SceneNameOf(screenplayScreen);

    /// <summary>
    /// The name the Screenplay gives a Scene screen of this document.
    /// </summary>
    public string ScreenplayNameFor(string sceneScreen) => Verbatim ? _toScreenplay.GetValueOrDefault(sceneScreen, sceneScreen) : ScreenplayName(Role, sceneScreen);

    public string ToScreenplay(string sceneScreen) => _toScreenplay.GetValueOrDefault(sceneScreen, sceneScreen);

    public string ToScene(string screenplayScreen) => _toScene.GetValueOrDefault(screenplayScreen, screenplayScreen);

    /// <summary>
    /// An id for a Scene element made from a Screenplay directive that has no name of its own (a title, a data binding, a table, a
    /// summary), unique among the ids this document has handed out. The same document always yields the same ids in the same order.
    /// </summary>
    public string UniqueElementId(string candidate)
    {
        var unique = candidate;
        for (var suffix = 2; !_elementIds.Add(unique); suffix++)
        {
            unique = $"{candidate}-{suffix}";
        }

        return unique;
    }
}
