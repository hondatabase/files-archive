import React from "react";

	return <div className="fixed bottom-0 left-0 right-0 bg-gray-100 text-center p-2 border-t flex justify-between">
		<div className="text-left">{fileCount} file{fileCount === 1 ? "" : "s"}.</div>
	</div>;
};

export default ({fileCount, query, queryFileCount}) => (
