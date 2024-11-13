import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Octokit } from '@octokit/rest';
import FileExplorer from './components/FileExplorer';

import './index.css';

const hiddenItems = ['CNAME', 'website'];

const router = createBrowserRouter([
  {
    path: '*',
    element: <FileExplorer />,
    loader: async ({ request }) => {
      const getContent = path => new Octokit().repos.getContent({ owner: 'hondatabase', repo: 'files-archive', path });
      let response, files, metadata = {};

      try {
        response = await getContent(new URL(request.url).pathname.slice(1) || '');
        files    = Array.isArray(response?.data) ? response.data : [response.data];
      } catch { return { files: [], metadata: {}, loading: false }; }

      const metadataFile = files.find(f => f.name === '.metadata.json');
      if (metadataFile) try {
        response = await getContent(metadataFile.path);
        metadata = JSON.parse(atob(response.data.content));
        files    = files.filter(f => f.name !== '.metadata.json');  // Remove metadata file from files list
      } catch {}

      files = files.filter(f => !f.name.startsWith('.') && !hiddenItems.includes(f.name)); // Remove hidden and unnecessary files/folders

      return { files, metadata, loading: false };
    }
  }
], {
  basename: '/',
  future: {
    v7_startTransition: true,
    v7_relativeSplatRoutes: true,
    v7_fetcherPersist: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
    v7_normalizeFormMethod: true
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);