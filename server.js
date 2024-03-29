const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const eventapi = require("./routes/api/eventapi");


const app = express();



// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());







app.use("/api/eventapi", eventapi);




const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`success on port ${port}`));


