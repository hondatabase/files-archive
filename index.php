<?php
// Take a POST request to upload a file
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	define('UPLOAD_TMP_DIR', sys_get_temp_dir() . '/hondatabase');

	header('Content-Type: application/json');

	if (!$_FILES['file']) {
		echo json_encode(['error' => 'No file was uploaded.']);
		http_response_code(400);
		exit;
	}

	if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
		echo json_encode(['error' => 'An error occurred while uploading the file.']);
		http_response_code(500);
		exit;
	}

	$file      = $_FILES['file'];
	$file_size = $file['size'];
	$file_name = preg_replace('/[^a-zA-Z0-9\.\-_]/', '', $file['name']); // Sanitize the file name, just in case
	$file_path = UPLOAD_TMP_DIR . '/' . basename($file_name);

	// File must have an extension
	if (strpos($file_name, '.') === false) {
		echo json_encode(['error' => 'File must have an extension.']);
		http_response_code(400);
		exit;
	}

	// Don't take files bigger than 2MB
	if ($file_size > 2 * 1024 * 1024) {
		echo json_encode(['error' => 'File must be smaller than 2MB.']);
		http_response_code(406);
		exit;
	}

	// Check if it already exists
	if (file_exists(UPLOAD_TMP_DIR . '/' . $file_name)) {
		echo json_encode(['error' => 'File already exists.']);
		http_response_code(409);
		exit;
	}

	// Make sure the temporary directory where the file will be upload, can take this file's size, as I only want that folder to have a maximum of 1GB
	// There's no upload_tmp_dir specified in the php.ini, so we'll use the system's temporary directory
	$upload_tmp_dir_size = array_sum(array_map('filesize', glob(UPLOAD_TMP_DIR . '/*')));
	$upload_tmp_dir_remaining_space = 1 * 1024 * 1024 * 1024 - $upload_tmp_dir_size;

	// Make sure there is enough space inside the folder, considering we only want to the folder to be no more than 1GB big
	if ($file_size > $upload_tmp_dir_remaining_space) {
		$mb_remaining = $upload_tmp_dir_remaining_space / (1024 * 1024);
		echo json_encode(['error' => "Not enough space in the temporary upload directory. {$mb_remaining}MB remaining."]);
		http_response_code(507);
		exit;
	}

	file_put_contents($file_path . '.json', json_encode([
		'upload_dir'  => $_POST['upload_dir'],
		'description' => $_POST['description'],
		'author'      => $_POST['author'],
		'created_by'  => $_POST['created_by']
	], JSON_PRETTY_PRINT));

	echo json_encode(['success' => true]);

	move_uploaded_file($file['tmp_name'], $file_path);

	http_response_code(200);

	exit;
}

function GetDirectoryEntries($dir) {
	$entries = [];

	foreach (scandir($dir) as $entry) {
		if (in_array($entry, ['.', '..', 'index.html', 'index.php'])) continue;

		$entries[] = $entry;
	}

	return $entries;
}

function GetFileProperties($file) {
	return [
		'description' => '',
		'size'        => filesize($file)
	];
}

function GetDirectoryProperties($dir) {
	$result = [];

	foreach (GetDirectoryEntries($dir) as $entry) {
		$entry_path = "$dir/$entry";

		if (is_dir($entry_path)) {
			$result[$entry] = GetDirectoryProperties($entry_path);
			$result[$entry]['description'] = '';
		} else
			$result[$entry] = GetFileProperties($entry_path);
	}

	return $result;
}

if (!file_exists('dirlisting.json')) {
	$dirlisting = [];

	foreach (scandir(getcwd()) as $entry) {
		if (in_array($entry, ['.', '..', 'dirlisting.json', 'index.php'])) continue;

		$dirlisting[$entry] = is_dir($entry) ? GetDirectoryProperties($entry) : GetFileProperties($entry);
	}

	file_put_contents('dirlisting.json', json_encode($dirlisting));
}
?>
<!--
	For Hondatabase.com

	Flávio Pereira - https://flaviopereira.dev
