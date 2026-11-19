// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_ScreenDocumentCorpus;

// Where the committed corpus lives. Found by walking up from the running assembly to the repository root, so the
// specification reads the same file the TypeScript one does however it was started.
public static class CorpusFile
{
    public static string Path => System.IO.Path.Combine(Root(), ScreenDocumentCorpus.FileName);

    static string Root()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(System.IO.Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new InvalidOperationException("The repository root could not be found from the running assembly.");
    }
}
