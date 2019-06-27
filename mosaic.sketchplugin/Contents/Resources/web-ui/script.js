function getOptions(formId){
	const form = document.getElementById(formId);
	const formData = new FormData(form);
	
	const options = {};
	
	for(let keyValuePair of formData){
		options[keyValuePair[0]] = parseFloat(keyValuePair[1]);
	}
	
	return options;
};

function apply(){
	//	Grab options
	
	const numberOfCopies = parseFloat(document.getElementById("number-of-copies").value, 10);
	const properties = {
		direction: getOptions("direction"),
		rotation: getOptions("rotation"),
		spacing: getOptions("spacing"),
		opacity: getOptions("opacity")
	};

	const startingOptions = {};
	const stepOptions = {};

	for(const key in properties){
		startingOptions[key] = properties[key].initial;
		stepOptions[key] = properties[key].increment;
	}
	
	const message = { numberOfCopies, startingOptions, stepOptions };
	
	//	Send options to plugin
	
	if(window.webkit && window.webkit.messageHandlers.sketchPlugin){
		window.webkit.messageHandlers.sketchPlugin.postMessage(JSON.stringify(message));
	} else {
		console.error("Failed to send options - could not to find 'sketchPlugin' message handler. Is every thing set up properly for messaging?");
	}
};

document.addEventListener("DOMContentLoaded", () => {
	//	Set up apply to trigger on button press
	
	document.getElementById("apply-btn").addEventListener("click", () => {
		apply();
	});
	
	//	Add ENTER key shortcut
	
	document.body.addEventListener("keyup", e => {
		if(e.keyCode !== 13) return;
		
		apply();
	});
});