-->
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="Hondatabase's File Archive">

	<!-- Open Graph meta -->
	<meta property="og:title" content="Hondatabase's File Archive">
	<meta property="og:description" content="Grab all your technical Honda-related files here!">
	<meta property="og:image" content="https://www.hondatabase.com/favicon-192.png">
	
	<link rel="icon" sizes="16x16" href="https://www.hondatabase.com/favicon.png">
	<link rel="icon" sizes="24x24" href="https://www.hondatabase.com/favicon-24.png">
	<link rel="icon" sizes="32x32" href="https://www.hondatabase.com/favicon-32.png">
	<link rel="icon" sizes="64x64" href="https://www.hondatabase.com/favicon-64.png">
	<link rel="icon" sizes="192x192" href="https://www.hondatabase.com/favicon-192.png">

	<title>Hondatabase's File Archive</title>

	<style>
		body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

		#upload { display: none; }

		#loading {
			font-size : 1.5em;
			color     : #555;
		}

		#spinner {
			display      : inline-block;
			border       : 4px solid rgba(0, 0, 0, 0.1);
			border-top   : 4px solid #007bff;
			border-radius: 50%;
			width        : 24px;
			height       : 24px;
			animation    : spin 1s linear infinite;
		}

		@keyframes spin {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}

		#loading span:last-child {
			vertical-align: top;
			margin-left   : 0.5em;
		}

		ul {
			display        : none;
			padding        : 0;
			list-style-type: none;
			transition     : opacity 2s;
		}

		li {
			opacity   : 0;
			transition: opacity 0.5s;
		}

		
		a {
			color      : #007bff;
			font-weight: 500;
		}
		
		details {
			margin-bottom: .2em;
			transition   : all 0.5s ease-in-out;
		}

		details:hover { background-color: #F9F9F9; }

		details details, details > *:not(summary) { margin-left: 1em; }
		
		details p {
			margin-bottom: 0.5em;
			color        : #444;
		}

		details > span {
			display    : block;
			margin-left: 2.5em;
			font-size  : .8em;
			color      : #777;
		}

		details > img {
			margin-top   : 0.5em;
			max-width    : 90%;
			border       : 1px solid #ccc;
			border-radius: 5px;
			box-shadow   : 0 0 5px rgba(0, 0, 0, 0.1);
		}
		
		details > summary {
			cursor         : pointer;
			list-style-type: none;
			text-wrap      : nowrap;
		}

		details > summary > img {
			vertical-align: middle;
			height        : 24px;
			margin-right  : 0.5em;
			filter        : invert(0.8);
		}

		footer {
			position  : fixed;
			bottom    : 0;
			width     : 100%;
			text-align: center;
			font-size : 0.8em;
			color     : #666;
		}

		dialog > form {
			margin-top     : 1em;
			display        : flex;
			flex-direction : column;
			align-items    : center;
			justify-content: center;
		}

		dialog > form > * { margin-bottom: 0.5em; }

		dialog > form > label, dialog > span { font-weight: 500; }

		.icon {
			height: 24px;
			/* filter: invert(0.8) sepia(0.1) saturate(3) hue-rotate(180deg); */
		}
	</style>
</head>

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-236W2PB4K5"></script>
<script>
	window.dataLayer = window.dataLayer || [];
	function gtag(){dataLayer.push(arguments);}
	gtag('js', new Date());
	gtag('config', 'G-236W2PB4K5');
</script>

<body>
	<header>
		<h1>Hondatabase's File Archive</h1>
		<h2>Welcome</h2>
		<p>Welcome, to <i><b>Hondatabase</b></i>'s file archive.</p>
		<p>Here you'll find all the technical files you need for your Honda. From service manuals, tuning programs to wiring diagrams... We've got you covered.</p>
		<p>Items marked with a <img src="icons/info.png" alt="Info Icon" class="icon"> contain a description. Hover the icon or open the item to view it.</p>
		<p>If you would like to share your files, you can do so by clicking the <img src="icons/upload_file.png" alt="File Upload Icon" class="icon"> icon, when inside each folder, to bring up the upload dialog.</p>
		<p><small>This server only allows one connection at a time, and download speed is capped at 1MB/s.</small></p>
	</header>
	<main>
		<h2>Directory Listing</h2>
		<span id="loading"><span id="spinner"></span><span></span></span>
		<ul></ul>
	</main>
	<footer><a href="mailto:hondatabase@flaviopereira.dev">Hondatabase</a></footer>

	<dialog>
		<span style="font-weight: 500;">Uploading to: <span style="font-weight: normal;">/</span></span>
		<form method="post" enctype="multipart/form-data">
			<input type="hidden" name="upload_dir" value="/">
			<label for="file">Select a file to upload (Max 2Mb):</label>
			<input type="file" id="file" name="file" accept="*/*" required>
			<label for="author">Your Name:</label>
			<input type="text" id="author" name="author" placeholder="E-mail, Discord Username/ID, etc." required>
			<label for="description">Description:</label>
			<textarea id="description" name="description" placeholder="What is this file?" required></textarea>
			<label for="created_by">Created by:</label>
			<input type="text" id="created_by" name="created_by" placeholder="Who created this file?" required>

			<button type="submit">Upload</button>
		</form>
	</dialog>
	
	<img id="upload" src="icons/upload_file.png" alt="Upload" title="Upload a file" class="icon">

	<script>
		isFileAnImage    = fileExtension => ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension);
		isEntryDirectory = entry => entry.indexOf('.') === -1;
		getFileExtension = file => file.toLowerCase().split('.').pop();
		setURLHash       = hash => history.replaceState(null, null, location.hash ? location.href.replace(location.hash, '') + '#' + hash : location.href + '#' + hash);

		const dialog     = document.getElementsByTagName('dialog')[0];
		const dialogForm = dialog.getElementsByTagName('form')[0];
		const upload     = document.getElementById('upload');

		function createFileEntry(parent, name, file, path) {
			const fileExtension = getFileExtension(name);

			const details = document.createElement('details');
			const summary = document.createElement('summary');

			details.id = name;
			
			if (file.displayName) name = file.displayName;

			summary.style.fontWeight = 300;

			let fileIcon  = 'unknown';
			let fileTitle = 'Unknown';
			switch (fileExtension) {
				case 'exe':
					fileIcon  = 'desktop_landscape';
					fileTitle = 'Executable';
					break;

				case 'pdf':
					fileIcon  = 'pdf';
					fileTitle = 'PDF Document';
					break;

				case 'bin':
					fileIcon  = 'memory';
					fileTitle = 'ROM - Binary';
					break;

				case 'zip': case 'rar': case '7z' : case 'tar': case 'gz' : case 'bz2': 
					fileIcon  = 'folder_zip';
					fileTitle = 'Compressed Archive';
					break;
			
				case 'jpg' : case 'jpeg': case 'png' : case 'gif' : case 'bmp' : case 'svg' : 
					fileIcon  = 'image';
					fileTitle = 'Image File';
					break;

				case 'xls' : case 'xlsx': case 'csv' : 
					fileIcon  = 'data_table';
					fileTitle = 'Spreadsheet';
					break;

				case 'dwg': case 'dxf':
					fileIcon  = 'gesture';
					fileTitle = 'CAD Drawing';
					break;

				case 'stl':
					fileIcon  = 'view_in_ar';
					fileTitle = 'Stereolithography - 3D Printing Model';
					break;

				case 'kdl':
					fileIcon  = 'data_thresholding';
					fileTitle = 'KTuner Datalog';
					break;

				case 'log':
					fileIcon  = 'data_thresholding';
					fileTitle = 'Log File';
					break;

				case 'txt':
					fileIcon  = 'description';
					fileTitle = 'Text File';
					break;

				case 'js': case 'json': case 'py':
					fileIcon  = 'code';
					fileTitle = 'Web File';
					break;

				case 'html':
					fileIcon  = 'html';
					fileTitle = 'HTML File';
					break;

				case 'php':
					fileIcon  = 'php';
					fileTitle = 'PHP File';
					break;

				case 'ai':
					fileIcon  = 'gesture';
					fileTitle = 'Adobe Illustrator File';
					break;

				case 'kal':
					fileIcon  = 'memory';
					fileTitle = 'Hondata KManager Calibration';
					break;

				case 'skl':
					fileIcon  = 'memory';
					fileTitle = 'Hondata SManager Calibration';
					break;
			}

			summary.innerHTML = `<img src="icons/${fileIcon}.png" alt="${fileTitle}" title="${fileTitle}">${name}`;

			details.appendChild(summary);

			// We'll have a download link either way
			const div = document.createElement('div');
			const a   = document.createElement('a');
			a.href             = path;
			a.target           = '_blank';
			a.textContent      = fileExtension === 'html' || fileExtension === 'php' ? 'View Page' : 'Download';
			a.style.lineHeight = '1.5em';
			
			// If the file has a description, we'll add it to the details
			if (file.description && file.description !== '') {
				const p = document.createElement('p');

				// Detect any URLs in the description and turn them into links. Don't feel like having HTML in the JSON file.
				let description = file.description.replace(/(https?:\/\/[^\s()]+)/g, '<a href="$1" target="_blank">$1</a>');
				description = description.replace(/\n/g, '<br>');
				
				p.innerHTML = description;
				details.appendChild(p);
				
				const info = document.createElement('img');
				info.src                 = 'icons/info.png';
				info.style.marginLeft    = '0.1em';
				info.style.marginRight   = 0;
				info.title               = file.description;
				info.style.cursor        = 'help';
				info.classList.add('icon');

				summary.appendChild(info);
			} else
				summary.title = 'No description available.';
			

			// Show the author, if it's available and not empty
			if (file.author && file.author !== '') {
				const author = document.createElement('span');
				author.textContent = 'Author: ' + file.author;
				details.appendChild(author);
			}

			// If the file is an image, we'll show a preview
			if (isFileAnImage(fileExtension)) {
				const img = document.createElement('img');
				details.addEventListener('toggle', () => img.src = path); // Only load the image if the details are opened
				details.appendChild(img);
			}

			div.appendChild(a);
			
			if (file?.size > 0) {
				const KB = 1024;
				const MB = KB * 1024;
				const GB = MB * 1024;

				const size = document.createElement('span');
				size.style.fontSize = '0.8em';
				size.style.color    = '#555';

				// We'll convert up to to MB and GB if big enough. There's probably a better way to do this, but it's fine for what it is.
				if (file.size > GB) 
					size.textContent = ` ${(file.size / GB).toFixed(2)} GB`;
				else if (file.size > MB) 
					size.textContent = ` ${(file.size / MB).toFixed(2)} MB`;
				else
					size.textContent = ` ${(file.size / KB).toFixed(2)} KB`;

				// Be nice and show an estimated download time, if it's not an image
				if (!isFileAnImage(fileExtension)) {
					const time = document.createElement('span');
					time.style.fontSize = '0.8em';
					time.style.color    = '#777';
					time.title          = 'Download time at 1MB/s';

					const mbPerSecond           = 1; // ? Remember our download speed is capped at 1MB/s?
					const sizeInMB              = file.size / (1024 * 1024);
					const timeRequiredInSeconds = sizeInMB / mbPerSecond;

					if (timeRequiredInSeconds < 1)
						time.textContent = ' less than a second';
					else if (timeRequiredInSeconds < 60)
						time.textContent = ` ~${timeRequiredInSeconds.toFixed(2)} seconds`;
					else if (timeRequiredInSeconds < 3600)
						time.textContent = ` ~${(timeRequiredInSeconds / 60).toFixed(2)} minutes`;
					else
						time.textContent = ` ~${(timeRequiredInSeconds / 3600).toFixed(2)} hours`;

					size.appendChild(time);
				}

				div.appendChild(size);
			}

			details.appendChild(div);
			parent.appendChild(details);
		}

		function createDirectoryEntry(parent, name, data, path) {
			const details          = document.createElement('details');
			const summary          = document.createElement('summary');
			const dialogBreadcrumb = dialog.getElementsByTagName('span')[0];

			details.id = name;

			// Add sum tings to da summary n dat fam
			details.addEventListener('toggle', element => {
				if (element.target.open) {
					dialogForm.upload_dir.value = path;
					dialogBreadcrumb.innerHTML = `Uploading to: <span style="font-weight: normal;">/${path}</span>`;

					summary.appendChild(upload);
				} else
					summary.removeChild(upload);
			});

			if (data.displayName && data.displayName !== '') name = data.displayName; else name = name.charAt(0).toUpperCase() + name.slice(1);

			summary.innerHTML = '<img src="icons/folder.png" alt="Folder" title="Folder">' + name;

			details.appendChild(summary);

			if (data.description && data.description !== '') {
				let description = data.description.replace(/(https?:\/\/[^\s()]+)/g, '<a href="$1" target="_blank">$1</a>');
				description = description.replace(/\n/g, '<br>');

				const p = document.createElement('p');
				p.innerHTML = description;
				details.appendChild(p);

				const info = document.createElement('img');
				info.src                 = 'icons/info.png';
				info.style.marginLeft    = '0.1em';
				info.style.marginRight   = 0;
				info.title               = data.description;
				info.style.cursor        = 'help';

				summary.appendChild(info);
			}

			// Show the author, if it's available and not empty
			if (data.author && data.author !== '') {
				const author = document.createElement('span');
				author.textContent = 'Author: ' + data.author;
				details.appendChild(author);
			}

			for (const entry in data) {
				if (['description', 'author', 'displayName'].includes(entry)) continue;

				const entryData = data[entry];
				const entryPath = `${path}/${entry}`

				isEntryDirectory(entry) ? createDirectoryEntry(details, entry, entryData, entryPath) : createFileEntry(details, entry, entryData, entryPath);
			}

			parent.appendChild(details);
		}

		(async () => {
			const loading      = document.getElementById('loading');
			const loadingText  = loading.getElementsByTagName('span')[1];

			upload.onclick = () => dialog.showModal();

			loading.style.opacity = 1;

			const loadingTextInterval = setInterval(() => loadingText.textContent = 'Fetching Listing Data' + '.'.repeat((Date.now() / 100) % 4), 0);
			
			const entries = await fetch('dirlisting.json').then(response => response.ok ? response.json().then(data => data).catch(() => {}) : {}).catch(() => ({})); // Fucking horrible
			const totalEntries = Object.keys(entries).length;

			clearInterval(loadingTextInterval);

			// Entries need to be sorted folders first, then files. In alphabetical order, independent of case.
			// ! This is shit and I've should done this directly for the JSON. Future me problem I guess.
			function sortEntries(a, b) {
				if (isEntryDirectory(a) && !isEntryDirectory(b)) {
					return -1;
				} else if (!isEntryDirectory(a) && isEntryDirectory(b)) {
					return 1;
				} else {
					return a.localeCompare(b);
				}
			}

			Object.keys(entries).sort(sortEntries).forEach((key, index) => {
				const value = entries[key];
				delete entries[key];
				entries[key] = value;

				// Sort the entries inside the directory. Fuck the other levels. This will be good enough, for now.
				if (isEntryDirectory(key)) {
					Object.keys(entries[key]).sort(sortEntries).forEach((subKey, subIndex) => {
						const subValue = entries[key][subKey];
						delete entries[key][subKey];
						entries[key][subKey] = subValue;
					});
				}
			});

			if (totalEntries === 0) {
				loadingText.textContent = 'No entries found.';
				return;
			}

			const mainUl = document.querySelector('main ul');

			let progress = 0;
			for (const entry in entries) {
				const entryData = entries[entry];
				const li        = document.createElement('li');

				progress++;

				const percentageCompleted = (progress / totalEntries) * 100;
				loadingText.textContent = `${percentageCompleted.toFixed(2)}% Loaded${'.'.repeat(progress % 4)}`;

				isEntryDirectory(entry) ? createDirectoryEntry(li, entry, entryData, entry) : createFileEntry(li, entry, entryData, entry);

				mainUl.appendChild(li);

				await new Promise(resolve => setTimeout(resolve, 25)); // Who doesn't like watching numbers go up?
			}

			// Set the URL hash when opening each details element
			for (const details of document.getElementsByTagName('details')) {
				details.addEventListener('toggle', event => event.target.open && setURLHash(event.target.id));
				details.addEventListener('click', () => details.hasAttribute('open') && setURLHash(details.id));
			}
			
			loading.style.display = 'none';
			mainUl.style.display  = 'block';
			upload.style.display  = 'inline-block';

			// Be nice and open the details if the URL has a hash
			let selectedItem = null;
			if (location.hash) selectedItem = document.getElementById(location.hash.slice(1).replace(/%20/g, ' '));
			
			for (const li of document.getElementsByTagName('li')) {
				li.style.opacity = 1;
				
				// Check if the li has the selected item inside and open da ting up yea blud
				if (li.contains(selectedItem)) {
					for (let parent = selectedItem.parentElement; parent; parent = parent.parentElement) parent.tagName === 'DETAILS' && (parent.open = true);

					selectedItem.open = true;
					li.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
					li.scrollIntoView({ behavior: 'smooth' });

					setTimeout(() => li.style.backgroundColor = '', 5000);
				}

				await new Promise(resolve => setTimeout(resolve, 50));
			}
		})();

		const dialogAuthor = document.getElementById('author');

		// Sending the actual file(s)
		dialogForm.addEventListener('submit', async event => {
			const form = event.target;
			
			event.preventDefault();

			localStorage.setItem('author', dialogAuthor.value);

			const response = await fetch(location.href, {
				method: 'POST',
				body  : new FormData(form)
			});
			
			if (response.ok) {
				const fileName = form.file.files[0].name;

				console.info(fileName + " uploaded successfully!");
				alert(fileName + " uploaded successfully!\n\nThe file will be available once approved by the administrator.");

				form.reset();
				form.parentElement.close();
			} else {
				const jsonResponse = await response.json();
				alert(jsonResponse && jsonResponse.error ? `Error: ${jsonResponse.error}` : `An unknown error occurred while uploading the file. Status Code: ${response.status}`);
			}
		});

		dialogAuthor.value = localStorage.getItem('author') || '';

		// Close the dialog when clicking outside of it
		dialog.addEventListener('click', event => event.target === dialog && dialog.close());
	</script>
</body>
</html>