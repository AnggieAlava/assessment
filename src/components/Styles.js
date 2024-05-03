import React, { useEffect } from 'react';

const Styles = ({ base64CSS }) => {
    useEffect(() => {
        // Step 1: Decode the Base64 CSS
        const decodedCSS = atob(base64CSS);
        console.log("decoded css", decodedCSS)
        // Step 2: Create a style element
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.textContent = decodedCSS;
        
        // Append the style element to the head of the document
        document.head.appendChild(styleElement);
        
        // Cleanup function to remove the style element when the component unmounts
        return () => {
            document.head.removeChild(styleElement);
        };
    }, [base64CSS]); // Dependency array to reapply styles if base64CSS changes
    
    console.log("decoded css", base64CSS)
    return null; // This component does not render anything
};

export default Styles;
