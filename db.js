const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  user: "eugene",
  password: "mbroba@1",
  port: 5432,
  database: "bankdb"
});

const connect = async () => {
  try {
    await client.connect();
    console.log("Connected Successfully");
    await client.end();
  } catch (err) {
    console.error("Connection error", err.stack);
    console.log(err);
  }
};

connect();

// const connect = async () => await client.connect();


// try {
//   connect()
//   console.log('Connected Successfully')
// } catch(error) {
//   console.log('Error Connecting')
//   console.log(err)
// }
