const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
   
  // manager / advisor / owner
  role: { 
    type: String, 
    enum: ["manager", "advisor", "owner"], 
    required: true 
  },

  password: { type: String, required: true },

  joinedYear: { type: Number, default: new Date().getFullYear() },

  advisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advisor",
    default: null
  },
  
     status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
    },

    // record the last login
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);


// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", UserSchema);
