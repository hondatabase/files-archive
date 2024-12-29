import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useLoaderData, useSearchParams } from 'react-router-dom';

import TopBar from './components/TopBar';
import ItemGrid from './components/ItemGrid';
import FileDetails from './components/FileDetails';
import StatusBar from './components/StatusBar';

export default () => {
    const { items = [], metadata = {}, loading = false, error } = useLoaderData();
    const [query, setQuery] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [filteredItems, setFilteredItems] = useState(items);
    const [showWelcome, setShowWelcome] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPath = location.pathname.replace(/^\//, "");
    const explicitlyClosedRef = useRef(false);

    if (loading) return <div className="w-full p-4 text-center">Loading...</div>;
    if (error) return (
        <div className="w-full p-4 text-center text-red-500">
            <p>{error}</p>
            <p>Visit the repository directly: <a href="https://github.com/hondatabase/files-archive">https://github.com/hondatabase/files-archive</a></p>
        </div>
    );

    useEffect(() => {
        let fileParam = searchParams.get('file');
        if (fileParam && !selectedFile && !explicitlyClosedRef.current) {
            let item = items.find(f => f.path === fileParam);
            item && setSelectedFile(item);
        }
    }, [items, searchParams, selectedFile]);

    useEffect(() => setFilteredItems(items), [items]);

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisitedBefore');
        if (!hasVisited) {
            setShowWelcome(true);
            localStorage.setItem('hasVisitedBefore', 'true');
        }
    }, []);

    const handleItemSelect = item => {
        if (item.type === "dir") navigate(`/${item.path}`);
        else {
            explicitlyClosedRef.current = false;
            setSelectedFile(item);
            setSearchParams({ file: item.path });
        }
    };

    const handleCloseDetails = () => {
        explicitlyClosedRef.current = true;
        setSelectedFile(null);
        setSearchParams({});
    };

    const handleSearch = useCallback(query => {
        setFilteredItems(!query.trim() ? items : items.filter(item => item.name.toLowerCase().includes(query.toLowerCase())));
        setQuery(query);
    }, [items]);

    return (
        <div className="w-full min-h-screen bg-white">
            {showWelcome && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">Welcome to Hondatabase's Files Archive</h2>
                        <p className="mb-4">
                            This is a community-driven archive of mostly legacy Honda-related resources. Browse through our collection using the 
                            search bar or directory navigation.
                        </p>
                        <p className="mb-4">
                            Want to contribute? Visit our{' '}
                            <a 
                                href="https://github.com/hondatabase/files-archive" 
                                className="text-blue-600 hover:underline"
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                GitHub repository
                            </a>{' '}
                            to submit new files or improvements.
                        </p>
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
            <TopBar currentPath={currentPath} onSearch={handleSearch} onNavigate={navigate} />
            <div className="pt-20">
                <ItemGrid items={filteredItems} onItemClick={handleItemSelect} metadata={metadata} />
            </div>
            {selectedFile && (
                <FileDetails file={selectedFile} metadata={metadata} onClose={handleCloseDetails} />
            )}
            <StatusBar fileCount={items.filter(item => item.type === "file").length} query={query} queryFileCount={filteredItems.filter(item => item.type === "file").length}/>
        </div>
    );
};