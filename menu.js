//const { console } = require("inspector")
const { resolve } = require("path");
const readline = require("readline");

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

const user_input = () =>
  new Promise((resolve, reject) => {
    rl.question("\n Select an Option: ", option => {
      resolve(option);
    });
  });

const start = async () => {
  while (true) {
    const option = await user_input();

    if (option == 1) {
      console.log("Create Account");
    } else if (option == 2) {
      console.log("Deposit Money");
    } else if (option == 3) {
      console.log("Withdraw Money");
    } else if (option == 4) {
      console.log("Check Balance");
    } else if (option == 5) {
      console.log("Transfer Money");
    } else {
      console.log("Good Bye!");
      process.exit();
    }
  }
};

start();
