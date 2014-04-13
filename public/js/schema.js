function _kapfun() {
	var root = new Firebase('https://resplendent-fire-732.firebaseio.com/');
	var images = root.child('images');
	var captions = root.child('captions');
	var captionIndex = root.child('captions_index');

	var object = function() {};

	var increment = function(val) {
		val = val || 0;
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
			var ref1 = caption.child('tags').set(tags.join(','), function() {
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

	object.prototype.getImage = function(id) {
		return images.child(id);
	};

	object.prototype.getCaption = function(id) {
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

	object.prototype.mapImages = function(callback) {
		images.on('child_added', function(s) {
			callback(s.val());
		});
	};

	var applyCaptionImage = function(caption, callback) {
		callback = callback || empty;
		caption.child('image_id').on('value', function(s) {
			callback(images.child(s.val()));
		});
	};
	object.prototype.applyCaptionImage = applyCaptionImage;

	object.prototype.mapCaptionTags = function(caption, callback) {
		callback = callback || empty;
		caption.child('tags').on('child_added', function(s) {
			callback(s.val());
		});
	};

	object.prototype.mapImageTags = function(image, callback) {
		callback = callback || empty;
		image.child('tags').on('child_added', function(s) {
			callback(s.val());
		});
	};

	object.prototype.updateCaptionIndex = function(callback) {
		callback = callback || empty;
		captions.on('child_added', function(s) {
			captionIndex.push().setWithPriority({ caption_id: s.name(), timestamp: Date.now() }, s.val().shares, callback);
		});
	};

	object.prototype.mapCaptions = function(callback) {
		callback = callback || empty;
		captionIndex.on('child_added', function(s) {
			callback(captions.child(s.val().caption_id).val());
		});
	};

	object.prototype.reset = function(callback) {
		callback = callback || empty;
		root.set(null, callback);
	};

	return object;
}
var kapfun = _kapfun();