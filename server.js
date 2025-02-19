const dotenv = require("dotenv");
const app = require("./src/app");
const process = require("process");

dotenv.config({ path: "./.env.local" });

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server Listening on port ${port}`);
});
