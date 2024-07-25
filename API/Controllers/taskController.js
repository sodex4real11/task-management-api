const Task = require('../models/Task');

exports.createTask = async (req, res) => {
    try {
        const task = new Task({ ...req.body, userId: req.user.userId });
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.userId });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, req.body, { new: true });
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }
        res.status(200).send({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};
