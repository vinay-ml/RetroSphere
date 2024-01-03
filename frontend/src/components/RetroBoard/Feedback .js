import React, { useEffect, useState } from "react";
import { Button, Grid, Box, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { categories } from "../utils/utils";
import FeedbackCardButtons from "./FeedbackCardButtons";
import MainUser from "./MainUser";
import OtherUser from "./OtherUser";
import { CircularProgress } from "@mui/material";
import "../../App.css";

const Feedback = ({ boardId, boardDetails, socket, userId }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editedFeedbackText, setEditedFeedbackText] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [commentingFeedbackId, setCommentingFeedbackId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const fetchFeedbacks = async () => {
    if (!boardId) {
      return;
    }
    try {
      const response = await fetch(`/boards/${boardId}/feedback`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  useEffect(() => {
    if (boardDetails && boardDetails.feedback) {
      // setFeedbacks(boardDetails.feedback);
      fetchFeedbacks();
    }
  }, [boardDetails]);

  useEffect(() => {
    fetchFeedbacks();
    socket.on("feedbackDeleted", (data) => {
      if (boardId === data.boardId) {
        setFeedbacks((currentFeedbacks) =>
          currentFeedbacks.filter((fb) => fb._id !== data.feedbackId)
        );
      }
    });
    return () => {
      socket.off("feedbackDeleted");
    };
  }, [socket, boardId]);

  const handleAddCardClick = (category) => {
    setActiveCategory(category);
    setFeedbackText("");
  };

  const handleCancel = () => {
    setActiveCategory(null);
    setFeedbackText("");
  };

  const handleSend = async (category) => {
    if (!feedbackText.trim()) {
      return;
    }
    setIsSendingFeedback(true);
    const payload = {
      type: category,
      content: feedbackText,
    };
    payload.userId = userId;
    try {
      const response = await fetch(`/boards/${boardId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setIsSendingFeedback(false);
      handleCancel();
    } catch (error) {
      console.error("Error sending feedback:", error);
      setIsSendingFeedback(false);
    }
  };

  const getCategoryColor = (category) => {
    const cat = categories.find((c) => c.title === category);
    return cat ? cat.color : "transparent";
  };

  /// Feedback functions
  const handleEditFeedback = (feedbackId, content) => {
    setEditingFeedbackId(feedbackId);
    setEditedFeedbackText(content);
  };

  const handleCancelEdit = () => {
    setEditingFeedbackId(null);
    setEditedFeedbackText("");
  };

  const handleUpdateFeedback = async (feedbackId) => {
    const payload = {
      content: editedFeedbackText,
    };
    try {
      const response = await fetch(
        `/boards/${boardId}/feedback/${feedbackId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
    handleCancelEdit(); // Reset editing state
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const response = await fetch(
        `/boards/${boardId}/feedback/${feedbackId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setFeedbacks(feedbacks.filter((fb) => fb._id !== feedbackId));
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const handleChange = (e) => {
    setFeedbackText(e.target.value);
    // Emit typing event
    socket.emit("memberTyping", userId);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const newTimeout = setTimeout(() => {
      socket.emit("memberStoppedTyping", userId);
    }, 3000);
    setTypingTimeout(newTimeout);
  };

  const handleEditedFeedbackText = (e) => {
    setEditedFeedbackText(e.target.value);
    // Emit typing event
    socket.emit("memberTyping", userId);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const newTimeout = setTimeout(() => {
      socket.emit("memberStoppedTyping", userId);
    }, 3000);
    setTypingTimeout(newTimeout);
  };

  // Function to check if a user is a main user
  const isMainUser = (feedbackUserId) => {
    const isMain = userId === feedbackUserId;
    return isMain;
  };

  // comments functions
  const handleCommentClick = (feedbackId) => {
    setCommentingFeedbackId(feedbackId);
    setCommentText("");
  };

  const handleCancelComment = () => {
    setCommentingFeedbackId(null);
    setCommentText("");
  };

  const handleSendComment = async (feedbackId) => {
    if (!commentText.trim()) {
      return;
    }
    try {
      const payload = {
        text: commentText,
        userId: userId,
      };
      const response = await fetch(
        `/boards/${boardId}/feedback/${feedbackId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedBoard = await response.json(); // The response contains the updated board
      const updatedFeedback = updatedBoard.feedback.find(
        (fb) => fb._id === feedbackId
      );
      // Update the local state with the updated feedback
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((fb) =>
          fb._id === feedbackId ? updatedFeedback : fb
        )
      );
    } catch (error) {
      console.error("Error sending comment:", error);
      alert("Failed to send comment");
    }
    handleCancelComment();
  };

  const handleOnChangeComment = (e) => {
    setCommentText(e.target.value);
    // Emit typing event
    socket.emit("memberTyping", userId);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const newTimeout = setTimeout(() => {
      socket.emit("memberStoppedTyping", userId);
    }, 3000);
    setTypingTimeout(newTimeout);
  };

  return (
    <Box sx={{ mr: 2 }}>
      <Grid container spacing={2} justifyContent="center">
        {categories.map((category, i) => (
          <Grid item key={category.title} xs={12} sm={6} md={4} lg={2.4}>
            <FeedbackCardButtons
              category={category}
              handleAddCardClick={handleAddCardClick}
            />
            {isSendingFeedback && activeCategory === category.title && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 100,
                  width: "100%",
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  mt: 1,
                }}
              >
                <CircularProgress
                  sx={{ color: getCategoryColor(category.title) }}
                />
              </Box>
            )}
            {activeCategory === category.title && !isSendingFeedback && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: getCategoryColor(category.title),
                  borderRadius: "5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <TextField
                  autoFocus
                  fullWidth
                  multiline
                  minRows={3}
                  variant="outlined"
                  placeholder="Enter Your Feedback"
                  value={feedbackText}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    style: {
                      backgroundColor: getCategoryColor(category.title),
                      borderRadius: "5px",
                      paddingTop: "8px",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "transparent",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "transparent",
                      },
                    },
                    "& .MuiOutlinedInput-inputMultiline": {
                      maxHeight: "none",
                      overflow: "auto",
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                    mt: "-8px",
                  }}
                >
                  <Button
                    onClick={handleCancel}
                    size="small"
                    sx={{
                      color: "black",
                      textTransform: "None",
                      fontSize: "11px",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSend(category.title)}
                    size="small"
                    sx={{
                      color: "black",
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </Button>
                </Box>
              </Box>
            )}
            <Box>
              <MainUser
                feedbacks={feedbacks}
                category={category}
                isMainUser={isMainUser}
                editingFeedbackId={editingFeedbackId}
                editedFeedbackText={editedFeedbackText}
                handleEditedFeedbackText={handleEditedFeedbackText}
                getCategoryColor={getCategoryColor}
                handleUpdateFeedback={handleUpdateFeedback}
                handleCancelEdit={handleCancelEdit}
                handleEditFeedback={handleEditFeedback}
                handleDeleteFeedback={handleDeleteFeedback}
              />
              <OtherUser
                feedbacks={feedbacks}
                category={category}
                isMainUser={isMainUser}
                commentingFeedbackId={commentingFeedbackId}
                handleCommentClick={handleCommentClick}
                handleCancelComment={handleCancelComment}
                handleSendComment={handleSendComment}
                commentText={commentText}
                setCommentText={setCommentText}
                handleOnChangeComment={handleOnChangeComment}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Feedback;
