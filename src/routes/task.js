const express = require('express');
const Task = require('./../models/task')
const authMiddleware = require('./../middleware/auth');
const router = new express.Router()

router.post('/tasks', authMiddleware, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({})
        res.send(tasks)
    }
    catch (e) {
        res.status(500).send()
    }
})
// GET /my-tasks?completed=true
// GET /my-tasks?limit=10&page=1 
// Get /my-tasks?sortBy=createAt:desc
router.get('/my-tasks', authMiddleware, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const [field, order] = req.query.sortBy.split(':')
        sort[field] = order === 'asc' ? 1 : -1
    }
    try {
        /*  Cách 1
            const tasks = await Task.find({ owner: req.user._id })
        */
        //Cách 2
        await req.user
            .populate({
                path: 'myTask',
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: req.query.page - 1 >= 0 && parseInt(req.query.limit) * parseInt(req.query.page - 1),
                    sort
                }
            })
            .execPopulate()
        res.send(req.user.myTask)
    }
    catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router