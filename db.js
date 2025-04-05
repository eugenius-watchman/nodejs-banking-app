const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  user: "eugene",
  password: "mbroba@1",
  port: 5432,
  database: "bankdb"
});

// DB connections and management
const connectDB = async () => {
  try {
    await client.connect();
    console.log("\n Connected to database successfully");
  } catch (err) {
    console.error("Connection error", err);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await client.end();
    console.log("\n Disconnected from database");
  } catch (err) {
    console.error("Disconnection error", err);
  }
};

const runTests = async () => {
  try {
    console.log("Running test sequence...");

    await client.query("DELETE FROM account WHERE acc_id = 1");
    console.log("Cleared an existing test account");

    // Create an account while connected

    await createNewAccount({ accId: 1, accNm: "Eugenius", balance: 100 });

    // Withdrawal

    await withdrawMoney({ accId: 1, amount: 10 });

    // Deposit

    await depositMoney({ accId: 1, amount: 20 });

    // Transfer

    await transferMoney({ srcId: 1, destId: 2, amount: 30 });

    // Balance

    await checkBalance({ accId: 1 });

    console.log("All tests completed successfully");
  } catch (err) {
    console.error("Operation error", err.stack);
    process.exit(1);
  }
};

// Functions
const createNewAccount = async ({ accId, accNm, balance }) => {
  try {
    // Parameterized Queries to prevent SQL injections
    const res = await client.query(`INSERT INTO account VALUES ($1, $2, $3)`, [
      accId,
      accNm,
      balance
    ]);
    console.log(`\n Customer account created successfully.`);
  } catch (err) {
    if (err) console.log(`\n Problem creating customer account.`, err);
  }
};

const withdrawMoney = async ({ accId, amount }) => {
  try {
    // Get current balance
    const res = await client.query(
      `SELECT balance FROM account WHERE acc_id = $1`,
      [accId]
    );
    if (!res.rows.length) {
      console.log("\n Account not found");
      return;
    }

    const currentBalance = res.rows[0].balance;
    console.log(`\n Your existing balance is ${currentBalance}`);

    // Whether there exists enough cash
    if (currentBalance < amount) {
      console.log(`\n Insufficient funds.`);
    }

    // Prevent negative balance
    const MINIMUM_BALANCE = 0;
    if (currentBalance - amount < MINIMUM_BALANCE) {
      console.log(`\n Withdrawal failed. Minimum balance: ${MINIMUM_BALANCE}`);
      return false;
    }

    // Update balance
    const newBalance = currentBalance - amount;
    await client.query(`UPDATE account SET balance = $1 WHERE acc_id = $2`, [
      newBalance,
      accId
    ]);
    console.log(`\n You withdrew: ${amount}. New balance: ${newBalance}`);
    // Return the new balance
    return newBalance;
  } catch (err) {
    console.log("\n Withdrawal Error.");
  }
};

const depositMoney = async ({ accId, amount }) => {
  try {
    // Amount must be positive
    if (amount <= 0) {
      console.log("\n Deposit amount should be positive.");
      return;
    }

    // Get current balance
    const res = await client.query(
      `SELECT balance FROM account WHERE acc_id = $1`,
      [accId]
    );
    if (!res.rows.length) {
      console.log("\n Account not found");
      return;
    }

    const currentBalance = Number(res.rows[0].balance);
    console.log(`\n Current balance is ${currentBalance}`);

    // Update balance
    const newBalance = Number(currentBalance + amount);
    await client.query(`UPDATE account SET balance = $1 WHERE acc_id = $2`, [
      newBalance,
      accId
    ]);
    console.log(`\n You deposited ${amount}. New balance: ${newBalance}`);

    // Return the new balance
    return newBalance;
  } catch (err) {
    console.log("\n Deposit failed.", err.message);
  }
};

const transferMoney = async ({ srcId, destId, amount }) => {
  try {
    // Source account
    const srcRes = await client.query(
      "SELECT balance FROM account WHERE acc_id = $1",
      [srcId]
    );
    if (!srcRes.rows.length) {
      console.log("\n Source account not found.");
      return;
    }
    const srcBalance = Number(srcRes.rows[0].balance);

    // Destination account
    const destRes = await client.query(
      "SELECT balance FROM account WHERE acc_id = $1",
      [destId]
    );
    if (!destRes.rows.length) {
      console.log("\n Destination account not found.");
      return;
    }
    const destBalance = Number(destRes.rows[0].balance);

    // Check sufficient balance
    if (srcBalance < amount) {
      console.log("\n Insufficient funds.");
      return;
    }

    // Update source and destination accounts
    const newSrcBalance = srcBalance - amount;
    await client.query(`UPDATE account SET balance = $1 WHERE acc_id = $2`, [
      newSrcBalance,
      srcId
    ]);

    const newDestBalance = destBalance + amount;
    await client.query(`UPDATE account SET balance = $1 WHERE acc_id = $2`, [
      newDestBalance,
      destId
    ]);

    console.log(`\n You transferred ${amount} from ${srcId} to ${destId}`);
    // Return the updated balances
    return {
      srcBalance: newSrcBalance,
      destBalance: newDestBalance
    };
  } catch (err) {
    console.log("Transfer failed.", err.message);
  }
};

const checkBalance = async ({ accId }) => {
  try {
    const res = await client.query(
      "SELECT balance FROM account where acc_id = $1",
      [accId]
    );

    if (!res.rows.length) {
      console.log("\n Account not found.");
      return;
    }

    const balance = Number(res.rows[0].balance);
    console.log(`Account ${accId} balance is: ${balance}`);
    return balance;
  } catch (err) {
    console.log(`Balance check failed:`, err.message);
    return;
  }
};

module.exports = {
  client,
  connectDB,
  disconnectDB,
  runTests,
  createNewAccount,
  checkBalance,
  depositMoney,
  transferMoney,
  withdrawMoney
};

// const transfer = async ({ srcId, destId, amount }) => {
//   try {
// Withdraw first (await ensures completion)
//     await withdrawMoney({ accId: srcId, amount });

// Deposit if withdrawal succeeded
//     await depositMoney({ accId: destId, amount });

//     console.log(`Transferred ${amount} from ${srcId} to ${destId}`);
//   } catch (err) {
//     console.log("Transfer failed:", err.message);
//   }
// };

// connection
// await transfer({ srcId: 2, destId: 1, amount: 35 });
