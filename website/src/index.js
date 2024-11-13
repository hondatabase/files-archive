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
      let path = new URL(request.url).pathname.slice(1);
      let response;
      try { response = await new Octokit().repos.getContent({ owner: 'hondatabase', repo: 'files-archive', path: path || '' }); } catch {}
      let data = response?.data || [];
      let filesArray = Array.isArray(data) ? data : [data];
      let files = filesArray
        .filter(f => !f.name.startsWith('.') && !hiddenItems.includes(f.name))
        .map((f, idx) => ({ ...f, uniqueId: `${f.sha}-${idx}` }));
      return { files, loading: false };
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