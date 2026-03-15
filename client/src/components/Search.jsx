import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa"; // For mobile back button
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

const Search = ({ isMobile }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // LOGIC: Check if we are on the search page
    const isSearchPage = location.pathname === "/search";

    // LOGIC: Get the search term from the URL (e.g., ?q=milk -> milk)
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get("q") || "";

    const [searchInput, setSearchInput] = useState(initialSearch);

    // Sync input field if user navigates back/forward in browser
    useEffect(() => {
        setSearchInput(initialSearch);
    }, [initialSearch]);

    const handleOnChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
    };

    const handleSearchSubmit = () => {
        const trimmed = searchInput.trim();
        if (!trimmed) return;
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearchSubmit();
        }
    };

    return (
        <div className={`flex items-center w-full group ${isMobile ? 'max-w-full' : 'max-w-xl'}`}>
            <div className='flex w-full items-center border border-brand-cream-dark rounded-full group-focus-within:border-brand-secondary overflow-hidden px-4 py-1 bg-brand-cream'>

                {/* LOGIC: Show Back Arrow on Mobile Search Page, otherwise show Search Icon */}
                <div className='flex items-center justify-center'>
                    {(isMobile && isSearchPage) ? (
                        <Link to={"/"} className='text-brand-primary pr-2'>
                            <FaArrowLeft size={18} />
                        </Link>
                    ) : (
                        <button
                            type='button'
                            onClick={handleSearchSubmit}
                            className='text-lg pr-2 text-gray-400'
                            aria-label='Search'
                        >
                            <IoSearchOutline className='text-brand-primary' />
                        </button>
                    )}
                </div>

                <div className='w-full relative flex items-center cursor-pointer h-8'>
                    <input
                        type='text'
                        value={searchInput}
                        onChange={handleOnChange}
                        onKeyDown={handleKeyDown}
                        className='w-full outline-none bg-transparent text-sm py-1 z-10 cursor-pointer text-brand-text'
                        autoFocus={isSearchPage}
                        placeholder={isSearchPage ? "Search for products..." : ""}
                    />

                    {/* Only show animation if not on search page and input is empty */}
                    {(!searchInput && !isSearchPage) && (
                        <div className='absolute left-0 text-sm text-gray-400 pointer-events-none'>
                            <TypeAnimation
                                sequence={[
                                    'Search "helmet"', 2000,
                                    'Search "top box"', 2000,
                                    'Search "visor"', 2000,
                                    'Search "intercom"', 2000
                                ]}
                                repeat={Infinity}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Search