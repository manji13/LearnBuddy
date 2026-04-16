const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      maxlength: [200, "Topic cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    // createdAt and updatedAt are added automatically by timestamps: true
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Announcement", announcementSchema);