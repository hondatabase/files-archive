import React from "react"
import { File, Folder } from "lucide-react"

const FileGrid = ({ files, onFileClick, metadata = {} }) => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 p-4">
    {files.map(file => {
      let nameParts = file.type === "dir" ? [file.name] : file.name.split(/(?=\.[^.]+$)/);
      let totalLength = file.name.length;
      let shouldTruncate = totalLength > 30;
      let mainContent = nameParts[0].split(/--\s*/)[1] || nameParts[0];
      let displayName = metadata[file.name]?.displayName || (shouldTruncate ? 
        mainContent.slice(0, 12) + '...' :
        file.type === "dir" ? file.name : 
        nameParts[0] + (nameParts[1] || ''));

      return (
        <div
          key={file.uniqueId}
          onClick={() => onFileClick(file)}
          title={metadata[file.name]?.displayName || file.name}
          className="group flex flex-col items-center p-2 rounded cursor-pointer hover:bg-blue-50 focus:bg-blue-100 w-full max-w-[120px] transition-transform transform hover:scale-105">
          {file.type === "dir" ? 
            <Folder size={48} className="text-yellow-500 mb-2" /> : 
            <File size={48} className="text-blue-500 mb-2" />
          }
          <span className="text-sm text-center w-full group-hover:text-blue-600 break-words">
            {displayName}
          </span>
        </div>
      );
    })}
  </div>
);

export default FileGrid
