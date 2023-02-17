const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new Schema({
  noteText: {
    type: String,
    required: true,
    trim: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
});

const note = mongoose.model('note', noteSchema);

module.exports = note;
