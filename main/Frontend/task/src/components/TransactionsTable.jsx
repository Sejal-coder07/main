import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionsTable.css";

function TransactionsTable({ month, search }) {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      const response = await axios.get("http://localhost:3000/transactions", {
        params: { month, page, search },
      });
      setTransactions(response.data.products);
      setTotalPages(Math.ceil(response.data.total / response.data.perPage));
    };
    fetchTransactions();
  }, [month, search, page]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
           
            <th>Image</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id}>
              <td>{txn.id}</td>
              <td>{txn.title}</td>
              <td>{txn.description}</td>
              <td>${txn.price}</td>
              <td>{txn.category}</td>
             
              <td>
                <img src={txn.image} alt="Image" />
              </td>
              <td>{new Date(txn.dateOfSale).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
          <span>Page 1</span>
        <div>

          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
        <span>Page {page}</span>
      </div>
    </div>
  );
}

export default TransactionsTable;
