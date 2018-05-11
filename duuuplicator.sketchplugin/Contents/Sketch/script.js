const MochaJSDelegate = require("./MochaJSDelegate");
const UI = require("./ui");
const duuuplicate = require("./duuuplicate");

//	Sketch Handlers

function onRun(context){
	if(coscript.shouldKeepAround()){
		coscript.shouldKeepAround = false;
		onShutdown();

		return;
	}

	coscript.shouldKeepAround = true;

	UI.loadAndShow(context.scriptURL, duplicationOptions => {
		duuuplicate(duplicationOptions);
	});
};

function onShutdown(){
	UI.destroy();
};