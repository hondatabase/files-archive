import os
from PIL import Image
import pytesseract
from pytesseract import Output

images = [f for f in os.listdir() if f.endswith('.jpg')]
images.sort()

for file in images:
	try:
		print('-'*50)
		print('Image', file)
		print('-'*50)

		image = Image.open(file)
		data = pytesseract.image_to_string(image, output_type=Output.DICT)

		for line in data['text'].split('\n'):
			if line:
				print(line)

		input('Press Enter to continue...')
	except Exception as e:
		print(str(e))