"use client"

import { useEffect } from "react"

export function FaviconUpdater() {
    useEffect(() => {
        const updateFavicon = () => {
            const storedLogo = localStorage.getItem("app_logoUrl") || "/ace-logo.jpg"
            if (storedLogo) {
                // Find existing favicon or create new ones
                const linkQuery = "link[rel~='icon']";
                let links = document.querySelectorAll(linkQuery);

                // If no links found, we might need to create one, but usually Next.js creates them.
                // We will try to update all existing icon links to be thorough.

                if (links.length === 0) {
                    const newLink = document.createElement('link');
                    newLink.rel = 'icon';
                    document.head.appendChild(newLink);
                    links = document.querySelectorAll(linkQuery);
                }

                links.forEach((link) => {
                    (link as HTMLLinkElement).href = storedLogo;
                    // Remove type attribute to prevent mismatch (e.g. if it was image/svg+xml and we provide a jpg)
                    link.removeAttribute('type');
                });
            }
        }

        // Initial update
        updateFavicon()

        // Listen for storage changes (across tabs and custom events in same tab)
        const handleStorageChange = () => {
            updateFavicon()
        }

        window.addEventListener("storage", handleStorageChange)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
        }
    }, [])

    return null
}
