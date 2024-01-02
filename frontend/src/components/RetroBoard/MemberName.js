import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

const MemberName = ({
  openDialog,
  handleCloseDialog,
  boardTitle,
  handleJoinBoard,
  memberName,
  setMemberName,
}) => {
  const isJoinDisabled = !memberName.trim();

  return (
    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>{boardTitle || ""}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter your name to join the board.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Your Name"
          fullWidth
          variant="standard"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          required
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Box mr={2} mb={1}>
          <Button
            size="small"
            sx={{ textTransform: "none" }}
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleJoinBoard}
            disabled={isJoinDisabled}
          >
            Join
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default MemberName;
