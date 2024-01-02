const mongoose = require("mongoose");
const shortid = require("shortid");

// Define the CommentSchema
const CommentSchema = new mongoose.Schema({
  text: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  boardId: { type: String, ref: "Board" },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  userId: { type: String, required: false },
});

// Define the FeedbackSchema
const FeedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Good", "Bad", "Ideas", "Actions", "Kudos"],
    required: true,
  },
  content: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  boardId: { type: String, ref: "Board" },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: [CommentSchema],
  userId: { type: String, required: false },
});

// Define the TeamMemberSchema
const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String },
});

// Pre-save hook for TeamMemberSchema
TeamMemberSchema.pre("save", function (next) {
  if (!this.userId) {
    const sanitizedUserName = this.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "");
    this.userId = `${sanitizedUserName}-${shortid.generate()}`;
  }
  next();
});

// Define the BoardSchema with a custom _id
const BoardSchema = new mongoose.Schema({
  _id: { type: String },
  title: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  teamMembers: [TeamMemberSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  feedback: [FeedbackSchema],
});

// Pre-save hook for BoardSchema to set custom _id
BoardSchema.pre("save", function (next) {
  if (!this._id) {
    const sanitizedTitle = this.title.replace(/\s+/g, "-");
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    this._id = `${sanitizedTitle}:${formattedDate}:${shortid.generate()}`;
  }
  next();
});

// Create models
const Board = mongoose.model("Board", BoardSchema);
const Feedback = mongoose.model("Feedback", FeedbackSchema);
const Comment = mongoose.model("Comment", CommentSchema);

// Export the models
module.exports = { Board, Feedback, Comment };
