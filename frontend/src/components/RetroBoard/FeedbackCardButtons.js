import React from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const FeedbackCardButtons = ({ category, handleAddCardClick }) => {
  return (
    <Button
      fullWidth
      startIcon={<AddIcon />}
      style={{
        margin: "5px 0",
        backgroundColor: category.color,
        color: "#000",
      }}
      variant="contained"
      onClick={() => handleAddCardClick(category.title)}
      size="medium"
    >
      {category.title}
    </Button>
  );
};

export default FeedbackCardButtons;
