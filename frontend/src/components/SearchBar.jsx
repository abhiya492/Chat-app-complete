import { Search, X } from "lucide-react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="p-2 md:p-3">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="size-4 text-base-content/40 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-sm w-full pl-9 pr-9 bg-base-200/70 border-base-300/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all rounded-xl hover:bg-base-200/90 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-error hover:scale-110 transition-all"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
