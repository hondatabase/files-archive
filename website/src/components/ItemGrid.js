import React from "react"
import { File, Folder, Images, FileText, Archive } from "lucide-react"
import { Tooltip } from "react-tooltip"

export default ({ items, onItemClick, metadata = {} }) => {
  const isImageFile = name => /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name);
  const isPdfFile = name => /\.pdf$/i.test(name);
  const isArchiveFile = name => /\.(zip|rar|7z|tar|gz)$/i.test(name);

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 p-4 pt-10 sm:pt-0">
        {items.map((item, idx) => {
          let nameParts = item.type === "dir" ? [item.name] : item.name.split(/(?=\.[^.]+$)/);
          let totalLength = item.name.length;
          let shouldTruncate = totalLength > 30;
          let mainContent = nameParts[0].split(/--\s*/)[1] || nameParts[0];
          let displayName = metadata[item.name]?.displayName || (shouldTruncate ? 
            mainContent.slice(0, 12) + '...' :
            item.type === "dir" ? item.name : 
            nameParts[0] + (nameParts[1] || ''));

          const icon = item.type === "dir" ? <Folder size={48} className="text-yellow-500 mb-2" /> :
                      isImageFile(item.name) ? <Images size={48} className="text-green-500 mb-2" /> :
                      isPdfFile(item.name) ? <FileText size={48} className="text-red-500 mb-2" /> :
                      isArchiveFile(item.name) ? <Archive size={48} className="text-purple-500 mb-2" /> :
                      <File size={48} className="text-blue-500 mb-2" />;

          return (
            <div
              key={idx}
              onClick={() => onItemClick(item)}
              data-tooltip-id="item-tooltip"
              data-tooltip-content={metadata[item.name]?.displayName || item.name}
              className="group flex flex-col items-center p-2 rounded cursor-pointer hover:bg-blue-50 focus:bg-blue-100 w-full max-w-[120px] transition-transform transform hover:scale-105">
              {icon}
              <span className="text-sm text-center w-full group-hover:text-blue-600 break-words">{displayName}</span>
            </div>
          );
        })}
      </div>
      <Tooltip id="item-tooltip" className="!z-[9999]" />
    </>
  );
};