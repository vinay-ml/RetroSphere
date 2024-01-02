import React from "react";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const Toast = ({ message, type, onClose }) => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        left: 20,
        backgroundColor: type === "success" ? "green" : "#ff6659",
        color: "white",
        padding: "8px",
        borderRadius: "5px",
        boxShadow: "0 3px 5px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
      }}
    >
      {message}
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          marginLeft: "auto",
          color: "white",
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default Toast;
