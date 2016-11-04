


describe('Analytics Framework Template Unit Tests', function()
{
    jest.autoMockOff();
    //this file is the file that defines TEST_ROOT and SRC_ROOT
    require("../unit-test-helpers/test_env.js");
    require(SRC_ROOT + "framework/AnalyticsFramework.js");
    require(SRC_ROOT + "plugins/cxense.js");
    require(TEST_ROOT + "unit-test-helpers/AnalyticsFrameworkTestUtils.js");
    require(COMMON_SRC_ROOT + "utils/InitModules/InitOOUnderscore.js");



    var Analytics = OO.Analytics;
    var Utils = OO.Analytics.Utils;
    var _ = OO._;
    var framework;

    //setup for individual tests
    var testSetup = function()
    {
        global.cX = { videoQueue : [] };
        framework = new Analytics.Framework();
        //mute the logging becuase there will be lots of error messages
        OO.log = function(){};
    };

    //cleanup for individual tests
    var testCleanup = function()
    {
        OO.Analytics.PluginFactoryList = [];
        OO.Analytics.FrameworkInstanceList = [];
        OO.log = console.log;
        global.cX = null;
    };

    beforeEach(testSetup);
    afterEach(testCleanup);

    it('Test Cxense Plugin Validity', function()
    {
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        expect(CxensePlugin).not.toBeNull();
        var plugin = new CxensePlugin();
        expect(framework.validatePlugin(plugin)).toBe(true);
    });

    it('Test Auto Registering Plugin', function()
    {
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        var pluginList = framework.getPluginIDList();
        expect(pluginList.length).toBe(1);

        var pluginID = pluginList[0];
        expect(pluginID).not.toBeFalsy();
        expect(pluginID && _.isString(pluginID)).toBe(true);
        expect(framework.isPluginActive(pluginID)).toBe(true);

        //test registering it again
        pluginID2 = framework.registerPlugin(CxensePlugin);
        expect(pluginID2).not.toBeFalsy();
        expect(pluginID2 && _.isString(pluginID2)).toBe(true);
        expect(framework.isPluginActive(pluginID2)).toBe(true);
        expect(pluginID).not.toEqual(pluginID2);

        expect(framework.unregisterPlugin(pluginID)).toBe(true);
        expect(_.contains(framework.getPluginIDList(), pluginID)).toBe(false);
    });

    it('Test Analytics Plugin Validity', function()
    {
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        var pluginID = framework.registerPlugin(CxensePlugin);
        expect(pluginID).toBeDefined();
        var pluginList = framework.getPluginIDList();
        expect(_.contains(pluginList, pluginID));
        expect(framework.makePluginInactive(pluginID)).toBe(true);
        expect(framework.makePluginActive(pluginID)).toBe(true);
    });

    it('Test Factory Mixed Loading Plugins and Frameworks Delayed', function()
    {
        var framework2 = new Analytics.Framework();
        expect(OO.Analytics.FrameworkInstanceList).toBeDefined();
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        expect(OO.Analytics.PluginFactoryList).toBeDefined();
        expect(_.contains(OO.Analytics.PluginFactoryList, CxensePlugin)).toBe(true);

        var pluginList1 = framework.getPluginIDList();
        var pluginList2 = framework2.getPluginIDList();
        expect(pluginList1.length).toEqual(1);
        expect(pluginList2.length).toEqual(1);

        var framework3 = new Analytics.Framework();
        pluginList1 = framework.getPluginIDList();
        pluginList2 = framework2.getPluginIDList();
        var pluginList3 = framework3.getPluginIDList();
        expect(pluginList1.length).toEqual(1);
        expect(pluginList2.length).toEqual(1);
        expect(pluginList3.length).toEqual(1);
    });

    it('Test Factory Created Before Framework', function()
    {
        //erase the global references for the plugins and frameworks.
        OO.Analytics.PluginFactoryList = null;
        OO.Analytics.FrameworkInstanceList = null;
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        expect(OO.Analytics.PluginFactoryList).toBeTruthy();
        expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
        expect(OO.Analytics.FrameworkInstanceList).toBeTruthy();
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
    });

    it('Test Setting Metadata and Processing An Event', function()
    {
        var metadataRecieved;
        var eventProcessed;
        var paramsReceived;
        var pluginName;
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        var newFactoryWithFunctionTracing = function()
        {
            var factory = new CxensePlugin();
            pluginName = factory.getName();
            factory.setMetadata = function(metadata)
            {
                metadataReceived = metadata;
            };
            factory.processEvent = function(eventName, params)
            {
                eventProcessed = eventName;
                paramsReceived = params;
            };
            return factory;
        };
        framework.registerPlugin(newFactoryWithFunctionTracing);
        var metadata = {};
        metadata[pluginName] = {
            "data": "mydata"
        };
        framework.setPluginMetadata(metadata);
        expect(metadataReceived).toEqual(metadata[pluginName]);
        framework.publishEvent(OO.Analytics.EVENTS.VIDEO_PAUSED, [metadata]);
        expect(eventProcessed).toEqual(OO.Analytics.EVENTS.VIDEO_PAUSED);
        expect(paramsReceived).toEqual([metadata]);
    });

    it('Test Framework Destroy With Cxense', function()
    {
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        var pluginList = framework.getPluginIDList();
        expect(pluginList.length).toEqual(1);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
        framework.destroy();

        pluginList = framework.getPluginIDList();
        expect(pluginList.length).toEqual(0);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(0);
        expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
    });

    it('Test Framework Destroy With Cxense And Multi Frameworks', function()
    {
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        var framework2 = new OO.Analytics.Framework();
        var pluginList = framework.getPluginIDList();
        var pluginList2 = framework2.getPluginIDList();

        expect(pluginList.length).toEqual(1);
        expect(pluginList2.length).toEqual(1);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(2);
        expect(OO.Analytics.PluginFactoryList.length).toEqual(1);

        framework.destroy();

        pluginList = framework.getPluginIDList();
        pluginList2 = framework2.getPluginIDList();

        expect(pluginList.length).toEqual(0);
        expect(pluginList2.length).toEqual(1);
        expect(OO.Analytics.FrameworkInstanceList.length).toEqual(1);
        expect(OO.Analytics.PluginFactoryList.length).toEqual(1);
    });

    it('Test all functions', function()
    {
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        var plugin = new CxensePlugin(framework);
        var errorOccured = false;
        try
        {
            for (var key in plugin)
            {
                if(OO._.isFunction(plugin[key]))
                {
                    plugin[key].apply(plugin);
                }
            }
        }
        catch(e)
        {
            console.log("error on testing key", key, e);
            errorOccured = true;
        }

        expect(errorOccured).toBe(false);
    });

    it('Test Player Creation', function() {

        var plugin = getConfiguredPlugin("myElementId");

        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED);

        expect(cX.videoQueue).toEqual([
            ['initialize', {element: "#myElementId", logging: undefined, debug: undefined}]
        ]);
    });

    it('tests video source change', function() {
        var plugin = getConfiguredPlugin("myElementId");

        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED);
        cX.videoQueue = [];

        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
            embedCode: "testEmbedCode"
        }]);
        expect(cX.videoQueue).toEqual([
            ['impression', { contentId : "testEmbedCode" }]
        ]);
        cX.videoQueue = [];

        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
            embedCode: "testEmbedCode2"
        }]);
        expect(cX.videoQueue).toEqual([
            ['impression', { contentId : "testEmbedCode2" }]
        ]);
    });

    it('tests multiple video source changes', function() {
        var plugin = getConfiguredPlugin("myElementId");
        var simulator = Utils.createPlaybackSimulator(plugin);
        simulator.simulatePlayerLoad({ embedCode: "testEmbedCode" });
        cX.videoQueue = [];

        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
            embedCode: "testEmbedCode2"
        }]);
        expect(cX.videoQueue).toEqual([
            ['impression', { contentId : "testEmbedCode2" }]
        ]);
    });

    it('tests multiple video source changes', function() {
        var plugin = getConfiguredPlugin("myElementId");
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED);
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{ embedCode: "testEmbedCode"}]);
        cX.videoQueue = [];

        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{
            embedCode: "testEmbedCode2"
        }]);
        expect(cX.videoQueue).toEqual([
            ['impression', { contentId : "testEmbedCode2" }]
        ]);
    });


    it('Test init with missed events', function() {
        framework.getRecordedEvents = function () {
            return [
                {
                    eventName : OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED,
                    params : {}
                },
                {
                    eventName : OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED,
                    params : { embedCode: "testEmbedCode"}
                }
            ]
        };

        var plugin = getConfiguredPlugin("myElementId");
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED);
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED, [{ embedCode: "testEmbedCode"}]);

        expect(cX.videoQueue).toEqual([
            ['initialize', {element: "#myElementId", logging: undefined, debug: undefined}],
            ['impression', { contentId : "testEmbedCode" }]
        ]);
    });

    it('Test playing start', function() {
        var plugin = getConfiguredPlugin("myElementId");
        var simulator = Utils.createPlaybackSimulator(plugin);
        simulator.simulatePlayerLoad({ embedCode: "testEmbedCode" });
        simulator.simulateContentPlayback();
        expect(cX.videoQueue).toEqual([
            ['initialize', {element: "#myElementId", logging: undefined, debug: undefined}],
            ['impression', { contentId : "testEmbedCode" }],
            ['playing', { }]
        ]);
    });

    it('Test time passing', function() {
        var plugin = getConfiguredPlugin("myElementId");
        var simulator = Utils.createPlaybackSimulator(plugin);
        simulator.simulatePlayerLoad({ embedCode: "testEmbedCode" });
        simulator.simulateContentPlayback();
        cX.videoQueue = [];

        simulator.simulateVideoProgress({
            playheads: [0, 2, 4],
            totalStreamDuration: 60
        });
        expect(cX.videoQueue).toEqual([
            ['timeupdate', { currentTime : 0, duration : 60 }],
            ['timeupdate', { currentTime : 2, duration : 60 }],
            ['timeupdate', { currentTime : 4, duration : 60 }]
        ]);
    });

    it('Test pause', function() {
        var plugin = getConfiguredPlugin("myElementId");
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_PAUSED);
        expect(cX.videoQueue).toEqual([
            ['paused', {}],
        ]);
    });

    it('Test complete', function() {
        var plugin = getConfiguredPlugin("myElementId");
        plugin.processEvent(OO.Analytics.EVENTS.VIDEO_CONTENT_COMPLETED);
        expect(cX.videoQueue).toEqual([
            ['ended', {}],
        ]);
    });

    function getConfiguredPlugin ( elementId ) {
        var CxensePlugin = require(SRC_ROOT + "plugins/cxense.js");
        var plugin = new CxensePlugin(framework);
        plugin.setMetadata({ elementId: elementId });
        return plugin;
    }
});
