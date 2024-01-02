import React from "react";
import { Typography } from "@mui/material";

const Title = () => {
  return (
    <>
      <Typography variant="h4" textAlign="center">
        Welcome to RetroSphere!
      </Typography>
      <Typography variant="subtitle2" textAlign="left" mb={2} mt={1}>
        RetroSphere is an interactive tool that enables teams to share feedback
        and ideas with your team openly or anonymously based on your preference
        for effective communication and continuous improvement.
      </Typography>
    </>
  );
};

export default Title;
