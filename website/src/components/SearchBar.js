import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ onSearch }) => {
	const [query, setQuery] = React.useState("");

	return (
		<div className="relative animate-fadeIn">
			<input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
				placeholder="Search files..."
				className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
			/>
			<Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
		</div>
	);
};

export default SearchBar;
