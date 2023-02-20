const mongoose = require('mongoose');
const { Schema } = mongoose;
const { getDistanceFromLatLonInMeters } = require('../utils/generateRandomMarkers');

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

noteSchema.methods.getDistance = function (lat, lng) {
  const distance = getDistanceFromLatLonInMeters(lat, lng, this.lat, this.lng);
  return distance;
}

  const note = mongoose.model('note', noteSchema);



module.exports = note;
