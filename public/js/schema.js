function _kapfun() {
	var root = new Firebase('https://resplendent-fire-732.firebaseio.com/');
	var images = root.child('images');
	var captions = root.child('captions');

	var object = function() {};

	var increment = function(val) {
		return val + 1;
	};

	var empty = function() {};

	object.prototype.addImage = function(url, callback) {
		callback = callback || empty;
		var image = images.push();
		image.set({ url: url, shares: 0 }, function() {
			callback(image);
		});
		return image;
	};

	object.prototype.addCaption = function(image, text, tags, callback) {
		callback = callback || empty;
		var caption = captions.push();
		tags = tags || [];
		caption.set({ image_id: image.name(), text: text, shares: 0 }, function() {
			image.child('captions').push(caption.name());
			caption.child('tags').set(tags.join(','), function() {
				callback(caption);
			});
		});
		return caption;
	};

	object.prototype.shareCaption = function(caption, callback) {
		callback = callback || empty;
		caption.child('shares').transaction(increment, function() {
			applyCaptionImage(caption, function(image) {
				image.child('shares').transaction(increment, callback);
			});
		});
	};

	object.prototype.getImage = function(id, callback) {
		var image = images.child(id);
		image.on('value', function(s) {
			var r = s.val();
			r.name = s.name();
			callback(r);
		});
	};

	object.prototype.getImageRef = function(id) {
		return images.child(id);
	};

	object.prototype.getCaption = function(id, callback) {
		var caption = captions.child(id);
		caption.on('value', function(s) {
			var r = s.val();
			r.name = s.name();
			callback(r);
		});
	};

	object.prototype.getCaptionWithImage = function(id, callback) {
		var caption = captions.child(id);
		caption.on('value', function(s) {
			var r = s.val();
			r.name = s.name();
			images.child(r.image_id).on('value', function(t) {
				r.image = t.val();
				r.image.name = t.name();
				callback(r);
			});
		});
	};

	object.prototype.getCaptionRef = function(id) {
		return captions.child(id);
	};

	object.prototype.mapImageCaptions = function(image, callback) {
		callback = callback || empty;
		image.child('captions').on('child_added', function(s) {
			captions.child(s.val()).on('value', function(t) {
				callback(t.val());
			});
		});
	};

	object.prototype.mapImages = function(limit, callback) {
		images.limit(limit).on('child_added', function(s) {
			var r = s.val();
			r.name = s.name();
			callback(r);
		});
	};

	object.prototype.randomizeImages = function(limit, callback) {
		images.on('child_added', function(s) {
			s.ref().setPriority(Math.random());
		});
	};

	object.prototype.mapCaptionsWithImages = function(limit, callback) {
		captions.endAt().limit(limit).on('child_added', function(s) {
			var r = s.val();
			r.name = s.name();
			images.child(r.image_id).on('value', function(t) {
				r.image = t.val();
				r.image.name = t.name();
				callback(r);
			});
		});
	};

	object.prototype.mapCaptions = function(limit, callback) {
		captions.endat().limit(limit).on('child_added', function(s) {
			var r = s.val();
			r.name = s.name();
			callback(r);
		});
	};

	var applyCaptionImage = function(caption, callback) {
		callback = callback || empty;
		caption.child('image_id').on('value', function(s) {
			callback(images.child(s.val()));
		});
	};
	object.prototype.applyCaptionImage = applyCaptionImage;

	object.prototype.mapImageTags = function(image, callback) {
		callback = callback || empty;
		image.child('tags').on('child_added', function(s) {
			callback(s.val());
		});
	};

	object.prototype.updateCaptionIndex = function(callback) {
		callback = callback || empty;
		captions.on('child_added', function(s) {
			s.ref().setPriority(s.val().shares);
		}, callback);
	};

	object.prototype.reset = function(callback) {
		callback = callback || empty;
		root.set(null, callback);
	};

	return object;
}
var kapfun = _kapfun();

function modalError() {
	$('#alerts').append('<div class="alert alert-danger alert-dismissible"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>Invalid submission.</div>');
	$('.modal').modal('hide');
}