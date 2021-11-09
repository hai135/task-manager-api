const mailjet = require('node-mailjet')
    .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);
const sendWelcomeEmail = (email, name) => {
    mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "hai13052001@gmail.com",
                        "Name": "Hải"
                    },
                    "To": [
                        {
                            "Email": email,
                        }
                    ],
                    "Subject": "Thanks for joining in !!!",
                    "TextPart": "My first Mailjet email",
                    "HTMLPart": `Welcome to the app, ${name}. Let me know how you get along with app`,
                    "CustomID": "AppGettingStartedTest"
                }
            ]
        });
};

const sendCancelationEmail = (email, name) => {
    mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "hai13052001@gmail.com",
                        "Name": "Hải"
                    },
                    "To": [
                        {
                            "Email": email,
                        }
                    ],
                    "Subject": "Sorry to see you go",
                    "TextPart": "My first Mailjet email",
                    "HTMLPart": `Goodbye, ${name}. I hope to see you back sometime soon`,
                    "CustomID": "AppGettingStartedTest"
                }
            ]
        });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};