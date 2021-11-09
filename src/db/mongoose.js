const mongoose = require('mongoose');

try {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    console.log('Connect successful');
} catch (e) {
    console.log('Connect fail');
    process.exit();
}

// const { MongoClient } = require('mongodb');
// const uri = process.env.MONGODB_LOCAL_URL;
// const client = new MongoClient(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });
// client.connect((err) => {
//     const collection = client.db('test').collection('devices');
//     // perform actions on the collection object
//     // client.close();
// });
