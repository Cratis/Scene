// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge.given;

// A screen the editor wrote with a toolbar item whose presentation - what it shows and where a host places it - was authored in the Properties tab,
// which stores Scene's own shape: `presentation: { mode, placement }` among the element's properties.
public class a_scene_document_with_a_toolbar_item : a_scene_document_transport
{
    protected const string Document = """
        {
          "layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],
          "screenTemplates":[],
          "dialogTemplates":[],
          "screens":[{
            "name":"Screen",
            "layout":"StudioScreen",
            "slotContent":{"content":[{
              "id":"screen-root","name":"Screen root",
              "visibility":"Visible","isEnabled":true,"opacity":1,"size":{},"zIndex":0,"minimumSize":{},"maximumSize":{},
              "margin":{"left":0,"top":0,"right":0,"bottom":0},"horizontalAlignment":"Stretch","verticalAlignment":"Stretch",
              "properties":{},
              "orientation":"Vertical","spacing":8,
              "children":[
                {"id":"refresh-item","name":"Refresh","componentName":"core:toolbarItem","properties":{"kind":"Action","label":"Refresh","presentation":{"mode":"icon","placement":"primary"}},"slots":{}}
              ]
            }]},
            "forms":[],
            "contributions":[]
          }],
          "exposures":[],
          "instanceContributions":[]
        }
        """;
}
