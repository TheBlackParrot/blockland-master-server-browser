<?php
	header("Content-type: text/plain");
	header("Access-Control-Allow-Origin: *");

	$raw = file_get_contents("http://master2.blockland.us/");
	
	$lines = split("\n", $raw);

	$arr = [];
	foreach($lines as $line) {
		if(!isset($found_start)) {
			if(trim($line) == "START") {
				$found_start = true;
			}

			continue;
		}

		if(trim($line) == "END") {
			break;
		}

		$parts = split("\t", $line);
		$parts = array_map('utf8_encode', $parts);

		$parsed_names = [];
		
		$to_parse = "'s";
		$parse_offset = 0;
		if(stripos($parts[4], $to_parse) == false) {
			// hoo boy improper grammar
			$to_parse = "s'";
			$parse_offset = 1;
		}

		$parsed_names["host"] = substr($parts[4], 0, stripos($parts[4], $to_parse)+$parse_offset);
		$parsed_names["server"] = trim(substr($parts[4], stripos($parts[4], $to_parse)+2));
		
		$arr["{$parts[0]}:{$parts[1]}"] = [
			"ip" => $parts[0],
			"port" => $parts[1],
			"locked" => $parts[2],
			"dedicated" => $parts[3],
			"name" => $parts[4],
			"players" => [
				"count" => $parts[5],
				"max" => $parts[6]
			],
			"gamemode" => $parts[7],
			"bricks" => $parts[8],
			"parsed_name" => $parsed_names
		];
	}

	if(isset($_GET['sort'])) {
		if(ctype_alpha($_GET['sort'])) {
			if(array_key_exists($_GET['sort'], reset($arr)) || $_GET['sort'] == "players") {
				$t = [];

				if($_GET['sort'] != "players") {
					foreach($arr as $addr => $vals) {
						$t[$addr] = strtolower($vals[$_GET['sort']]);
					}
				} else {
					foreach($arr as $addr => $vals) {
						$t[$addr] = strtolower($vals["players"]["count"]);
					}				
				}

				if($_GET['order'] == "desc") {
					array_multisort($t, SORT_DESC, SORT_NATURAL, $arr);
				} else {
					array_multisort($t, SORT_ASC, SORT_NATURAL, $arr);
				}
			}
		}
	}

	if(isset($_GET['hide'])) {
		$opts = split(",", $_GET['hide']);

		foreach($opts as $opt) {
			switch($opt) {
				case "empty":
					foreach($arr as $addr => $vals) {
						if($vals["players"]["count"] == 0) {
							unset($arr[$addr]);
						}
					}
					break;

				case "full":
					foreach($arr as $addr => $vals) {
						if($vals["players"]["count"] >= $vals["players"]["max"]) {
							unset($arr[$addr]);
						}
					}
					break;

				case "locked":
					foreach($arr as $addr => $vals) {
						if($vals["locked"]) {
							unset($arr[$addr]);
						}
					}
					break;						
			}
		}
	}

	die(json_encode($arr, isset($_GET['pretty']) ? JSON_PRETTY_PRINT : NULL));
?>