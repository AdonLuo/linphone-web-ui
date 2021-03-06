/*!
 Linphone Web - Web plugin of Linphone an audio/video SIP phone
 Copyright (c) 2013 Belledonne Communications
 All rights reserved.
 

 Authors:
 - Yann Diorcet <diorcet.yann@gmail.com>
 
 */

/**
 * Contacts engine Skeleton
 */

linphone.models.contacts.skeleton = {
	/*
	 * Object
	 */
	object: {
	},
	
	/* 
	 * Engine
	 */
	engine: function() {
		
	}
}


//
// List
//

linphone.models.contacts.skeleton.engine.prototype.count = function(filters, callback) {
	// Do nothing
	if(typeof callback !== 'undefined') {
		callback("Not implemented", null);
	}
};
 
linphone.models.contacts.skeleton.engine.prototype.list = function(filters, callback) {
	// Do nothing
	if(typeof callback !== 'undefined') {
		callback("Not implemented", null);
	}
};


//
// CRUD
//
 
linphone.models.contacts.skeleton.engine.prototype.read = function(id, callback) {
	// Do nothing
	if(typeof callback !== 'undefined') {
		callback("Not implemented", null);
	}
};
 		
linphone.models.contacts.skeleton.engine.prototype.create = function(object, callback) {
	// Do nothing
	if(typeof callback !== 'undefined') {
		callback("Not implemented", null);
	}
};
 
linphone.models.contacts.skeleton.engine.prototype.update = function(object, callback) {
	// Do nothing
	if(typeof callback !== 'undefined') {
		callback("Not implemented", null);
	}
};

linphone.models.contacts.skeleton.engine.prototype.remove = function(id, callback) {
	// Do nothing
	if(typeof callback !== 'undefined') {
		callback("Not implemented", null);
	}
};