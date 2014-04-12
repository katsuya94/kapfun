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

	object.prototype.addImage = function(url) {
		return images.push({ url: url, shares: 0 });
	};

	object.prototype.addCaption = function(image, text, tags) {
		var caption = captions.push({ image_id: image.name(), text: text, shares: 0 });
		tags = tags || [];
		for (var i = 0; i < tags.length; i++) {
			caption.child('tags').push(tags[i]);
			image.child('tags').child(tags[i]).transaction(increment);
		}
		image.child('captions').push(caption.name());
		return caption;
	};

	object.prototype.shareCaption = function(caption) {
		caption.child('shares').transaction(increment);
		applyCaptionImage(caption, function(image) {
			image.child('shares').transaction(increment);
		});
	};

	object.prototype.getImage = function(id) {
		return images.child(id);
	};

	object.prototype.getCaption = function(id) {
		return captions.child(id);
	};

	object.prototype.mapImageCaptions = function(image, callback) {
		image.child('captions').on('child_added', function(s) {
			captions.child(s.val()).on('value', function(t) {
				callback(t.val());
			});
		});
	};

	var applyCaptionImage = function(caption, callback) {
		caption.child('image_id').on('value', function(s) {
			callback(images.child(s.val()));
		});
	};
	object.prototype.applyCaptionImage = applyCaptionImage;

	object.prototype.mapCaptionTags = function(caption, callback) {
		caption.child('tags').on('child_added', function(s) {
			callback(s.val());
		});
	};

	object.prototype.mapImageTags = function(image, callback) {
		image.child('tags').on('child_added', function(s) {
			callback(s.val());
		});
	};

	object.prototype.updateCaptionIndex = function() {
		captions.on('child_added', function(s) {
			captionIndex.push().setWithPriority({ caption_id: s.name(), timestamp: Date.now() }, s.val().shares);
		});
	};

	object.prototype.mapCaptions = function(callback) {
		captionIndex.on('child_added', function(s) {
			callback(captions.child(s.val().caption_id).val());
		});
	};

	object.prototype.reset = function() {
		root.set(null);
	};

	return object;
}
var kapfun = _kapfun();