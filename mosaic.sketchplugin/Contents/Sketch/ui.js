const MochaJSDelegate = require("./MochaJSDelegate");

var _window;

//	Private

function createWebView(pageURL, onApplyMessage, onLoadFinish){
	const webView = WKWebView.alloc().init();

	//	Create delegate

	const delegate = new MochaJSDelegate({
		"webView:didFinishNavigation:": (webView, navigation) => {
			onLoadFinish();
		},
		"userContentController:didReceiveScriptMessage:": (_, wkMessage) => {
			const message = JSON.parse(wkMessage.body());
			
			onApplyMessage(message);
		}
	}).getClassInstance();

	//	Set load complete handler

	webView.navigationDelegate = delegate;

	//	Set handler for messages from script

	const userContentController = webView.configuration().userContentController();

	userContentController.addScriptMessageHandler_name(delegate, "sketchPlugin");

	//	Load page into web view

	webView.loadFileURL_allowingReadAccessToURL(pageURL, pageURL.URLByDeletingLastPathComponent());

	return webView;
};

function createWindow(){
	const window = NSPanel.alloc().initWithContentRect_styleMask_backing_defer(
		NSMakeRect(0, 0, 145, 500),
		NSWindowStyleMaskClosable | NSWindowStyleMaskTitled | NSWindowStyleMaskResizable,
		NSBackingStoreBuffered,
		false
	);

	window.becomesKeyOnlyIfNeeded = true;
	window.floatingPanel = true;

	window.frameAutosaveName = "mosaic-panel-frame";

	window.minSize = window.frame().size;
	window.maxSize = window.frame().size;

	window.releasedWhenClosed = false;

	window.standardWindowButton(NSWindowZoomButton).hidden = true;
	window.standardWindowButton(NSWindowMiniaturizeButton).hidden = true;

	window.titlebarAppearsTransparent = true;
	
	window.backgroundColor = NSColor.colorWithRed_green_blue_alpha(0.95, 0.95, 0.95, 1.0);

	return window;
};

function showWindow(window){
	window.makeKeyAndOrderFront(nil);
};

//	Public

function loadAndShow(baseURL, onApplyMessage){
	if(_window){
		showWindow(_window);

		return;
	}

	const pageURL = baseURL
		.URLByDeletingLastPathComponent()
		.URLByAppendingPathComponent("../Resources/web-ui/index.html");

	const window = createWindow();
	const webView = createWebView(pageURL, onApplyMessage, () => {
		showWindow(window);
	});

	window.contentView = webView;

	_window = window;
};

function cleanup(){
	if(_window){
		_window.orderOut(nil);
		_window = null;
	}
};

//	Export

module.exports = { loadAndShow, cleanup };