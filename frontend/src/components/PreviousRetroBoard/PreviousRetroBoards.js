import React, { useState } from "react";
import {
  Select,
  MenuItem,
  Button,
  Box,
  Stack,
  TextField,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { categories } from "../utils/utils";
import { CircularProgress } from "@mui/material";
import NavBar from "../NavBar";

const PreviousRetroBoards = () => {
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [manualBoardId, setManualBoardId] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const boardIds = JSON.parse(localStorage.getItem("retroBoardIds")) || [];
  const [isLoading, setIsLoading] = useState(false);

  console.log(feedbacks);

  const isBoardSelected = selectedBoardId || manualBoardId;

  const handleViewBoard = async () => {
    const boardId = selectedBoardId || manualBoardId;
    if (!boardId) {
      alert("Please select or enter a board ID.");
      return;
    }
    setIsLoading(true); // Start loading
    try {
      const response = await fetch(`/boards/${boardId}/feedback`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching board data:", error);
      alert("Failed to fetch board data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <NavBar boardTitle={feedbacks[0]?.title} />
      <Stack
        mt={4}
        ml={4}
        mr={1}
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <Select
          sx={{ width: "350px" }}
          value={selectedBoardId}
          onChange={(e) => setSelectedBoardId(e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select a Board
          </MenuItem>
          {boardIds.map((id) => (
            <MenuItem key={id} value={id}>
              {id}
            </MenuItem>
          ))}
        </Select>
        <TextField
          sx={{ width: "350px" }}
          label="Or Enter Board ID"
          variant="outlined"
          value={manualBoardId}
          onChange={(e) => setManualBoardId(e.target.value)}
        />
        <Button
          sx={{ textTransform: "none" }}
          variant="contained"
          onClick={handleViewBoard}
          disabled={!isBoardSelected}
        >
          View Board
        </Button>
      </Stack>
      <Box>
        {isLoading && (
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {feedbacks.length > 0 && (
          <Box sx={{ mt: 4, ml: 4, mr: 2 }}>
            <Grid container spacing={2} justifyContent="center">
              {categories.map((category) => (
                <Grid item key={category.title} xs={12} sm={6} md={4} lg={2.4}>
                  <Button
                    fullWidth
                    disableTouchRipple
                    disableFocusRipple
                    style={{
                      margin: "5px 0",
                      backgroundColor: category.color,
                      color: "#000",
                    }}
                    variant="contained"
                    size="medium"
                  >
                    {category.title}
                  </Button>
                  <Box>
                    {feedbacks
                      .filter((fb) => fb.type === category.title)
                      .map((fb) => {
                        const username = fb.userId
                          ? fb.userId.split("-")[0]
                          : "";
                        return (
                          <>
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
                              {!fb.isAnonymous && (
                                <Paper
                                  elevation={1}
                                  sx={{
                                    m: -1,
                                    mb: 1,
                                    pl: 1,
                                    backgroundColor: "transparent",
                                  }}
                                >
                                  <Typography variant="subtitle2">
                                    {`${username}'s Feedback:`}
                                  </Typography>
                                </Paper>
                              )}
                              <Typography
                                sx={{ wordWrap: "break-word", mb: 1, pb: 1.5 }}
                              >
                                {fb.content}
                              </Typography>
                              {fb.comments &&
                                fb.comments.map((comment) => {
                                  const commentUsername = comment?.userId
                                    ? comment.userId.split("-")[0]
                                    : "Unknown";
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
                                      <Typography
                                        variant="body2"
                                        sx={{ mt: 0.5, ml: 3, pb: 1.5 }}
                                      >
                                        {comment.text}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                            </Box>
                          </>
                        );
                      })}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PreviousRetroBoards;
