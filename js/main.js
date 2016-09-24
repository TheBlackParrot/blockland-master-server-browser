var icon_lock = $('<i class="fa fa-lock"></i>');
var icon_server = $('<i class="fa fa-server"></i>');
var icon_full = $('<i class="fa fa-ban"></i>');

var api_url = "api/";

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	}
	return "";
}

function getServerElement(data) {
	var element = $('<div class="server"></div>');

	element.attr("address", data.ip + ":" + data.port);

	var header = $('<div class="top"></div>');
	var title_element = $('<h2 class="server-name"></h2>');

	if(parseInt(data.locked)) {
		title_element.append(icon_lock.clone());
	}
	if(parseInt(data.dedicated)) {
		title_element.append(icon_server.clone());
	}
	if(parseInt(data.players.count) >= parseInt(data.players.max)) {
		title_element.append(icon_full.clone());
		element.css("opacity", "0.66");
		element.addClass("server-full");
	}

	title_element.append($('<span class="host-name">' + data.parsed_name.host + '\'s</span> <span class="server-name">' + data.parsed_name.server + '</span>'));

	var players_element = $('<span class="server-players"></span>');
	players_element.text(data.players.count + " / " + data.players.max + " online");

	header.append(players_element);
	header.append(title_element);

	element.append(header);

	
	var details_element = $('<table class="server-details"></table>');

	var row = [];
	for(var i = 0; i < 3; i++) {
		row[i] = $('<tr></tr>');
	}

	row[0].append('<td class="row-head">IP Address + Port</td>');
	row[0].append('<td class="row-value">' + data.ip + '<span class="port">:' + data.port + '</span></td>');

	row[0].append('<td class="row-head">Gamemode</td>');
	row[0].append('<td class="row-value">' + data.gamemode + '</td>');

	row[1].append('<td class="row-head">Dedicated</td>');
	row[1].append('<td class="row-value">' + (parseInt(data.dedicated) ? "Yes" : "No") + '</td>');

	row[1].append('<td class="row-head">Locked</td>');
	row[1].append('<td class="row-value">' + (parseInt(data.locked) ? "Yes" : "No") + '</td>');

	row[2].append('<td class="row-head">Bricks</td>');
	row[2].append('<td class="row-value">' + parseInt(data.bricks).toLocaleString() + '</td>');

	for(var i = 0; i < 3; i++) {
		details_element.append(row[i]);
	}

	element.append(details_element);

	return element;
}

function loadServerData(callback) {
	var hide = [];
	if($("#full").is(":checked")) { hide.push("full"); }
	if($("#empty").is(":checked")) { hide.push("empty"); }
	if($("#locked").is(":checked")) { hide.push("locked"); }

	var sort = $("#sortby").val();

	var order = $("input:radio[name='order']:checked").val();

	var url = api_url + "?hide=" + hide.join(",") + "&sort=" + sort + "&order=" + order;
	console.log(url);

	//var order = $("#")

	$.ajax({
		type: 'GET',
		url: url,
		contentType: 'text/plain',
		dataType: 'json',
		xhrFields: {
			withCredentials: false
		},
		success: function(data) {
			if(typeof callback === "function") {
				callback(data);
			}
		},
		error: function(err) {
			console.log("error: " + err);
		}
	});
}

function doServerStuff() {
	$(".servers").empty();
	$("#refresh-button").addClass("button-disabled");

	$(".servers").fadeOut(100, function() {
		$(".spinner").fadeIn(100, function() {
			loadServerData(function(data) {
				console.log(data);

				for(var i in data) {
					var row = data[i];

					$(".servers").append(getServerElement(row));
				}

				$("#refresh-button").removeClass("button-disabled");

				// css animations here would be a chore smh
				$(".spinner").fadeOut(200, function() {
					$(".servers").fadeIn(100);
				});
			});
		});
	});
}
doServerStuff();

$("#refresh-button").on("click", function() {
	if(!$(this).hasClass("button-disabled")) {
		doServerStuff();
	}
});