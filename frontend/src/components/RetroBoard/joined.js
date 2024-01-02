import React from "react";
import { Box, Typography, Paper, Tooltip } from "@mui/material";
import Lottie from "react-lottie";
import animationData from "../animation/typing.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const styles = {
  circularPaper: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  boldText: {
    fontWeight: "bold",
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "green",
    position: "absolute",
    right: -0,
    top: -0,
    border: "2px solid white",
  },
};

const Joined = ({ boardDetails, typingMembers }) => {
  const renderTeamMembers = () => {
    if (boardDetails && boardDetails.teamMembers) {
      return (
        <Box
          sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end" }}
        >
          {boardDetails.teamMembers.map((member, index) => (
            <Tooltip key={index} title={member.name || "Unknown"}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: "5px",
                  marginTop: "-10px",
                }}
              >
                <Paper sx={styles.circularPaper} elevation={5}>
                  <Typography variant="body2" sx={styles.boldText}>
                    {member.name
                      ? member.name.substring(0, 2).toUpperCase()
                      : "NA"}
                  </Typography>
                  <Box sx={styles.greenDot} />
                </Paper>
                {typingMembers[member.userId] && (
                  <Lottie
                    options={defaultOptions}
                    width={45}
                    style={{ marginLeft: -5 }}
                  />
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      );
    }
    return null;
  };

  return <Box>{renderTeamMembers()}</Box>;
};

export default Joined;
