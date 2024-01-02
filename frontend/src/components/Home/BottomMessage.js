import React from "react";
import ShareIcon from "@mui/icons-material/Share";
import { Typography } from "@mui/material";

const BottomMessage = () => {
  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{
          mt: 2,
          display: "flex",
          color: "gray",
          fontSize: "13px",
        }}
      >
        <ShareIcon sx={{ mr: 1, marginTop: "7px" }} /> Copy and share the Board
        ID with your team to join this board and provide feedback on the
        RetroBoard page.
      </Typography>
    </>
  );
};

export default BottomMessage;
