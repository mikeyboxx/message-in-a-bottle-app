const mongoose = require('mongoose');
const { Schema } = mongoose;
const { getDistanceFromLatLonInMeters } = require('../utils/trigonometry');

const noteSchema = new Schema(
  {
    noteAuthor: {
      type: String,
      required: true,
      trim: true,
      default: 'autoGen',
    },
    noteOwner: {
      type: String,
      trim: true,
    },
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
    bearing: {
      type: Number,
      // default: Math.floor(Math.random() * 360) + 1
    }
  },
  {
    toJSON: {
      virtuals: true,
    },
    timestamps: true
  }
);


noteSchema
  .virtual('createdTs')
  .get(function () {
    return `${new Date(this.createdAt).toISOString()}`;
  })

noteSchema
  .virtual('updatedTs')
  .get(function () {
    return `${new Date(this.updatedAt).toISOString()}`;
  })

// distance from the coordinates passed to this method
noteSchema.methods.getDistance = function (lat, lng) {
  const distance = getDistanceFromLatLonInMeters(lat, lng, this.lat, this.lng);
  return distance;
}

  const Note = mongoose.model('Note', noteSchema);

module.exports = Note;


