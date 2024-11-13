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
      let response, items, metadata = {}, error = null;

      try {
        response = await getContent(new URL(request.url).pathname.slice(1) || '');
        items    = Array.isArray(response?.data) ? response.data : [response.data];
      } catch (e) { return { items: [], metadata: {}, loading: false, error: 'Failed to fetch content from GitHub' }; }

      const metadataFile = items.find(i => i.name === '.metadata.json');
      if (metadataFile) try {
        response = await getContent(metadataFile.path);
        metadata = JSON.parse(atob(response.data.content));
      } catch {}

      items = items.filter(i => !i.name.startsWith('.') && !hiddenItems.includes(i.name)); // Remove hidden and unnecessary files/folders

      return { items, metadata, loading: false, error };
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