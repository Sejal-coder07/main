const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db'); // Import database connection
const Product = require('./model/product');
const axios = require('axios');
var cors = require('cors')

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to Database
connectDB();

app.get("/", (req, res)=>{
    res.send("Hello World");
})
// Routes
app.get('/initialize', async (req, res) => {
    // try {
    //     const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    //     const products = response.data;

    //     await Product.insertMany(products); // Save data to MongoDB
    //     res.status(200).send('Database initialized successfully');
    // } catch (err) {
    //     console.error('Error initializing database:', err);
    //     res.status(500).send('Error initializing database');
    // }

});
  async function seedsData(){
   try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        await Product.insertMany(products); // Save data to MongoDB
        res.status(200).send('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
        res.status(500).send('Error initializing database');
    }
 }
 //app.use(seedsData())
app.get('/transactions', async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = '', month } = req.query;

        // Validate month input
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthNumber = monthNames.indexOf(month);

        if (monthNumber === -1) {
            return res.status(400).send('Invalid month parameter');
        }

        // Adjust date range based on month
        const year = 2022; // Reference year for month filtering
        const startDate = new Date(year, monthNumber, 1); // Use year, month, and day (1)
        const endDate = new Date(year, monthNumber + 1, 0); // End of the selected month

        // Build the query for filtering
        const query = {
            dateOfSale: {
                $gte: startDate,
                $lt: endDate,
            },
        };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Fetch data with pagination
        const products = await Product.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            products,
            total,
            page: parseInt(page),
            perPage: parseInt(perPage),
        });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).send('Error fetching transactions');
    }
});



app.get('/statistics', async (req, res) => {
    try {
        const { month } = req.query;

        // Validate input
        if (!month) {
            return res.status(400).json({ message: 'Month is required' });
        }

        // Get month number from input
        const monthNumber = new Date(`${month} 1, 2022`).getMonth();
        if (isNaN(monthNumber)) {
            return res.status(400).json({ message: 'Invalid month' });
        }

        // Set date range
        const startDate = new Date(`2022-${String(monthNumber + 1).padStart(2, '0')}-01T00:00:00.000Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        // Query for statistics
        const query = {
            dateOfSale: { $gte: startDate, $lt: endDate },
        };

        const totalSaleAmount = await Product.aggregate([
            { $match: query },
            { $group: { _id: null, totalAmount: { $sum: '$price' } } },
        ]);

        const totalSoldItems = await Product.countDocuments({ ...query, sold: true });
        const totalNotSoldItems = await Product.countDocuments({ ...query, sold: false });

        // Return statistics
        res.status(200).json({
            totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
            totalSoldItems,
            totalNotSoldItems,
        });
    } catch (err) {
        console.error('Error fetching statistics:', err);
        res.status(500).send('Error fetching statistics');
    }
});

app.get('/bar-chart', async (req, res) => {
    try {
        const { month } = req.query;

        // Convert the month input to a numeric value (e.g., "March" -> 3)
        const monthNumber = new Date(`${month} 1, 2022`).getMonth() + 1;

        // Filter products based on the month
        const query = {
            dateOfSale: {
                $gte: new Date(`2022-${monthNumber}-01`),
                $lt: new Date(`2022-${monthNumber + 1}-01`),
            },
        };

        // Aggregate data to calculate price ranges
        const priceRanges = await Product.aggregate([
            { $match: query },
            {
                $bucket: {
                    groupBy: '$price', // Group by the price field
                    boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
                    default: '901-above',
                    output: {
                        count: { $sum: 1 },
                    },
                },
            },
        ]);

        // Format the response
        const formattedResponse = priceRanges.map((range) => ({
            range: range._id === '901-above' ? '901-above' : `${range._id}-${range._id + 99}`,
            count: range.count,
        }));

        res.status(200).json(formattedResponse);
    } catch (err) {
        console.error('Error fetching bar chart data:', err);
        res.status(500).send('Error fetching bar chart data');
    }
});


app.get('/pie-chart', async (req, res) => {
    try {
        const { month } = req.query;

        // Convert the month input to a numeric value (e.g., "March" -> 3)
        const monthNumber = new Date(`${month} 1, 2022`).getMonth() + 1;

        // Filter products based on the month
        const query = {
            dateOfSale: {
                $gte: new Date(`2022-${monthNumber}-01`),
                $lt: new Date(`2022-${monthNumber + 1}-01`),
            },
        };

        // Aggregate data to group by category
        const categoryData = await Product.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$category', // Group by the "category" field
                    count: { $sum: 1 }, // Count the number of items in each category
                },
            },
        ]);

        // Format the response
        const formattedResponse = categoryData.map((category) => ({
            category: category._id,
            count: category.count,
        }));

        res.status(200).json(formattedResponse);
    } catch (err) {
        console.error('Error fetching pie chart data:', err);
        res.status(500).send('Error fetching pie chart data');
    }
});


app.get('/combined-data', async (req, res) => {
    try {
        const { month, page = 1, perPage = 10, search = '' } = req.query;

        // Validate that the 'month' parameter is provided
        if (!month) {
            return res.status(400).json({ error: 'Month parameter is required' });
        }

        // Perform all API calls in parallel
        const [transactionsResponse, statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
            axios.get(`http://localhost:3000/transactions`, {
                params: { month, page, perPage, search },
            }),
            axios.get(`http://localhost:3000/statistics`, { params: { month } }),
            axios.get(`http://localhost:3000/bar-chart`, { params: { month } }),
            axios.get(`http://localhost:3000/pie-chart`, { params: { month } }),
        ]);

        // Combine all responses into a single JSON object
        const combinedData = {
            transactions: transactionsResponse.data,
            statistics: statisticsResponse.data,
            barChart: barChartResponse.data,
            pieChart: pieChartResponse.data,
        };

        res.status(200).json(combinedData);
    } catch (err) {
        console.error('Error fetching combined data:', err);
        res.status(500).send('Error fetching combined data');
    }
});




// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
