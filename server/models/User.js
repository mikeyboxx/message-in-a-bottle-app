const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must match an email address!'],
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6    
    },
    createdNotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    ownedNotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
  },{
    toJSON: {
      virtuals: true,
    },
    timestamps: true
  });


userSchema
  .virtual('createdTs')
  .get(function () {
    return `${new Date(this.createdAt).toISOString()}`;
  });

userSchema
  .virtual('updatedTs')
  .get(function () {
    return `${new Date(this.updatedAt).toISOString()}`;
  });

  
// set up pre-save middleware to create password
userSchema
  .pre('save', async function(next) {
    if (this.isNew || this.isModified('password')) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
  });

// compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
