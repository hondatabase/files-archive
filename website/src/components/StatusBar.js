import React from "react";

export default ({fileCount, query, queryFileCount}) => (
	<div className="fixed bottom-0 left-0 right-0 bg-gray-100 text-center p-2 border-t flex justify-between">
		<div className="text-left">
		{query ? `${queryFileCount} out of ${fileCount} for query "${query}".` : `${fileCount} file${fileCount === 1 ? "" : "s"}.`}
		</div>
	</div>
);