import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useLoaderData, useSearchParams } from "react-router-dom";

import TopBar from "./TopBar";
import ItemGrid from "./ItemGrid";
import FileDetails from "./FileDetails";
import StatusBar from "./StatusBar";

export default () => {
	const { items = [], metadata = {}, loading = false, error } = useLoaderData();
	const [query, setQuery] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [filteredItems, setFilteredItems] = useState(items);
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const currentPath = location.pathname.replace(/^\//, "");

    if (loading) return <div className="w-full p-4 text-center">Loading...</div>;
    if (error) return (
        <div className="w-full p-4 text-center text-red-500">
            <p>{error}</p>
            <p>Visit the repository directly: <a href="https://github.com/hondatabase/files-archive">https://github.com/hondatabase/files-archive</a></p>
        </div>
    );

    useEffect(() => {
        let fileParam = searchParams.get('file');
        if (fileParam && !selectedFile) {
            let item = items.find(f => f.path === fileParam);
            item && setSelectedFile(item);
        }

    }, [items, searchParams, selectedFile]);

    const sortedItems = items.slice().sort((a, b) => (a.type === b.type ? 0 : a.type === "dir" ? -1 : 1));

    if (loading) return <div className="w-full p-4 text-center">Loading...</div>;

    const handleItemSelect = item => {
        if (item.type === "dir")
			navigate(`/${item.path}`);
        else {
            setSelectedFile(item);
            setSearchParams({ file: item.path });
        }
    };

    const handleCloseDetails = () => {
        setSelectedFile(null);
        setSearchParams({});
    };

    const handleSearch = useCallback(query => {
        setFilteredItems(!query.trim() ? items : items.filter(item => item.name.toLowerCase().includes(query.toLowerCase())));
		setQuery(query);
    }, [items]);

    return (
        <div className="w-full min-h-screen bg-white">
            <TopBar
                currentPath={currentPath}
                onSearch={handleSearch}
                onNavigate={navigate}
            />
            <div className="pt-20">
                <ItemGrid
                    items={filteredItems}
                    onItemClick={handleItemSelect}
                    metadata={metadata}
                />
            </div>
            {selectedFile && (
                <FileDetails
                    file     = {selectedFile}
                    metadata = {metadata}
                    onClose  = {handleCloseDetails}
                />
            )}
			<StatusBar fileCount={files.length} />
        </div>
    );
};