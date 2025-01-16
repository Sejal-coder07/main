import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./Statistics.css";


const Statistics = ({ month }) => {
    const [stats, setStats] = useState({});

    useEffect(() => {
        const fetchStats = async () => {
            const response = await axios.get('http://localhost:3000/statistics', { params: { month } });
            setStats(response.data);
        };
        fetchStats();
    }, [month]);

    return (
        <div className="statistics-box">
            <h2>Statistics - {month}</h2><p>Selected Month From Dropdown</p>
            <div>Total Sale Amount: ${stats.totalSaleAmount}</div>
            <div>Total Sold Items: {stats.totalSoldItems}</div>
            <div>Total Not Sold Items: {stats.totalNotSoldItems}</div>
        </div>
    );
};

export default Statistics;
