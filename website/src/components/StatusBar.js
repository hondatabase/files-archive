import React from "react";
import { Github } from "lucide-react";

export default ({fileCount, query, queryFileCount}) => (
	<div className="fixed bottom-0 left-0 right-0 bg-gray-100 text-center p-2 border-t flex justify-between">
		<div className="text-left">
			{query ? `${queryFileCount} out of ${fileCount} for query "${query}".` : `${fileCount} file${fileCount === 1 ? "" : "s"}.`}
		</div>
		<div className="text-right">
			<a href="https://github.com/hondatabase/files-archive" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
				<Github className="mr-1 h-4 w-4" /> GitHub
			</a>
		</div>
	</div>
);