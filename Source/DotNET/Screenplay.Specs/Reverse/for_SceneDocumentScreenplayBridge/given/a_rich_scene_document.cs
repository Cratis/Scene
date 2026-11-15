// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge.given;

// A screen as the editor writes it, using everything typed Screenplay can carry: exact ids that are not
// identifiers, literal properties of every JSON kind, every binding kind, behaviors with nested outcomes on components and
// the screen, and command forms with layout geometry or with fields placed on their own.
public class a_rich_scene_document : a_scene_document_transport
{
    protected const string RichDocument = """
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
                {"id":"orders-title","name":"Orders title","componentName":"core:title",
                 "properties":{
                   "text":"Orders \"today\"",
                   "level":2,
                   "ratio":0.5,
                   "visible":true,
                   "subtitle":null,
                   "tags":["urgent",3,false,null,[1.5]],
                   "options":{"dense":true,"size":{"width":3,"unit":"rem"}},
                   "label":{"path":"","kind":"literal","value":"Hello"},
                   "count":{"path":"total","kind":"queryResult","query":"AllOrders","mode":"oneWay","nullBehavior":"clear","expectedValueType":"number"},
                   "mirror":{"path":"selected","kind":"componentProperty","componentId":"orders-table","componentPropertyPath":"selected"},
                   "owner":{"path":"customer.name","mode":"twoWay","nullBehavior":"preserve"}
                 },
                 "slots":{},
                 "behaviors":[{"bindings":[{
                   "trigger":{"kind":"Click"},
                   "condition":{"path":"canSave"},
                   "actions":[{
                     "kind":"ExecuteCommand","command":"SaveOrder",
                     "arguments":[{"name":"orderId","value":{"path":"id"}}],
                     "onSuccess":[{"kind":"Notify","level":"Info","message":{"text":"Saved"}}],
                     "onFailure":[{"kind":"Notify","level":"Error","message":{"stringsKey":"saveFailed"}},{"kind":"Confirm","message":{"binding":{"path":"error.text"}}}]
                   }]
                 }]}]},
                {"id":"orders-table","name":"Order list","componentName":"core:table",
                 "properties":{"rows":{"path":"","kind":"queryResult","query":"AllOrders"}},
                 "context":{"path":"orders"},
                 "icon":"pi pi-table",
                 "presentation":{"variant":"striped"},
                 "exposes":{"selection":{"path":"selected.item"}},
                 "slots":{"columns":[
                   {"id":"number-column","name":"Number","componentName":"core:column","properties":{"property":"number","label":"Number"},"slots":{}},
                   {"id":"status-column","name":"Status","componentName":"core:column","properties":{"property":"status","label":"Status"},"slots":{}}
                 ]},
                 "behaviors":[
                   {"bindings":[{"trigger":{"kind":"Select"},"actions":[{"kind":"SetState","target":"selected","value":{"path":"id"}}]}]},
                   {"bindings":[{"trigger":{"eventName":"OrderPlaced"},"actions":[{"kind":"RefreshQuery","query":"AllOrders"}]}]},
                   {"bindings":[{"trigger":{"seconds":30},"actions":[{"kind":"RaiseTrigger","trigger":"Tick"}]}]},
                   {"bindings":[{"trigger":{"triggerName":"Tick"},"actions":[{"kind":"OpenDialog","dialogTemplate":"ConfirmDialog","onResult":[{"kind":"CloseDialog"}]},{"kind":"NavigateBack"}]}]}
                 ]}
              ]
            }]},
            "forms":[
              {"name":"OrderForm","forCommand":"SaveOrder",
               "populateSource":{"queryName":"OrderById","parameterBindings":{"orderId":{"path":"orderId"}}},
               "generationMode":"manual",
               "layout":{
                 "columns":[
                   {"index":1,"width":{"unit":"fraction","value":1},"minWidth":{"unit":"pixels","value":120},"maxWidth":{"unit":"percent","value":50.5}},
                   {"index":2,"width":{"unit":"auto"}}
                 ],
                 "placements":[
                   {"field":"orderId","row":1,"column":1,"columnSpan":2,"width":{"unit":"pixels","value":200}},
                   {"field":"amount","row":2,"column":2,"rowSpan":1}
                 ],
                 "columnGap":{"unit":"pixels","value":8},
                 "rowGap":{"unit":"pixels","value":4}
               },
               "fields":[{"name":"orderId","label":"Order","sourceProperty":"orderId"},{"name":"amount"}],
               "behaviors":[{"bindings":[{"trigger":{"kind":"Submit"},"actions":[{"kind":"ExecuteCommand","command":"SaveOrder"}]}]}]},
              {"name":"NoteForm","forCommand":"AddNote",
               "populateSource":{"itemBinding":{"path":"item"}},
               "generationMode":"auto",
               "fields":[{"name":"text","composeUsing":"Markdown","placement":{"field":"text","row":1,"column":1,"width":{"unit":"percent","value":100}}}]}
            ],
            "contributions":[],
            "behaviors":[{"bindings":[{"trigger":{"kind":"Load"},"actions":[{"kind":"RefreshQuery","query":"AllOrders"}]}]}]
          }],
          "exposures":[],
          "instanceContributions":[]
        }
        """;
}
