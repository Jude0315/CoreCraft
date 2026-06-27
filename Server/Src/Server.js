require("dotenv").config();

const app = require("./App");
const ConnectDb = require("./Config/Db");


ConnectDb();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});