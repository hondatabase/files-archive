import json
from datetime import datetime

with open('obd1_components.json', 'r') as f: data = json.load(f)

grouped_data = []

for i in range(len(data)):
	for j in range(i+1, len(data)):
		if data[i]['type'] == data[j]['type'] and data[i]['specs'] == data[j]['specs'] and data[j] not in grouped_data:
			grouped_data.append(data[j])
	if data[i] not in grouped_data:
		grouped_data.append(data[i])

# Sort the 'ids' list in each node
for node in grouped_data: node['ids'] = sorted(node['ids'])
	
grouped_data = sorted(grouped_data, key=lambda x: x['ids'][0])

timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
with open(f'{timestamp}.json', 'w') as f: json.dump(grouped_data, f, indent=4)