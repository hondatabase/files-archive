<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="description" content="">
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<?php
			foreach (glob('*.jpg') as $file) {
				echo "<h2>$file</h2>";
				echo "<img src='$file' alt='$file'>";
			}
		?>
	</body>
</html>