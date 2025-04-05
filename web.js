//** THIS IS FOR WEB APP */

const express = require("express"); // import

const app = express(); // initialize

const port = 3000; // port to run on

// Middleware to parse JSON bodies
app.use(express.json());

const {
  client,
  connectDB,
  disconnectDB,
  runTests,
  createNewAccount,
  depositMoney,
  withdrawMoney,
  checkBalance,
  transferMoney
} = require("./db");
const { error } = require("console");

// Connect to database when server starts
connectDB().catch(err => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

// Create account
app.post("/createAccount/", express.json(), async (req, res) => {
  try {
    const { accId, accNm, balance } = req.body;

    // Validate fields
    if (!accId || !accNm) {
      return res.status(400).json({
        success: false,
        error: "Account Id and Account name are required"
      });
    }

    // Setting initial balance ...
    const initialBalance = balance !== undefined ? Number(balance) : 0;

    // Create account
    const newAccount = await createNewAccount({
        accId: Number(accId),
        accNm: accNm.trim(),
        balance: initialBalance
    })

    // Success response
    res.status(201).json({
        success: true,
        message: "Account created successfully",
        account: newAccount
    })
  } catch (error) {
    console.log("Create account error:", error.message);

    const statusCode = error.message.includes(`already exists`) ? 409 : 400;

    res.status(statusCode).json({
        success: false,
        error: error.message || "Account creation failed"
    })
  }
});

// Transfer Money
app.put("/transferMoney/", express.json(), async (req, res) => {
  try {
    const { srcId, destId, amount } = req.body;

    // Validate input
    if (!srcId || !destId || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: "Source Id, Destination Id, and amount required"
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount"
      });
    }

    if (srcId === destId) {
      return res.status(400).json({
        success: false,
        error: "Invalid source or destination accounts"
      });
    }

    // Process Transfer
    const result = await transferMoney({
      srcId: Number(srcId),
      destId: Number(destId),
      amount: Number(amount)
    });

    // Success response
    res.json({
      success: true,
      message: `Transfer of ${amount} from ${srcId} to ${destId} completed`,
      sourceAccount: srcId,
      destinationAccount: destId,
      transferAmount: amount,
      sourceNewBalance: result.srcBalance,
      destinationNewBalance: result.destBalance
    });
  } catch (error) {
    console.error("Transfer failed:", error.message);

    res.status(500).json({
      success: false,
      error: error.message || "Transfer failed"
    });
  }
});

// Withdraw Money
app.put("/withdrawMoney/", express.json(), async (req, res) => {
  try {
    const { accId, amount } = req.body;

    // Validate input
    if (!accId || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: "Enter correct account ID and amount"
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount"
      });
    }

    // Process withdrawal
    const newBalance = await withdrawMoney({
      accId: Number(accId),
      amount: Number(amount)
    });

    // Response
    res.json({
      success: true,
      message: `Withdrawal of ${amount} is successful. New balance: ${newBalance}`,
      accountId: accId,
      newBalance
    });
  } catch (error) {
    console.log(`Withdrawal failed:`, error.message);

    res.status(statusCode).json({
      success: false,
      error: error.message || "Withdrawal failed"
    });
  }
});

// Deposit
app.put("/depositMoney/", express.json(), async (req, res) => {
  console.log("receive body:", req.body);
  try {
    // Get request from the body
    const { accId, amount } = req.body;

    // Validate input
    if (!accId || !amount) {
      return res.status(400).json({
        success: false,
        error: "Enter required accId and amount"
      });
    }
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount"
      });
    }

    // Deposit money
    const newBalance = await depositMoney({
      accId: Number(accId),
      amount: Number(amount)
    });

    // Response
    res.json({
      success: true,
      message: `Deposit of ${amount} was successful. New balance: ${newBalance}`,
      accountId: accId,
      newBalance
    });
  } catch (error) {
    console.log("Deposit failed:", error.message);

    res.status(500).json({
      success: false,
      error: error.message || "Deposit failed"
    });
  }
});

// Check balance
app.get("/checkBalance/:accId", async (req, res) => {
  try {
    const accountId = req.params.accId;
    const balance = await checkBalance({ accId: accountId });

    // Send the response
    res.json({
      success: true,
      accountId: accountId,
      balance: balance
    });
  } catch (error) {
    console.error("Error checking balance:", error);
    res.status(500).json({
      success: false,
      error: "Error checking balance",
      message: error.message
    });
  }
});

// Port to listen on
app.listen(port, () => {
  console.log(`Banking App listening on port ${port}`);
});
