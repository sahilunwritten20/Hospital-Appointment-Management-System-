const router = require('express').Router();
const Department = require('../models/Department');

router.get('/', async (req, res, next) => {
  try {
    const list = await Department.find().sort({ order: 1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
