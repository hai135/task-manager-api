const express = require('express');
require('./db/mongoose');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

const app = express();
const port = process.env.PORT;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is up on port: ' + port);
});

// const Task = require('./models/task')
// const User = require('./models/user')
// const main = async () => {
//     const task = await Task
//         .findById('60fd7c644f76212594b97962')
//         .populate('owner')
//         .exec()
//     console.log(task)
//     const user = await User
//         .findById('60fd7c0d4f76212594b9795c')
//         .populate('myTask')
//         .exec()
//     console.log(user.myTask)

// }
// main()
