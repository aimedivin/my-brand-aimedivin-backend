import express, {Request, Response} from 'express';
import cors from 'cors';
import "dotenv/config"
import mongoose from 'mongoose'
import dashboardRoutes from './routes/dashboardRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import bodyParser from 'body-parser';

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => {
        console.log("Database connected");
    })

const app = express();

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json());
//app.use(cors());

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.listen(3000, () => {
    console.log('Server started on port: 3000');
})