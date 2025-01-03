import React, { useState } from "react";
import { FileText, Download, X, Image, Loader2 } from "lucide-react";

export default ({ file, metadata = {}, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);

	const formatSize = (bytes) =>
		bytes < 1024
			? `${bytes} B`
			: bytes < 1048576
			? `${(bytes / 1024).toFixed(1)} KB`
			: `${(bytes / 1048576).toFixed(1)} MB`;

	const author      = metadata[file.name]?.author;
	const description = metadata[file.name]?.description;
	let isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);

	const handleBackdropClick = e => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
			onClick={handleBackdropClick}>
			<div
				className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 animate-slideIn"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true">
				<div className="p-6">
					<div className="flex justify-between items-start mb-6">
						<div className="flex items-center gap-3">
							{isImage ? <Image size={24} /> : <FileText size={24} />}
							<h2 className="text-lg font-medium">{file.name}</h2>
						</div>
						<div className="flex gap-2">
							<a
								href={file.download_url}
								className="p-2 hover:bg-gray-100 rounded"
								download>
								<Download size={20} />
							</a>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded">
								<X size={20} />
							</button>
						</div>
					</div>
					<div className="space-y-4">
						{description && (
							<div className="prose prose-sm">
								<h3 className="text-gray-700 font-semibold">Description</h3>
								<p className="text-gray-600">{description}</p>
							</div>
						)}
						{isImage && (
							<div className="mb-4 h-48 overflow-hidden rounded relative">
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                        <Loader2 className="animate-spin" size={24} />
                                    </div>
                                )}
								<img
									src={`${file.download_url}?w=400`}
									alt={file.name}
									className={`w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
									onClick={() => window.open(file.download_url, '_blank')}
									onLoad={() => setIsLoading(false)}
									loading="lazy"
								/>
							</div>
						)}
						<div className="flex justify-between text-sm text-gray-600">
							{author && <div><span className="font-semibold">Author:</span> {author}</div>}
							<div><span className="font-semibold">Size:</span> {formatSize(file.size)}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};