import React from "react";
import { Box, Button, Paper, Typography, TextField } from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import SendIcon from "@mui/icons-material/Send";

const OtherUser = ({
  feedbacks,
  category,
  isMainUser,
  handleCommentClick,
  handleCancelComment,
  handleSendComment,
  commentingFeedbackId,
  commentText,
  setCommentText,
  handleOnChangeComment,
}) => {
  return (
    <Box>
      {feedbacks
        .filter((fb) => fb.type === category.title && !isMainUser(fb.userId))
        .map((fb) => {
          const username = fb.isAnonymous ? "Other" : fb?.userId?.split("-")[0];
          const isCommenting = commentingFeedbackId === fb._id;
          return (
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
                sx={{ m: -1, mb: 1, pl: 1, backgroundColor: "transparent" }}
              >
                <Typography variant="subtitle2">
                  {`${username}'s Feedback:`}
                </Typography>
              </Paper>

              <Typography sx={{ wordWrap: "break-word", mb: 3 }}>
                {fb.content}
              </Typography>
              {/* Existing comments */}
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
              {isCommenting && (
                <>
                  <TextField
                    autoFocus
                    fullWidth
                    multiline
                    variant="outlined"
                    value={commentText}
                    onChange={handleOnChangeComment}
                    placeholder="Enter your comment"
                    margin="normal"
                    //
                    minRows={3}
                    InputProps={{
                      style: {
                        // backgroundColor: getCategoryColor(category.title),
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
                    //
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        mt: "-22px",
                      }}
                    >
                      <Button
                        onClick={handleCancelComment}
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
                        onClick={() => handleSendComment(fb._id)}
                        size="small"
                        sx={{
                          color: "black",
                        }}
                      >
                        <SendIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Box>
                </>
              )}

              <hr />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  mt: -1,
                }}
              >
                <Button
                  sx={{ color: "gray", textTransform: "none" }}
                  size="small"
                  onClick={() => handleCommentClick(fb._id)}
                >
                  Comment
                </Button>
                <Button
                  sx={{ color: "gray", textTransform: "none" }}
                  size="small"
                >
                  <ThumbUpOffAltIcon fontSize="small" />
                </Button>
                <Button sx={{ color: "gray" }} size="small">
                  <ThumbDownOffAltIcon fontSize="small" />
                </Button>
              </Box>
            </Box>
          );
        })}
    </Box>
  );
};

export default OtherUser;
