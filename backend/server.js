const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const socketIo = require("socket.io");
const { Board, Feedback, Comment } = require("./models");
const connectDB = require("./config/db");
const path = require("path");
const cron = require("node-cron");
const axios = require("axios");

dotenv.config();
connectDB();
const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);

const clientOrigin =
  process.env.NODE_ENV === "production"
    ? "https://retrosphere.onrender.com"
    : "http://localhost:3000";

const io = socketIo(server, {
  cors: {
    origin: clientOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
app.use(cors());

// This object will hold the typing status of users
const typingUsers = {};

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("a user connected");

  // When a member starts typing
  socket.on("memberTyping", (userId) => {
    // typingUsers[userId] = true;
    typingUsers[userId] = socket.id;
    socket.broadcast.emit("memberTyping", userId);
  });

  // When a member stops typing
  socket.on("memberStoppedTyping", (userId) => {
    delete typingUsers[userId];
    socket.broadcast.emit("memberStoppedTyping", userId);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    // Here you can also handle the user disconnecting to clean up the typingUsers
    Object.keys(typingUsers).forEach((userId) => {
      if (typingUsers[userId] === socket.id) {
        delete typingUsers[userId];
        socket.broadcast.emit("memberStoppedTyping", userId);
      }
    });
  });
});

// Create a new board
app.post("/boards", async (req, res) => {
  try {
    const { title, isAnonymous } = req.body;
    const newBoard = new Board({
      title,
      isAnonymous,
    });
    await newBoard.save();
    res.status(201).send({ boardId: newBoard._id });
    io.emit("boardCreated", newBoard);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all boards
app.get("/boards", async (req, res) => {
  try {
    const boards = await Board.find();
    res.status(200).send(boards);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a single board by ID
app.get("/boards/:boardId", async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).send("Board not found");
    }
    const teamMembersWithUserId = board.teamMembers.map((member) => ({
      ...member._doc,
      userId: member.userId || null,
    }));
    res.status(200).send({
      _id: board._id,
      title: board.title,
      isAnonymous: board.isAnonymous,
      teamMembers: teamMembersWithUserId,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Join a board
app.post("/join/:boardId", async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).send("Board not found");
    }
    const memberName = req.body.name;

    // Overwrite member or add if not exist
    const existingMemberIndex = board.teamMembers.findIndex(
      (member) => member.name === memberName
    );

    if (existingMemberIndex === -1) {
      // Member doesn't exist, add them
      board.teamMembers.push({ name: memberName });
    } else {
      // Member exists, overwrite
      board.teamMembers[existingMemberIndex] = { name: memberName };
    }

    await board.save();
    const member = board.teamMembers.find((m) => m.name === memberName);
    io.emit("boardUpdated", { boardId: board._id, boardDetails: board });

    res.status(200).send({
      message: "Joined the board successfully",
      _id: board._id,
      title: board.title,
      userId: member.userId,
      isAnonymous: board.isAnonymous,
      teamMembers: board.teamMembers,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a board
app.put("/boards/:boardId", async (req, res) => {
  try {
    const board = await Board.findByIdAndUpdate(req.params.boardId, req.body, {
      new: true,
    });
    if (!board) {
      return res.status(404).send("Board not found");
    }
    res.status(200).send(board);
    io.emit("boardUpdated", board);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a board
app.delete("/boards/:boardId", async (req, res) => {
  try {
    const board = await Board.findByIdAndDelete(req.params.boardId);
    if (!board) {
      return res.status(404).send("Board not found");
    }
    res.status(200).send({ message: "Board deleted successfully" });
    io.emit("boardDeleted", req.params.boardId);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Add Feedback to a Board
app.post("/boards/:boardId/feedback", async (req, res) => {
  try {
    const { type, content, userId } = req.body; // Include userId in request body
    if (!["Good", "Bad", "Ideas", "Actions", "Kudos"].includes(type)) {
      return res.status(400).send("Invalid feedback type");
    }
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).send("Board not found");
    }
    // Create feedback data object
    let feedbackData = { type, content };
    // Include userId in feedbackData if the board is not anonymous
    feedbackData.userId = userId;
    const newFeedback = new Feedback(feedbackData);
    board.feedback.push(newFeedback);
    await board.save();

    res.status(201).send(board);
    io.emit("feedbackAdded", board);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all feedbacks from a board including the feedback type and user ID
app.get("/boards/:boardId/feedback", async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId).lean();
    if (!board) {
      return res.status(404).send("Board not found");
    }
    const isBoardAnonymous = board.isAnonymous;
    // Map through the feedback to construct the detailed feedback objects including comments
    const feedbackWithDetails = board.feedback.map((fb) => {
      // For each feedback, map the comments to include only the necessary fields
      const comments = fb.comments.map((comment) => ({
        _id: comment._id,
        text: comment.text,
        createdAt: comment.createdAt,
        likes: comment.likes,
        dislikes: comment.dislikes,
        userId: comment.userId, // Make sure to populate this field correctly in the comment schema
      }));
      // Return the detailed feedback object with comments
      return {
        _id: fb._id,
        type: fb.type,
        content: fb.content,
        createdAt: fb.createdAt,
        likes: fb.likes,
        dislikes: fb.dislikes,
        comments: comments,
        userId: fb.userId,
        isAnonymous: isBoardAnonymous,
        title: board.title,
      };
    });

    res.status(200).send(feedbackWithDetails);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update a Specific Feedback
app.put("/boards/:boardId/feedback/:feedbackId", async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    let feedback = board.feedback.id(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).send("Feedback not found");
    }
    feedback = Object.assign(feedback, req.body);
    await board.save();
    res.status(200).send(board);
    io.emit("feedbackUpdated", board);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Like a Feedback
app.post("/boards/:boardId/feedback/:feedbackId/like", async (req, res) => {
  try {
    const userId = req.body.userId; // Assuming the user's ID is sent in the request body
    const board = await Board.findById(req.params.boardId);
    const feedback = board.feedback.id(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).send("Feedback not found");
    }
    if (!feedback.likedBy.includes(userId)) {
      feedback.likes += 1;
      feedback.likedBy.push(userId);
      await board.save();
    }
    res.status(200).send(board);
    io.emit("feedbackLiked", board);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Dislike a Feedback
app.post("/boards/:boardId/feedback/:feedbackId/dislike", async (req, res) => {
  try {
    const userId = req.body.userId; // User's ID
    const board = await Board.findById(req.params.boardId);
    const feedback = board.feedback.id(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).send("Feedback not found");
    }
    if (!feedback.dislikedBy.includes(userId)) {
      feedback.dislikes += 1;
      feedback.dislikedBy.push(userId);
      await board.save();
    }
    res.status(200).send(board);
    io.emit("feedbackDisliked", board);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a Specific Feedback
app.delete("/boards/:boardId/feedback/:feedbackId", async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).send("Board not found");
    }
    // Check if the feedback exists
    const feedbackExists = board.feedback.some(
      (fb) => fb.id === req.params.feedbackId
    );
    if (!feedbackExists) {
      return res.status(404).send("Feedback not found");
    }
    // Filter out the feedback to delete
    board.feedback = board.feedback.filter(
      (fb) => fb.id !== req.params.feedbackId
    );
    await board.save();
    res.status(200).send({ message: "Feedback deleted successfully" });
    io.emit("feedbackDeleted", {
      boardId: req.params.boardId,
      feedbackId: req.params.feedbackId,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Add a Comment to Feedback
app.post("/boards/:boardId/feedback/:feedbackId/comments", async (req, res) => {
  try {
    const { text, userId } = req.body;
    const board = await Board.findById(req.params.boardId);
    const feedback = board.feedback.id(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).send("Feedback not found");
    }
    let commentData = { text, userId };
    commentData.userId = userId;
    const newComment = new Comment(commentData);
    feedback.comments.push(newComment);
    await board.save();
    res.status(201).send(board);
    io.emit("commentAdded", board);
    console.log(board);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a Specific Comment
app.put(
  "/boards/:boardId/feedback/:feedbackId/comments/:commentId",
  async (req, res) => {
    try {
      const board = await Board.findById(req.params.boardId);
      const feedback = board.feedback.id(req.params.feedbackId);
      const comment = feedback.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).send("Comment not found");
      }
      comment.text = req.body.text;
      await board.save();
      res.status(200).send(board);
      io.emit("commentUpdated", board);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// Like a Comment on Feedback
app.post(
  "/boards/:boardId/feedback/:feedbackId/comments/:commentId/like",
  async (req, res) => {
    try {
      const userId = req.body.userId; // User's ID
      const board = await Board.findById(req.params.boardId);
      const feedback = board.feedback.id(req.params.feedbackId);
      const comment = feedback.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).send("Comment not found");
      }
      if (!comment.likedBy.includes(userId)) {
        comment.likes += 1;
        comment.likedBy.push(userId);
        await board.save();
      }
      res.status(200).send(board);
      io.emit("commentLiked", board);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// Dislike a Comment on Feedback
app.post(
  "/boards/:boardId/feedback/:feedbackId/comments/:commentId/dislike",
  async (req, res) => {
    try {
      const userId = req.body.userId; // User's ID
      const board = await Board.findById(req.params.boardId);
      const feedback = board.feedback.id(req.params.feedbackId);
      const comment = feedback.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).send("Comment not found");
      }
      if (!comment.dislikedBy.includes(userId)) {
        comment.dislikes += 1;
        comment.dislikedBy.push(userId);
        await board.save();
      }
      res.status(200).send(board);
      io.emit("commentDisliked", board);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// Delete a Specific Comment
app.delete(
  "/boards/:boardId/feedback/:feedbackId/comments/:commentId",
  async (req, res) => {
    try {
      const board = await Board.findById(req.params.boardId);
      if (!board) {
        return res.status(404).send("Board not found");
      }
      const feedback = board.feedback.id(req.params.feedbackId);
      if (!feedback) {
        return res.status(404).send("Feedback not found");
      }
      // Check if the comment exists
      const commentExists = feedback.comments.some(
        (c) => c.id === req.params.commentId
      );
      if (!commentExists) {
        return res.status(404).send("Comment not found");
      }
      // Filter out the comment to delete
      feedback.comments = feedback.comments.filter(
        (c) => c.id !== req.params.commentId
      );
      await board.save();
      res.status(200).send({ message: "Comment deleted successfully" });
      io.emit("commentDeleted", {
        boardId: req.params.boardId,
        feedbackId: req.params.feedbackId,
        commentId: req.params.commentId,
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).send("Internal Server Error");
    }
  }
);

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// Ping route to keep the server alive
app.get("/ping", (req, res) => {
  res.send("Server is alive");
});

// Schedule a cron job to run every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  try {
    const response = await axios.get("https://retrosphere.onrender.com/ping");
    console.log("Ping response:", response.data);
  } catch (error) {
    console.error("Error pinging server:", error.message);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
