import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useLoaderData, useSearchParams } from "react-router-dom";

import TopBar from "./TopBar";
import FileGrid from "./FileGrid";
import FileDetails from "./FileDetails";

const FileExplorer = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { files = [], metadata = {}, loading = false, error } = useLoaderData();
    const currentPath = location.pathname.replace(/^\//, "");

    if (loading) return <div className="w-full p-4 text-center">Loading...</div>;
    if (error) return <div className="w-full p-4 text-center text-red-500">{error}</div>;

    useEffect(() => {
        let fileParam = searchParams.get('file');
        if (fileParam && !selectedFile) {
            let file = files.find(f => f.path === fileParam);
            file && setSelectedFile(file);
        }
    }, [files, searchParams]);

    if (loading) return <div className="w-full p-4 text-center">Loading...</div>;

    const sortedFiles = files.slice().sort((a, b) => (a.type === b.type ? 0 : a.type === "dir" ? -1 : 1));

    const handleFileSelect = (file) => {
        if (file.type === "dir") navigate(`/${file.path}`);
        else {
            setSelectedFile(file);
            setSearchParams({ file: file.path });
        }
    };

    const handleCloseDetails = () => {
        setSelectedFile(null);
        setSearchParams({});
    };

    return (
        <div className="w-full min-h-screen bg-white">
            <TopBar
                currentPath = {currentPath}
                onSearch    = {(query) => console.log(query)}
                onNavigate  = {navigate}
            />
            <div className="pt-20">
                <FileGrid
                    files       = {sortedFiles}
                    onFileClick = {handleFileSelect}
                    metadata    = {metadata}
                />
            </div>
            {selectedFile && (
                <FileDetails
                    file     = {selectedFile}
                    metadata = {metadata}
                    onClose  = {handleCloseDetails}
                />
            )}
        </div>
    );
};

export default FileExplorer;
