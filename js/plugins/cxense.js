require("../framework/InitAnalyticsNamespace.js");

/**
 * @class CxenseAnalyticsPlugin
 * @classdesc Cxense Insight plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var CxenseAnalyticsPlugin = function (framework)
{
    var _framework = framework;
    var name = "cxense";
    var version = "v1";
    var id;
    var config;
    /**
     * [Required Function] Return the name of the plugin.
     * @public
     * @method CxenseAnalyticsPlugin#getName
     * @return {string} The name of the plugin.
     */
    this.getName = function ()
    {
        return name;
    };

    /**
     * [Required Function] Return the version string of the plugin.
     * @public
     * @method CxenseAnalyticsPlugin#getVersion
     * @return {string} The version of the plugin.
     */
    this.getVersion = function ()
    {
        return version;
    };

    /**
     * [Required Function] Set the plugin id given by the Analytics Framework when
     * this plugin is registered.
     * @public
     * @method CxenseAnalyticsPlugin#setPluginID
     * @param  {string} newID The plugin id
     */
    this.setPluginID = function(newID)
    {
        id = newID;
    };

    /**
     * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
     * @public
     * @method CxenseAnalyticsPlugin#setPluginID
     * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
     */
    this.getPluginID = function()
    {
        return id;
    };

    /**
     * [Required Function] Initialize the plugin with the given metadata.
     * @public
     * @method CxenseAnalyticsPlugin#init
     */
    this.init = function()
    {

        var missedEvents;
        //if you need to process missed events, here is an example
        if (_framework && OO._.isFunction(_framework.getRecordedEvents))
        {
            missedEvents = _framework.getRecordedEvents();
            _.each(missedEvents, _.bind(function (event) {
                this.processEvent(event.eventName, event.params);
            }, this));
        }
        //use recorded events.
    };

    /**
     * [Required Function] Set the metadata for this plugin.
     * @public
     * @method CxenseAnalyticsPlugin#setMetadata
     * @param  {object} metadata The metadata for this plugin
     */
    this.setMetadata = function(metadata)
    {
        OO.log( "Analytics Template: PluginID \'" + id + "\' received this metadata:", metadata);
        config = metadata;
    };

    /**
     * [Required Function] Process an event from the Analytics Framework, with the given parameters.
     * @public
     * @method CxenseAnalyticsPlugin#processEvent
     * @param  {string} eventName Name of the event
     * @param  {Array} params     Array of parameters sent with the event
     */
    this.processEvent = function(eventName, params)
    {
        var Events = OO.Analytics.EVENTS;
        var param = params && params.length? params[0] : {};

        if( [
                Events.VIDEO_STREAM_POSITION_CHANGED,
                Events.VIDEO_STREAM_DOWNLOADING
            ].indexOf(eventName) === -1){
        }

        OO.log( "Analytics Template: PluginID \'" + id + "\' received this event \'" + eventName + "\' with these params:", params);

        switch(eventName)
        {
            case Events.VIDEO_PLAYER_CREATED:
                cX.callQueue.push(["video", "initialize", {
                    logging: config.logging,
                    debug: config.debug,
                    element : "#" + config.elementId
                }]);
                break;

            case Events.VIDEO_SOURCE_CHANGED:
                cX.callQueue.push(["video", "impression", {
                    contentId : param.embedCode
                }]);
                break;

            case Events.VIDEO_PLAYING:
                cX.callQueue.push(["video", "playing", {}]);
                break;

            case Events.VIDEO_PAUSED:
                cX.callQueue.push(["video", "paused", {}]);
                break;

            case Events.VIDEO_STREAM_POSITION_CHANGED:
                cX.callQueue.push(["video", "timeupdate", {
                    currentTime : param.streamPosition,
                    duration : param.totalStreamDuration
                }]);
                break;

            case Events.VIDEO_CONTENT_COMPLETED:
                cX.callQueue.push(["video", "ended", {}]);
                break;

            default:
                break;
        }
    };

    /**
     * [Required Function] Clean up this plugin so the garbage collector can clear it out.
     * @public
     * @method CxenseAnalyticsPlugin#destroy
     */
    this.destroy = function ()
    {
        _framework = null;
    };
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(CxenseAnalyticsPlugin);

module.exports = CxenseAnalyticsPlugin;
