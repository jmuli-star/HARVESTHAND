import React, { useEffect, useState } from 'react';  
import axios from 'axios';

function Axiosfetch() {
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get('http://127.0.0.1:8000/api/v1/farms/')
            .then((response) => {
                setFarms(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading farms...</p>;

    return (
        <>
            <div>
                {farms.map((farm) => (
                    <div key={farm.id || farm.name}>   {/* ← always add a key! */}
                        <h1>{farm.name}</h1>
                        <p>{farm.location}</p>         {/* ← fixed typo: locaton → location */}
                    </div>
                ))}
            </div>
        </>
    );
}

export default Axiosfetch;