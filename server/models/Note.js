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

// // Set up pre-save middleware to create password
// noteSchema.pre('save', async function (next) {
//   if (this.isNew || this.isModified('password')) {
//     const saltRounds = 10;
//     this.password = await bcrypt.hash(this.password, saltRounds);
//   }

//   next();
// });

// // Compare the incoming password with the hashed password
// noteSchema.methods.isCorrectPassword = async function (password) {
//   await bcrypt.compare(password, this.password);
// };

const note = mongoose.model('note', noteSchema);

module.exports = note;
