const app = require("./App");
const ConnectDb = require("./Config/Db");
require("dotenv").config();

ConnectDb();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});