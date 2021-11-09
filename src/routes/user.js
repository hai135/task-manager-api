const express = require('express');
// const path = require('path');
const User = require('./../models/user');
const sharp = require('sharp');
const authMiddleware = require('./../middleware/auth');
const router = new express.Router();
const multer = require('multer');
const {
    sendWelcomeEmail,
    sendCancelationEmail,
} = require('./../emails/account');

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        // res.cookie('auth_token', token);
        // res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'));
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password,
        );
        const token = await user.generateAuthToken();
        // res.cookie('auth_token', token);
        // res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'));
        res.send({ user, token });
    } catch (e) {
        res.status(400).send({
            error: {
                message: 'You have entered an invalid username or password',
            },
        });
    }
});

router.get('/users/logout', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(
            (token) => token.token !== req.token,
        );
        await req.user.save();
        res.send({ message: 'Logout successful' });
    } catch (e) {
        res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error('Please upload an image'));
        }
        cb(null, true);
    },
});

router.post(
    '/users/me/avatar',
    [authMiddleware, upload.single('avatar')],
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize(250, 250, { fit: 'contain' })
            .jpeg()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    },
);

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/jpeg');
        res.send(user.avatar);
    } catch (e) {
        res.status(400).send();
    }
});

router.get('/users/logout-all', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send({ message: 'Logout successful' });
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/users/me', authMiddleware, async (req, res) => {
    res.send(req.user);
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/users/me', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'password', 'email'];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update),
    );
    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid updates!' });
    }
    try {
        const user = req.user;
        updates.forEach((update) => (user[update] = req.body[update]));
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(400).send();
    }
});

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'password', 'email'];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update),
    );
    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid updates!' });
    }
    try {
        const user = await User.findById(req.params.id);
        updates.forEach((update) => (user[update] = req.body[update]));
        await user.save();
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true })
        if (!user) {
            res.status(404).send();
        }
        res.send(user);
    } catch (e) {
        res.status(400).send();
    }
});

router.delete('/users/me', authMiddleware, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        console.log(req.user);
        res.status(500).send();
    }
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).send();
        }
        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
});

router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});
module.exports = router;
