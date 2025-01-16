import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import axios from 'axios';
import "./PieChart.css"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CategoryPieChart = ({ month }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get('http://localhost:3000/pie-chart', { params: { month } });
            setData(response.data);
        };
        fetchData();
    }, [month]);

    return (
        <div className='PieChart'>
            <h2>Category Pie Chart  - {month}</h2>
            <PieChart width={400} height={400}>
                <Pie data={data} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100}>
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </div>
    );
};

export default CategoryPieChart;
