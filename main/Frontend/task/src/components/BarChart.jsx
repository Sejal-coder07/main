import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import "./BarChart.css";

const PriceBarChart = ({ month }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('http://localhost:3000/bar-chart', { params: { month } });
            setData(response.data);
        };
        fetchData();
    }, [month]);

    return (
        <div className='BarChart'>
            <h2>Price Range Bar Chart  - {month}</h2>
            <BarChart width={600} height={300} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
        </div>
    );
};

export default PriceBarChart;
