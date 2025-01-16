import React, { useEffect, useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import axios from 'axios'
import "./App.css";

const App = () => {
    const [month, setMonth] = useState('March');
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);

    const handleMonthChange = (e) => setMonth(e.target.value);
    const handleSearchChange = (e) => setSearch(e.target.value);

  

   

    return (
        <div className="app">
            <h1 className='dashboard-title'> Transactions Dashboard  - {month}</h1>
            <div className="controls">
                <select value={month} onChange={handleMonthChange} >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>
          
            <TransactionsTable month={month} search={search} />
            <Statistics month={month} />
            <BarChart month={month} />
            <PieChart month={month} />
          
        </div>
    );
};

export default App;
