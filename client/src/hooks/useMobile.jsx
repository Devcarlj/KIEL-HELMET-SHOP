import { useEffect, useState } from "react";

const useMobile = (breakpoint = 768) => {
    // 1. Initialize state with a check to see if window exists (safe coding)
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < breakpoint : false
    );

    useEffect(() => {
        // 2. The handler function to update state
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // 3. Add the event listener
        window.addEventListener('resize', handleResize);

        // 4. CLEANUP: This is the most important part to prevent memory leaks
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [breakpoint]); // Re-run if the breakpoint ever changes

    // 5. Return the value directly (easier to destructure)
    return isMobile;
};

export default useMobile;