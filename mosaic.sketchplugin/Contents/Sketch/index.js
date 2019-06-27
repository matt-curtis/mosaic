const UI = require("./ui");
const mosaic = require("./mosaic");
const Async = require("sketch/async");

//	Sketch Handlers

var fiber;

function onRun(context){
	if(!fiber){
		fiber = Async.createFiber();
		fiber.onCleanup(() => {
			UI.cleanup();
		});
	}
	
	UI.loadAndShow(context.scriptURL, options => {
		mosaic(options);
	});
};