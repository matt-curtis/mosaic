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
	
	const stepCount = parseFloat(document.getElementById("step-count").value);
	const startingOptions = getOptions("starting-options");
	const stepOptions = getOptions("step-options");
	
	//	Send options for duuuplication to plugin
	
	if(window.webkit && window.webkit.messageHandlers.sketchPlugin){
		window.webkit.messageHandlers.sketchPlugin.postMessage(JSON.stringify({
			stepCount, startingOptions, stepOptions
		}));
	} else {
		console.error("Failed to duuuplicate - could not to find 'sketchPlugin' message handler. Is every thing set up properly for messaging?");
	}
};

document.addEventListener("DOMContentLoaded", () => {
	//	Set up Duuuplicate! button to trigger a duplication
	
	document.getElementById("duuuplicate-btn").addEventListener("click", () => {
		apply();
	});
	
	//	Add ENTER key shortcut
	
	document.body.addEventListener("keyup", e => {
		if(e.keyCode !== 13) return;
		
		duuuplicate();
	});
});