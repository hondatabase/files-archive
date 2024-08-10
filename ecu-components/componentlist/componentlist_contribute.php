<?php
if (!isset($_SERVER['HTTP_REFERER']) || $_SERVER['HTTP_REFERER'] !== 'http://files.hondatabase.com/ecu-components/componentlist/componentlist.html') {
	http_response_code(403);
	exit;
}

if (!$_SERVER['REQUEST_METHOD'] == 'POST') {
	http_response_code(405);
	exit;
}

$user     = $_POST['user'];
$rowIndex = $_POST['rowIndex'];
$rowData  = json_decode($_POST['rowData'], true);

// Make sure all three fields are set
if (!isset($user, $rowIndex, $rowData)) {
	http_response_code(400);
	exit;
}

if (filter_var($user, FILTER_VALIDATE_EMAIL)) {
	$userPfp = 'https://www.gravatar.com/avatar/' . md5(strtolower($user)) . '?d=identicon';
} else if (is_numeric($user)) {
	$ch = curl_init("https://discord.com/api/users/$user");
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$discordUser = json_decode(curl_exec($ch), true);
	curl_close($ch);

	if (!isset($discordUser['username'])) {
		http_response_code(400);
		exit;
	}

	$userPfp = 'https://cdn.discordapp.com/avatars/' . $discordUser['id'] . '/' . $discordUser['avatar'] . '.png';
}

$json     = json_decode(file_get_contents('https://gist.githubusercontent.com/VIRUXE/3187356a6d001f96c0c3a71c43b38ba4/raw'), true);
$original = $json['components'][$rowIndex];

$webhookData = [
	'content'  => "New contribution for node $rowIndex",
	'username' => "$user ({$_SERVER['REMOTE_ADDR']})",
	'embeds'   => [
		[
			'title'  => 'New Data',
			'fields' => array_map(function($key, $value) {
				return [
					'name'   => ['ID(s)', 'Type', 'Specs', 'Notes'][$key],
					'value'  => $value,
					'inline' => true
				];
			}, array_keys($rowData), $rowData),
			'color' => 0x00FF00
		],
		[
			'title'  => 'Original Data',
			'fields' => array_map(function($key, $value) {
				return [
					'name'   => $key,
					'value'  => is_array($value) ? implode(', ', $value) : $value,
					'inline' => true
				];
			}, array_keys($original), $original),
			'color' => 0xFF0000
		]
	]
];

if (isset($userPfp)) $webhookData['avatar_url'] = $userPfp;

file_get_contents('https://discord.com/api/webhooks/1253490758728810557/_iLb2cLrbjLkjQhogrRZ-fzzk3QuORpEGFoxXGEUMzP6OK1RvwkW1nqzzcn0HNPW9EWZ',
	false, stream_context_create([
		'http' => [
			'header'  => 'Content-Type: application/json',
			'method'  => 'POST',
			'content' => json_encode($webhookData),
		],
	]));

// file_put_contents('webhook.log', json_encode($webhookData, JSON_PRETTY_PRINT) . PHP_EOL, FILE_APPEND);

http_response_code(200);