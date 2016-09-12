Ext.define("CustomApp", {
    extend: "Rally.app.TimeboxScopedApp",
    componentCls: "app",
    scopeType: "iteration",
    comboboxConfig: { fieldLabel: "Select an Iteration:", labelWidth: 100, width: 300 },
    onScopeChange: function() {
        var filter = this.getContext().getTimeboxScope().getQueryFilter();
        Ext.create("Rally.data.WsapiDataStore", { 
        	model: "UserStory", 
        	fetch: ["FormattedID", 
        	"Name", 
        	"TestCases", 
        	"Feature"], 
        	pageSize: 100, 
        	autoLoad: !0, 
        	filters: [filter], 
        	listeners: { 
        		load: this._onDataLoaded, 
        		scope: this 
        	} 
        });
    },
    _onDataLoaded: function(store, data) {
        var stories = [],
            pendingTestCases = data.length;
        _.each(data, function(story) {
            var s = { 
            	Feature: story.get("Feature"), 
            	FormattedID: story.get("FormattedID"), 
            	Name: story.get("Name"), 
            	_ref: story.get("_ref"), 
            	TestCaseCount: story.get("TestCases").Count, 
            	TestCases: [] 
            };
            
            var testcases = story.getCollection("TestCases", { fetch: ["FormattedID"] });
            testcases.load({ 
            	callback: function(records, operation, success) { 
	            	_.each(records, function(testcase) { 
	            		s.TestCases.push({ 
	            			_ref: testcase.get("_ref"), 
	            			FormattedID: testcase.get("FormattedID"), 
	            			Name: testcase.get("Name") 
	            		}); 
	            	}, this);

	            	--pendingTestCases;
                    if (pendingTestCases === 0) {
                        this._createGrid(stories);
                    }
                },
                scope: this
            });
            stories.push(s);
        }, this);
    },
    _createGrid: function(stories) {
        var myStore = Ext.create("Rally.data.custom.Store", { 
        	data: stories, 
        	pageSize: 100 
        });

        if(!this.grid) {
        	this.grid = this.add({
	            xtype: "rallygrid",
	            itemId: "mygrid",
	            store: myStore,
	            columnCfgs: [{
	                text: "Feature",
	                dataIndex: "Feature",
	                renderer: function(value) {
	                    var html = [];
	                    return value ? '<a href="' + Rally.nav.Manager.getDetailUrl(value) + '">' + value.FormattedID + "</a>" : void 0;
	                }
	            }, { 
	            	text: "Formatted ID", dataIndex: "FormattedID", xtype: "templatecolumn", 
	            	tpl: Ext.create("Rally.ui.renderer.template.FormattedIDTemplate") 
	            }, { 
	            	text: "Name", dataIndex: "Name" 
	            }, { 
	            	text: "Test Case Count", dataIndex: "TestCaseCount", align: "center" 
	            }, {
	                text: "Test Cases", dataIndex: "TestCases", sortable: !1,
	                renderer: function(value) {
	                    var html = [];
	                    Ext.Array.each(value, function(testcase) { 
	                    	html.push('<a href="' + Rally.nav.Manager.getDetailUrl(testcase) + '">' + testcase.FormattedID + "</a>");
	                    });
	                    return html.join("</br>");
	                }
	            }]
	        });
        } else {
        	this.grid.reconfigure(myStore);
        }
    }
});
