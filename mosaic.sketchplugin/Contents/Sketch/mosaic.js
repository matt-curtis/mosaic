const { Document, Group } = require("sketch/dom");
const Settings = require("sketch/settings");
const UI = require("sketch/ui");
const Constants = require("./constants");

function findOrMakeSpecialGroupIfNeeded(layer){
	//	Loop up through the parent hierarchy, looking for a special group

	var layerToCheck = layer;

	while(layerToCheck){
		let isSpecialGroup = !!Settings.layerSettingForKey(layerToCheck, Constants.isSpecialGroupKey);

		if(isSpecialGroup) return layerToCheck;

		layerToCheck = layerToCheck.parent;
	}
	
	//	Group

	const destinationParent = layer.parent;

	layer.remove(); // remove layer from it's existing parent before adding to group

	const group = new Group({
		name: "Mosaic",
		layers: [ layer ],
		parent: destinationParent
	});
	
	Settings.setLayerSettingForKey(group, Constants.isSpecialGroupKey, true);

	return group;
};

function configureLayer(layer, options, shouldAdjustSpacing){
	const { opacity, rotation, direction, spacing } = options;

	layer.style.opacity = opacity / 100;
	layer.sketchObject.rotation = -rotation;

	if(shouldAdjustSpacing){
		const directionAsRadians = direction * (Math.PI / 180);
		const vector = {
			x: Math.cos(directionAsRadians),
			y: Math.sin(directionAsRadians)
		};

		layer.frame.x += vector.x * spacing;
		layer.frame.y += vector.y * spacing;
	}
};

function stepOptionsBy(start, step){
	const newOptions = {};
	
	for(let key in start){
		newOptions[key] = start[key] + step[key];
	}

	return newOptions;
};

function mosaic(options){
	const document = Document.getSelectedDocument();

	//	Safety check:

	if(!document){
		UI.alert("Mosaic", "⚠️ Please select/focus a document.");

		return;
	}

	//	Safety check:

	const selectedLayer = document.selectedLayers.layers[0];

	if(!selectedLayer){
		UI.alert("Mosaic", "⚠️ Please select a layer to duplicate.");
		
		return;
	}

	//	Group selection if needed

	const group = findOrMakeSpecialGroupIfNeeded(selectedLayer);
	
	//	Destructure options:

	var { numberOfCopies, startingOptions, stepOptions } = options;
	
	numberOfCopies = Math.max(1, numberOfCopies);
	
	//	Remove all layers except the first:

	while(group.layers.length > 1){
		group.layers[group.layers.length - 1].remove();
	}

	//	Configure template layer

	var layer = group.layers[0];
	
	configureLayer(layer, startingOptions);
	
	//	Create duplicates until we've met the desired number
	//	Configure each duplicate using the desired options

	var currentOptions = stepOptionsBy(startingOptions, stepOptions);

	for(let i = 0; i < (numberOfCopies - 1); i++){
		let duplicateLayer = layer.duplicate();

		configureLayer(duplicateLayer, currentOptions, true);

		currentOptions = stepOptionsBy(currentOptions, stepOptions);
		layer = duplicateLayer;
	}

	//	Fit group to duplicates

	group.adjustToFit();

	//	Set selection to the group

	document.selectedLayers.clear();
	group.selected = true;
};

module.exports = mosaic;