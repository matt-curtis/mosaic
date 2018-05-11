require("./call").bindToObjectPrototype();

var _window;

//	Private

function createWebView(pageURL, onLoadFinish, onDuplicateMessage){
	const webView = WKWebView.alloc().init();

	//	Set load complete handler

	const webViewLoadDelegate = new MochaJSDelegate({
		"webView:didFinishNavigation:": (webView, navigation) => {
			onLoadFinish();
		}
	});

	webView.navigationDelegate = webViewLoadDelegate.getClassInstance();;

	//	Set handler for messages from script

	const userContentController = webView.configuration().userContentController();

	const scriptMessageHandler = new MochaJSDelegate({
		"userContentController:didReceiveScriptMessage:": (_, wkMessage) => {
			const jsonData = NSJSONSerialization.call({
				dataWithJSONObject: wkMessage.body(),
				options: 0, error: null
			});

			const jsonString = NSString.alloc().call({
				initWithData: jsonData, encoding: NSUTF8StringEncoding
			});
			
			const message = JSON.parse(jsonString+"");
			
			onDuplicateMessage(message);
		}
	});

	userContentController.call({
		addScriptMessageHandler: scriptMessageHandler.getClassInstance(),
		name: "sketchPlugin"
	});

	//	Load page into web view

	webView.call({
		loadFileURL: pageURL,
		allowingReadAccessToURL: pageURL.URLByDeletingLastPathComponent()
	});

	return webView;
};

function createWindow(){
	const window = NSPanel.alloc().call({
		initWithContentRect: NSMakeRect(0, 0, 420, 646),
		styleMask: NSWindowStyleMaskClosable | NSWindowStyleMaskTitled | NSWindowStyleMaskResizable,
		backing: NSBackingStoreBuffered,
		defer: false
	});

	window.frameAutosaveName = "duuuplicator-panel-frame";

	window.becomesKeyOnlyIfNeeded = true;
	window.floatingPanel = true;

	window.releasedWhenClosed = false;

	window.standardWindowButton(NSWindowZoomButton).hidden = true;
	window.standardWindowButton(NSWindowMiniaturizeButton).hidden = true;

	window.titlebarAppearsTransparent = true;
	window.titleVisibility = NSWindowTitleHidden;

	window.collectionBehavior = NSWindowCollectionBehaviorTransient;

	window.backgroundColor = NSColor.call({ colorWithRed: 1, green: 0.98, blue: 0.98, alpha: 1 });

	return window;
};

function showWindow(window){
	window.makeKeyAndOrderFront(nil);
};

//	Public

function loadAndShow(baseURL, onDuplicateMessage){
	if(_window){
		showWindow(_window);

		return;
	}

	const pageURL = baseURL
		.URLByDeletingLastPathComponent()
		.URLByAppendingPathComponent("../Resources/web-ui/index.html");

	const window = createWindow();
	const webView = createWebView(pageURL, () => {
		showWindow(window);
	}, onDuplicateMessage);

	window.contentView = webView;

	_window = window;
};

function destroy(){
	if(_window){
		_window.orderOut(nil);
		_window = null;
	}
};

//	Export

module.exports = { loadAndShow, destroy };