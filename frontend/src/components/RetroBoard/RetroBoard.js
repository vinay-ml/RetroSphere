import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { io } from "socket.io-client";
import MemberName from "./MemberName";
import Toast from "../Toast";
import Joined from "./joined";
import Feedback from "./Feedback ";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NavBar from "../NavBar";

const clientOrigin =
  process.env.NODE_ENV === "production"
    ? "https://retrosphere.onrender.com"
    : "http://localhost:5000";

// Establish the socket connection
const socket = io(clientOrigin);

function RetroBoard() {
  const [boardId, setBoardId] = useState("");
  const [id, setId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [userId, setUserId] = useState("");
  const [boardDetails, setBoardDetails] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [boardSuccess, setBoardSuccess] = useState(false);
  const [typingMembers, setTypingMembers] = useState({});
  const [isLoadingJoin, setIsLoadingJoin] = useState(false);

  // Function to reset state and clear local storage
  const resetBoardState = () => {
    setBoardId("");
    setId("");
    setUserId("");
    setBoardDetails(null);
    setOpenDialog(false);
    setIsLoading(false);
    setToast({ show: false, message: "", type: "" });
    setBoardSuccess(false);
    setTypingMembers({});
    localStorage.removeItem("boardData"); // Clear boardData from local storage
  };

  useEffect(() => {
    const storedBoardData = localStorage.getItem("boardData");
    if (storedBoardData) {
      const boardData = JSON.parse(storedBoardData);
      // Check if the stored data has expired
      if (boardData.expiry > new Date().getTime()) {
        setBoardId(boardData._id);
        setBoardTitle(boardData.title);
        setIsAnonymous(boardData.isAnonymous);
        setUserId(boardData.userId);
        setBoardSuccess(boardData.boardSuccess);
      } else {
        localStorage.removeItem("boardData");
      }
    }
  }, [boardSuccess]);

  useEffect(() => {
    const fetchBoardDetails = async () => {
      if (!boardId) return;
      if (boardSuccess) {
        try {
          const response = await fetch(`/boards/${boardId}`);
          const data = await response.json();
          setBoardDetails(data);
        } catch (error) {
          console.error("Error fetching board details:", error);
        }
      }
    };
    fetchBoardDetails();
  }, [boardSuccess]);

  // Event listener for board updates
  useEffect(() => {
    socket.on("boardUpdated", (data) => {
      if (data.boardId === boardId) {
        setBoardDetails(data.boardDetails);
      }
    });
    // Event listeners for typing indicators
    socket.on("memberTyping", (memberId) => {
      setTypingMembers((prev) => ({ ...prev, [memberId]: true }));
    });

    socket.on("memberStoppedTyping", (memberId) => {
      setTypingMembers((prev) => ({ ...prev, [memberId]: false }));
    });

    // Event listeners for feedback and comment interactions
    const handleUpdate = (updatedBoard) => {
      if (updatedBoard._id === boardId) {
        setBoardDetails(updatedBoard);
      }
    };

    socket.on("memberJoined", (updatedBoardDetails) => {
      if (updatedBoardDetails._id === boardId) {
        setBoardDetails(updatedBoardDetails);
      }
    });

    socket.on("memberLeft", (updatedBoardDetails) => {
      if (updatedBoardDetails._id === boardId) {
        setBoardDetails(updatedBoardDetails);
      }
    });

    socket.on("feedbackAdded", handleUpdate);
    socket.on("feedbackUpdated", handleUpdate);
    socket.on("feedbackDeleted", handleUpdate);
    socket.on("feedbackLiked", handleUpdate);
    socket.on("feedbackDisliked", handleUpdate);
    socket.on("commentAdded", handleUpdate);
    socket.on("commentUpdated", handleUpdate);
    socket.on("commentLiked", handleUpdate);
    socket.on("commentDisliked", handleUpdate);
    socket.on("commentDeleted", handleUpdate);

    // Clean up on component unmount
    return () => {
      socket.off("boardUpdated");
      socket.off("memberTyping");
      socket.off("feedbackAdded");
      socket.off("feedbackUpdated");
      socket.off("feedbackDeleted");
      socket.off("memberStoppedTyping");

      socket.off("feedbackLiked");
      socket.off("feedbackDisliked");
      socket.off("commentAdded");
      socket.off("commentUpdated");
      socket.off("commentLiked");
      socket.off("commentDisliked");
      socket.off("commentDeleted");
      socket.off("memberJoined");
      socket.off("memberLeft");
    };
  }, [boardSuccess]);

  // Update retroBoardIds array in local storage
  useEffect(() => {
    if (boardSuccess) {
      const boardIds = JSON.parse(localStorage.getItem("retroBoardIds")) || [];
      if (!boardIds.includes(boardId)) {
        const updatedBoardIds = [boardId, ...boardIds].slice(0, 4);
        localStorage.setItem("retroBoardIds", JSON.stringify(updatedBoardIds));
      }
    }
  }, [boardSuccess]);

  const handleBoardIdSubmit = async () => {
    if (id === boardId && boardSuccess) {
      setToast({
        show: true,
        message: "This board is already activated",
        type: "info",
      });
      setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
      return;
    }
    setIsLoading(true);
    setToast({ show: false, message: "", type: "" });
    try {
      setIsAnonymous(false);
      setMemberName("");
      setBoardTitle("");
      const response = await fetch(`/boards/${id}`);
      const data = await response.json();
      setIsAnonymous(data.isAnonymous);
      setBoardTitle(data.title);
      setBoardId(id);
      setOpenDialog(true);
    } catch (error) {
      setToast({
        show: true,
        message: "Invalid Board ID",
        type: "error",
      });
      setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
    }
    setIsLoading(false);
  };

  const handleJoinBoard = async () => {
    setIsLoadingJoin(true);
    try {
      resetBoardState();
      const requestBody = { name: memberName };
      const response = await fetch(`/join/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      // Storing board details in local storage with a 1-day expiry
      setIsAnonymous(data.isAnonymous);
      setBoardTitle(data.title);
      setBoardId(data._id);
      setBoardSuccess(true);
      setId("");
      const boardDataForStorage = {
        _id: data._id,
        title: data.title,
        userId: data.userId,
        isAnonymous: data.isAnonymous,
        boardSuccess: true,
        expiry: new Date().getTime() + 24 * 60 * 60 * 1000,
      };
      localStorage.setItem("boardData", JSON.stringify(boardDataForStorage));
      setOpenDialog(false);
      setIsLoadingJoin(false);
    } catch (error) {
      console.error("Error joining board:", error);
      setIsLoadingJoin(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <NavBar boardTitle={boardTitle} />
      <Box mt={4} ml={4} mr={1}>
        <Stack flexDirection="row">
          <Box sx={{ width: "680px" }}>
            <TextField
              label="Enter Board ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              size="small"
              sx={{ width: "380px" }}
              error={toast.show && toast.type === "error"}
            />
            <Button
              type="button"
              sx={{
                textTransform: "none",
                position: "relative",
                ml: 2,
                width: "90px",
              }}
              variant="contained"
              onClick={handleBoardIdSubmit}
              disabled={!id || isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Activate"}
            </Button>

            <MemberName
              openDialog={openDialog}
              handleCloseDialog={handleCloseDialog}
              boardTitle={boardTitle}
              memberName={memberName}
              setMemberName={setMemberName}
              handleJoinBoard={handleJoinBoard}
            />
            {toast.show && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ show: false, message: "", type: "" })}
              />
            )}
          </Box>
          <Box flexGrow={1}>
            {!isAnonymous && (
              <Joined
                boardDetails={boardDetails}
                typingMembers={typingMembers}
                boardId={boardId}
                socket={socket}
              />
            )}
          </Box>
        </Stack>
        {isLoadingJoin ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="80vh"
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {boardSuccess && (
              <Stack direction="row">
                <Typography variant="subtitle2" sx={{ color: "green" }}>
                  Board ID: {boardId} activated successfully{" "}
                </Typography>
                <DoneAllIcon
                  fontSize="small"
                  sx={{ ml: "4px", color: "green" }}
                />
              </Stack>
            )}
            {boardSuccess && (
              <Box sx={{ mt: 3 }}>
                <Feedback
                  boardId={boardId}
                  boardDetails={boardDetails}
                  userId={userId}
                  socket={socket}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}

export default RetroBoard;
