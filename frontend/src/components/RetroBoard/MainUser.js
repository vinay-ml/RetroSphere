import React, { useRef, useEffect } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const MainUser = ({
  feedbacks,
  category,
  isMainUser,
  editingFeedbackId,
  editedFeedbackText,
  handleEditedFeedbackText,
  getCategoryColor,
  handleUpdateFeedback,
  handleCancelEdit,
  handleEditFeedback,
  handleDeleteFeedback,
}) => {
  const textInputRef = useRef(null);

  // Effect to focus and set cursor position
  useEffect(() => {
    if (editingFeedbackId && textInputRef.current) {
      const length = editedFeedbackText.length;
      textInputRef.current.focus();
      textInputRef.current.setSelectionRange(length, length);
    }
  }, [editingFeedbackId, editedFeedbackText]);

  return (
    <Box>
      {feedbacks
        .filter((fb) => fb.type === category.title && isMainUser(fb.userId))
        .map((fb) => {
          const username = fb.isAnonymous
            ? "Your"
            : fb?.userId?.split("-")[0] + "'s";
          return (
            <React.Fragment key={fb._id}>
              {editingFeedbackId === fb._id ? (
                // Render the edit form for the feedback being edited
                <Box
                  key={fb._id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: getCategoryColor(category.title),
                    borderRadius: "5px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    p: 1,
                    mt: 1,
                  }}
                >
                  <TextField
                    inputRef={textInputRef}
                    fullWidth
                    multiline
                    minRows={Math.max(
                      3,
                      editedFeedbackText.split("\n").length || 1
                    )}
                    value={editedFeedbackText}
                    onChange={handleEditedFeedbackText}
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      style: {
                        backgroundColor: getCategoryColor(category.title),
                        paddingTop: "8px",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderWidth: "1px",
                        },
                        "&:hover fieldset": {
                          borderColor: "gray",
                          borderWidth: "1px",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "gray",
                          borderWidth: "1px",
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
                      mt: "-6px",
                      mb: "-6px",
                    }}
                  >
                    <Button
                      onClick={handleCancelEdit}
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
                      onClick={() => handleUpdateFeedback(fb._id)}
                      size="small"
                      sx={{
                        color: "black",
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </Button>
                  </Box>
                </Box>
              ) : (
                // Render the regular card view for feedback not being edited
                <Box
                  key={fb._id}
                  sx={{
                    backgroundColor: category.color,
                    pt: 1,
                    pl: 1,
                    pr: 1,
                    mt: 1,
                    mb: 2,
                    borderRadius: "5px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      m: -1,
                      mb: 1,
                      pl: 1,
                      backgroundColor: "transparent",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {`${username} Feedback:`}
                    </Typography>
                  </Paper>

                  <Typography sx={{ wordWrap: "break-word", mb: 3 }}>
                    {fb.content}
                  </Typography>
                  {fb.comments &&
                    fb.comments.map((comment) => {
                      const commentUsername = fb.isAnonymous
                        ? "Unknown"
                        : comment?.userId?.split("-")[0];

                      return (
                        <Box
                          key={comment._id}
                          sx={{
                            mb: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              textDecoration: "underline",
                              color: "gray",
                            }}
                          >
                            {`Comment by ${commentUsername}`}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, ml: 3 }}>
                            {comment.text}
                          </Typography>
                        </Box>
                      );
                    })}
                  <hr />
                  <Box
                    sx={{
                      mt: -1,
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Button
                      onClick={() => handleDeleteFeedback(fb._id)}
                      sx={{ color: "gray" }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                    <Button
                      onClick={() => handleEditFeedback(fb._id, fb.content)}
                      sx={{ color: "gray" }}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </Button>
                  </Box>
                </Box>
              )}
            </React.Fragment>
          );
        })}
    </Box>
  );
};

export default MainUser;
