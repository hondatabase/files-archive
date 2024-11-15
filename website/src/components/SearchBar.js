import React, { useEffect, useCallback } from "react";
import { Search } from "lucide-react";

export default ({ onSearch }) => {
	const [query, setQuery] = React.useState("");
	
	const debouncedSearch = useCallback((fn, delay) => {
		let timeoutId;
		return (...args) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn(...args), delay);
		};
	}, []);

	useEffect(() => debouncedSearch(onSearch, 300)(query), [query, debouncedSearch, onSearch]);

	return (
		<div className="relative animate-fadeIn">
			<input
				type="text"
				value={query}
				onChange={e => setQuery(e.target.value)}
				placeholder="Search files..."
				className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
			/>
			<Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
		</div>
	);
};
