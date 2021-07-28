const mongoose = require('mongoose');

try {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    console.log('Connect successful')
} catch (e) {
    console.log('Connect fail')
    process.exit()
}

