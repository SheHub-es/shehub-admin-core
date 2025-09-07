// 'use client';

// import React, { useEffect, useRef, useState } from 'react';

// const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//   </svg>
// );

// const XMarkIcon = ({ className }: { className?: string }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//   </svg>
// );

// interface AdvancedSearchInputProps {
//   searchTerm: string;
//   setSearchTerm: (term: string) => void;
//   getSearchSuggestions: (term: string, limit?: number) => string[];
//   placeholder?: string;
// }

// export const AdvancedSearchInput: React.FC<AdvancedSearchInputProps> = ({
//   searchTerm,
//   setSearchTerm,
//   getSearchSuggestions,
//   placeholder = "Buscar por email, nombre, dominio o roles..."
// }) => {
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (searchTerm.length > 1) {
//       const newSuggestions = getSearchSuggestions(searchTerm, 8);
//       setSuggestions(newSuggestions);
//       setShowSuggestions(newSuggestions.length > 0);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//     setSelectedSuggestionIndex(-1);
//   }, [searchTerm, getSearchSuggestions]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
//         setShowSuggestions(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'ArrowDown') {
//       e.preventDefault();
//       setSelectedSuggestionIndex(prev => 
//         prev < suggestions.length - 1 ? prev + 1 : prev
//       );
//     } else if (e.key === 'ArrowUp') {
//       e.preventDefault();
//       setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
//     } else if (e.key === 'Enter') {
//       e.preventDefault();
//       if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
//         handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
//       }
//     } else if (e.key === 'Escape') {
//       setShowSuggestions(false);
//       setSelectedSuggestionIndex(-1);
//     }
//   };

//   const handleSuggestionSelect = (suggestion: string) => {
//     setSearchTerm(suggestion);
//     setShowSuggestions(false);
//     setSelectedSuggestionIndex(-1);
//     inputRef.current?.focus();
//   };

//   const clearSearch = () => {
//     setSearchTerm('');
//     setShowSuggestions(false);
//     inputRef.current?.focus();
//   };

//   const getSearchTypeIndicator = () => {
//     if (!searchTerm.trim()) return null;

//     const term = searchTerm.toLowerCase().trim();
    
//     if (term.includes('@')) {
//       if (term.startsWith('@')) {
//         return <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Dominio</span>;
//       } else if (term.split('@').length === 2 && term.split('@')[1]) {
//         return <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Email Completo</span>;
//       } else {
//         return <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Usuario Email</span>;
//       }
//     } else if (term.length === 2) {
//       return <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">Iniciales</span>;
//     } else if (term.includes(' ')) {
//       return <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Múltiples Términos</span>;
//     } else {
//       return <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">Texto General</span>;
//     }
//   };

//   return (
//     <div ref={containerRef} className="relative w-full max-w-md">
//       <div className="relative">
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
//         </div>
        
//         <input
//           ref={inputRef}
//           type="text"
//           value={searchTerm}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           onFocus={() => {
//             if (suggestions.length > 0) {
//               setShowSuggestions(true);
//             }
//           }}
//           className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//           placeholder={placeholder}
//         />
        
//         {searchTerm && (
//           <div className="absolute inset-y-0 right-0 flex items-center">
//             <button
//               onClick={clearSearch}
//               title="Limpiar búsqueda"
//               className="h-full px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
//             >
//               <XMarkIcon className="h-4 w-4" />
//             </button>
//           </div>
//         )}
//       </div>

//       {getSearchTypeIndicator() && (
//         <div className="mt-2 flex justify-start">
//           {getSearchTypeIndicator()}
//         </div>
//       )}

//       {showSuggestions && suggestions.length > 0 && (
//         <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//           {suggestions.map((suggestion, index) => (
//             <div
//               key={index}
//               onClick={() => handleSuggestionSelect(suggestion)}
//               className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
//                 index === selectedSuggestionIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
//               }`}
//             >
//               <span className="truncate">{suggestion}</span>
//               {suggestion.includes('@') ? (
//                 <span className="text-xs text-blue-500 ml-2">Email</span>
//               ) : (
//                 <span className="text-xs text-gray-400 ml-2">Nombre</span>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };
