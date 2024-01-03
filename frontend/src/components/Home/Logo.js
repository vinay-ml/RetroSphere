import React from "react";
import logo from "../../logo/logo-desktop.png";
import { Box } from "@mui/material";

const Logo = () => {
  return (
    <Box mr={4} display="flex" justifyContent="center">
      <img src={logo} alt="logo" style={{ maxWidth: "85%", height: "auto" }} />
    </Box>
  );
};

export default Logo;
