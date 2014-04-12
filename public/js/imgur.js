function imgur() {
	$.ajax({
		url: 'https://api.imgur.com/3/image',
		method: 'POST',
		headers: {
			Authorization: 'Client-ID 5b607a26ccbd041',
			Accept: 'application/json'
		},
		data: {
			image: localStorage.dataBase64,
			type: 'base64'
		},
		success: function(result) {
			var id = result.data.id;
		}
	});
}