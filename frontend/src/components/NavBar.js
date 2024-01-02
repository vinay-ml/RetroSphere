import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import logo from "../logo/logo.png";

const NavBar = ({ boardTitle }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center" }}>
          <Box
            component="img"
            src={logo}
            sx={{ width: "50px", marginRight: "8px" }}
            alt="logo"
          />
          <Button
            sx={{
              textTransform: "none",
              borderBottom: isActive("/") ? "2px solid white" : "none",
              marginRight: "8px",
            }}
            color="inherit"
            component={Link}
            to="/"
          >
            Home
          </Button>
          <Button
            sx={{
              textTransform: "none",
              borderBottom: isActive("/retroboard")
                ? "2px solid white"
                : "none",
              marginRight: "8px",
            }}
            color="inherit"
            component={Link}
            to="/retroboard"
          >
            RetroBoard
          </Button>
          <Button
            sx={{
              textTransform: "none",
              borderBottom: isActive("/previous-retroboards")
                ? "2px solid white"
                : "none",
            }}
            color="inherit"
            component={Link}
            to="/previous-retroboards"
          >
            Previous Boards
          </Button>
        </Box>
        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            textTransform: "none",
            ml: -10,
          }}
        >
          {boardTitle}
        </Typography>
        <Box sx={{ flexGrow: 1, mr: { md: 32, xs: 0 } }}></Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
