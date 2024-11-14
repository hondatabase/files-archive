import React from 'react'

import Breadcrumbs from './Breadcrumbs'
import SearchBar from './SearchBar'

export default ({ currentPath, onSearch, onNavigate }) => (
  <div className="fixed top-0 left-0 right-0 bg-white border-b z-20 animate-slideDown">
    <div className="flex flex-col gap-2 p-2 sm:p-4">
      <div className="flex items-center gap-4">
        <div className="text-center uppercase font-semibold">
          Hondatabase
          <div className="text-center capitalize font-normal">File Archive</div>
        </div>
        <div className="hidden sm:block flex-1">
          <Breadcrumbs currentPath={currentPath} navigateTo={path => onNavigate(path)} />
        </div>
        <div className="w-full sm:w-72">
          <SearchBar onSearch={onSearch} />
        </div>
      </div>
      <div className="sm:hidden w-full border-t pt-2">
        <Breadcrumbs currentPath={currentPath} navigateTo={path => onNavigate(path)} />
      </div>
    </div>
  </div>
)