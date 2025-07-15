import React, { useState, useEffect } from 'react';

const Loading = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? "" : prev + "."));
        }, 500);

        return () => clearInterval(interval); // clean up on unmount
    }, []);

    return (
        <div className='MemoLedger'>
            <div className="loading-container">
                <h1 style={{ minWidth: '8ch', textAlign: 'left' }}>Loading{dots}</h1>
            </div>
        </div>
    )
}

export default Loading;