const Class = require('../models/Class');
const User = require('../models/User');

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher', 'name _id').lean();
    
    const classesWithCount = await Promise.all(classes.map(async (c) => {
      const studentCount = await User.countDocuments({ role: 'STUDENT', class: c._id });
      return {
        id: c._id,
        name: c.name,
        teacherId: c.teacher ? c.teacher._id : null,
        teacher: c.teacher ? { id: c.teacher._id, name: c.teacher.name } : null,
        _count: { students: studentCount }
      };
    }));
    
    res.json(classesWithCount);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createClass = async (req, res) => {
  const { name, teacherId } = req.body;
  try {
    const newClass = await Class.create({
      name,
      teacher: teacherId || null
    });
    res.status(201).json({ id: newClass._id, name: newClass.name, teacherId: newClass.teacher });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(409).json({ error: "Class Name already exists. Try another." });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

const updateClass = async (req, res) => {
  const { id } = req.params;
  const { name, teacherId } = req.body;
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { name, teacher: teacherId || null },
      { new: true }
    );
    res.json({ id: updatedClass._id, name: updatedClass.name, teacherId: updatedClass.teacher });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(409).json({ error: "Class Name already exists. Try another." });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    await Class.findByIdAndDelete(id);
    res.json({ message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getClasses, createClass, updateClass, deleteClass };
