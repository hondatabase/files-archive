import React from "react"

const Breadcrumbs = ({ currentPath, navigateTo }) => {
  let isHome = !currentPath
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <span
        className={`cursor-pointer whitespace-nowrap ${isHome ? 'text-gray-400' : 'hover:underline'}`}
        onClick={() => !isHome && navigateTo('/')}>
        Home
      </span>
      {currentPath && <span>/</span>}
      {currentPath.split('/').map((part, index, array) => (
        <React.Fragment key={index}>
          <span
            className="cursor-pointer hover:underline whitespace-nowrap"
            onClick={() => navigateTo(`/${array.slice(0, index + 1).join('/')}`)}>
            {part}
          </span>
          {index < array.length - 1 && <span>/</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

export default Breadcrumbs
