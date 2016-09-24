$("body").on("click", ".server", function(){
	if(typeof $(this).attr("address") === "undefined") {
		console.log("no address");
		return;
	}

	if($(this).hasClass("server-full")) {
		return;
	}

	var url_str;
	switch(getCookie("urlscheme")) {
		case "1":
			url_str = "steam://rungameid/250340//-connect " + $(this).attr("address");
			break;

		case "2":
			url_str = "linuxbl://" + $(this).attr("address");
			break;

		case "0":
		default:
			url_str = "blockland://join-" + $(this).attr("address").replace(":", "_");
			break;
	}

	$("#joinTrigger").attr("src", url_str);
	$("#joinTrigger").trigger("click");
});