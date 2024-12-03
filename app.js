const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const gameRoutes = require('./routes/gameRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());  


app.use('/api', gameRoutes);


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port  ${port}`);
});
