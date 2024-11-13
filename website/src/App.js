import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import FileExplorer from './components/FileExplorer';

function App() {
  return (
	<BrowserRouter>
		{/* <div> */}
			{/* <h1 className="text-3xl font-bold text-center my-8">GitHub Repository Explorer</h1> */}
			<Routes>
				<Route path="*" element={<FileExplorer />} />
			</Routes>
		{/* </div> */}
	</BrowserRouter>
  );
}

export default App;