const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const dotenv = require("dotenv");

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
// mongodb+srv://anumahesh115:<password>@cluster0.w3kbwil.mongodb.net/?retryWrites=true&w=majority
 mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.w3kbwil.mongodb.net/?retryWrites=true&w=majority`);

const publicPath = path.join(__dirname, 'public'); // Set the path to the 'public' directory

app.use(express.static(publicPath)); // Serve static files from the 'public' directory

// Create a schema for expenses and incomes
const transactionSchema = new mongoose.Schema({
  type: String, // 'Expense' or 'Income'
  description: String,
  amount: Number,
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method')); 

// Routes
app.get('/', async (req, res) => {
    try {
      // Fetch transactions from MongoDB
      const transactions = await Transaction.find({});
      res.render('index', { transactions });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

app.post('/addTransaction', (req, res) => {
  const { type, description, amount } = req.body;

  // Create a new transaction and save it to MongoDB
  const newTransaction = new Transaction({ type, description, amount });
  newTransaction.save()
  .then(() => res.redirect('/'))
  .catch((err) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });
});

// Delete a transaction
app.delete('/deleteTransaction/:id', async (req, res) => {
  const transactionId = req.params.id;

  try {
    // Find the transaction by ID and delete it
    await Transaction.findByIdAndDelete(transactionId);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
