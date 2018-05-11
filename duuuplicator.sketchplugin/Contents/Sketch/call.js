function call(target, methodParts){
	//	Safety checks:

	if(Object.prototype.toString.call(target) !== "[object MOBoxedObject]"){
		throw "call() used on native JavaScript object. call() should only be used on bridged Objective-C objects."
	}

	if(typeof methodParts !== "object"){
		throw "2nd argument in call() must be an object and not null.";
	}

	//	Work:

	var selector = "", values = [];
	
	for(let label of Reflect.ownKeys(methodParts)){
		selector += label + ":";
		values.push(methodParts[label]);
	}

	//	Safety check:

	const method = target[selector];

	if(!method){
		throw "\"" + selector + "\" does not exist on " + target.className();
	}

	return Function.prototype.apply.apply(method, [ null, values ]);
};

call.bindToObjectPrototype = function(){
	Object.prototype.call = function(methodParts){
		return call(this, methodParts);
	};
};

module.exports = call;