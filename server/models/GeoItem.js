const mongoose = require('mongoose');
const { Schema } = mongoose;

const geoItemSchema = new Schema(
  {
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
      getters: true,
    },
    timestamps: true,
  });

const geoItem = mongoose.model('note', geoItemSchema);

module.exports = geoItem;
