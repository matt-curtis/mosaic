const { Document, Group } = require("sketch/dom");
const Settings = require("sketch/settings");
const UI = require("sketch/ui");
const Constants = require("./constants");

function getSelectedLayer(document){
	return document.selectedLayers.layers[0];
};

function isLayerSpecialGroup(layer){
	return !!Settings.layerSettingForKey(layer, Constants.isSpecialGroupKey);
};

function findOrMakeSpecialGroupIfNeeded(layer){
	//	Loop up through the parent hierarchy, looking for a special group

	var layerToCheck = layer;

	while(layerToCheck){
		if(isLayerSpecialGroup(layerToCheck)){
			return layerToCheck;
		}

		layerToCheck = layerToCheck.parent;
	}
	
	//	Group

	const destinationParent = layer.parent;
	const group = new Group({
		name: "Duuuplicate Group",
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

function duuuplicate(duplicationOptions){
	const document = Document.getSelectedDocument();

	//	Safety check:

	if(!document){
		UI.alert("Duuuplicator", "Please select/focus a document.");

		return;
	}

	//	Safety check:

	const selectedLayer = getSelectedLayer(document);

	if(!selectedLayer){
		UI.alert("Duuuplicator", "Please select a layer to duplicate.");
		
		return;
	}

	//	Group selection if needed

	const group = findOrMakeSpecialGroupIfNeeded(selectedLayer);
	
	//	Get to stepping

	var { stepCount, startingOptions, stepOptions } = duplicationOptions;
	
	stepCount = Math.max(1, stepCount);
	
	while(group.layers.length > 1){
		group.layers[group.layers.length - 1].remove();
	}

	var layer = group.layers[0];
	
	configureLayer(layer, startingOptions);
	
	var currentOptions = stepOptionsBy(startingOptions, stepOptions);

	for(let i = 0; i < (stepCount - 1); i++){
		let duplicateLayer = layer.duplicate();

		configureLayer(duplicateLayer, currentOptions, true);

		currentOptions = stepOptionsBy(currentOptions, stepOptions);
		layer = duplicateLayer;
	}

	group.adjustToFit();

	document.selectedLayers.clear();
	group.selected = true;
};

module.exports = duuuplicate;