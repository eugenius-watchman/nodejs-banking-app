//** This code is for CLI for the app*/

const { console } = require("inspector")
const { resolve } = require("path");
const readline = require("readline");
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Welcome To BSS Banking App");
console.log("\n 1. Create a new Account");
console.log("\n 2. Deposit Money");
console.log("\n 3. Withdraw Money");
console.log("\n 4. Check Balance");
console.log("\n 5. Transfer Money");
console.log("\n 6. Exit");
console.log("\n 7. Run Tests");

const user_input = msg =>
  new Promise((resolve, reject) => {
    rl.question(`\n ${msg} :`, option => {
      resolve(option);
    });
  });

const start = async () => {
  try {
    await connectDB();
    console.log("\n Connected successfully to database");
    while (true) {
      const option = await user_input(
        "\n Select an option (option 7 to run tests)"
      );

      if (option == 1) {
        console.log("\n Create Account");
        const accId = parseInt(await user_input("Enter account Id"));
        const accNm = await user_input("Enter account name");
        const balance = 0;
        await createNewAccount({ accId, accNm, balance });
      } else if (option == 2) {
        console.log("\n Deposit Money");
        const accId = parseInt(await user_input("Enter account Id"));
        const amount = parseFloat(await user_input("Enter amount"));

        await depositMoney({ accId, amount });
      } else if (option == 3) {
        console.log("\n Withdraw Money");
        const accId = parseInt(await user_input("Enter account Id"));
        const amount = parseFloat(await user_input("Enter amount"));

        const success = await withdrawMoney({ accId, amount });
        if (!success) {
          console.log("Please enter a different amount");
        }
      } else if (option == 4) {
        console.log("\n Check Balance");
        const accId = parseInt(await user_input("Enter account Id"));
        await checkBalance({ accId });
      } else if (option == 5) {
        console.log("\n Transfer Money");
        const srcId = parseInt(await user_input("Enter source account Id"));
        const destId = parseInt(
          await user_input("Enter destination account Id")
        );

        const amount = parseFloat(await user_input("Enter amount"));
        await transferMoney({ srcId, destId, amount });
      } else if (option == 7) {
        // Run tests manually
        await runTests();
      } else if (option == 6) {
        console.log("\n Good Bye!");
        await disconnectDB();
        process.exit();
      }
    }
  } catch (err) {
    console.log("Connection error:", err.message);
    await disconnectDB();
    process.exit(1);
  }
};

start();
