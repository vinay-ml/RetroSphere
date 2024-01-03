import React, { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";

import Logo from "./Logo";
import Toast from "../Toast";
import styles from "../Styles.module.css";
import Title from "./Title";
import BottomMessage from "./BottomMessage";
import HomeBoards from "./HomeBoards";
import ConfirmationDialog from "./ConfirmationDialog";
import NavBar from "../NavBar";

const Home = () => {
  const [boardTitle, setBoardTitle] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [boardIds, setBoardIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [openDialog, setOpenDialog] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);

  useEffect(() => {
    const storedBoardIds = JSON.parse(localStorage.getItem("boards") || "[]");
    setBoardIds(storedBoardIds);
  }, []);

  const handleCreateBoard = async () => {
    if (!boardTitle.trim()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: boardTitle, isAnonymous }),
      });

      const data = await response.json();
      if (response.ok) {
        const newBoardId = data.boardId;
        const updatedBoardIds = [newBoardId, ...boardIds].slice(0, 4);
        setBoardIds(updatedBoardIds);
        localStorage.setItem("boards", JSON.stringify(updatedBoardIds));
        setToast({
          show: true,
          message: "Board created successfully!",
          type: "success",
        });
        setBoardTitle("");
      } else {
        console.error("Error creating board:", data);
      }
    } catch (error) {
      console.error("Error:", error);
      setToast({
        show: true,
        message: "Failed to create board.",
        type: "error",
      });
    }
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
    setIsLoading(false);
  };

  const isToday = (id) => {
    const today = new Date();
    const str = id;
    const parts = str.split(":");
    const dateString = parts[1];
    const dateParts = dateString.split("-").map((part) => parseInt(part, 10));
    const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayBoardIds = boardIds.filter((id) => isToday(id));

  const handleOpenDialog = (boardId) => {
    setBoardToDelete(boardId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = () => {
    handleDeleteBoard(boardToDelete);
    handleCloseDialog();
  };

  const handleDeleteBoard = async (id) => {
    try {
      const response = await fetch(`/boards/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedBoardIds = boardIds.filter((boardId) => boardId !== id);
        setBoardIds(updatedBoardIds);
        localStorage.setItem("boards", JSON.stringify(updatedBoardIds));
        setToast({
          show: true,
          message: "Board deleted successfully!",
          type: "success",
        });
      } else {
        console.error("Error deleting board:", await response.text());
        setToast({
          show: true,
          message: "Failed to delete board.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      setToast({
        show: true,
        message: "Network error, failed to delete board.",
        type: "error",
      });
    }
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 5000);
  };

  const handleCloseToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <>
      <NavBar />
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        height="80vh"
        px={2}
        mt={5}
        mr={8}
        mb={5}
      >
        <Logo />
        <Paper
          style={{
            padding: 20,
            maxWidth: 600,
            width: "100%",
            overflow: "auto",
          }}
          elevation={2}
        >
          <Title />
          <Box sx={{ marginTop: "20px", marginBottom: "10px" }}>
            <TextField
              sx={{ width: "280px" }}
              label="Enter Board Title"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
              }
              label="Anonymous"
              sx={{
                display: "block",
                marginTop: 1,
                width: "150px",
              }}
            />
            <Typography
              variant="caption"
              color="red"
              sx={{ display: "block", marginBottom: 2 }}
            >
              {isAnonymous
                ? "When Anonymous is enabled, Team identity will be hidden."
                : "When Anonymous is disabled, Team identity will be revealed."}
            </Typography>
            <Button
              sx={{
                textTransform: "none",
                position: "relative",
              }}
              variant="contained"
              onClick={handleCreateBoard}
              disabled={isLoading}
              size="small"
            >
              {isLoading ? (
                <React.Fragment>
                  <CircularProgress
                    size={24}
                    style={{
                      position: "absolute",
                      left: "50%",
                      marginLeft: "-12px",
                    }}
                  />
                  Creating...
                </React.Fragment>
              ) : (
                "Create New Board"
              )}
            </Button>
          </Box>
          <Box className={styles.customScrollbar}>
            {todayBoardIds.map((id, index) => (
              <HomeBoards
                key={id}
                id={id}
                index={index}
                onConfirmDelete={handleOpenDialog}
              />
            ))}
          </Box>
          {todayBoardIds.length > 0 && <BottomMessage />}
        </Paper>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={handleCloseToast}
          />
        )}
        <ConfirmationDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          description="Do you really want to delete this board?"
        />
      </Box>
    </>
  );
};

export default Home;
