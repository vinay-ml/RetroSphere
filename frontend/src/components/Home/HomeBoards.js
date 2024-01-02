import React, { useState } from "react";
import { Box, Button, Paper, Typography, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const HomeBoards = ({ id, index, onConfirmDelete }) => {
  const [copyStatus, setCopyStatus] = useState({});

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopyStatus({ ...copyStatus, [id]: true });
    setTimeout(() => {
      setCopyStatus({ ...copyStatus, [id]: false });
    }, 2000);
  };

  return (
    <Paper
      key={id}
      sx={{
        mt: 2,
        mb: 2,
        p: 1,
        borderLeft: index === 0 ? "4px solid green" : "4px solid lightcoral",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle2">
          <span style={{ fontWeight: "600" }}>Board ID</span>: {id}
        </Typography>

        <Box>
          <Button
            sx={{ textTransform: "none", fontSize: "12px", marginRight: 1 }}
            onClick={() => copyToClipboard(id)}
          >
            {copyStatus[id] ? (
              <>
                <DoneIcon fontSize="small" /> Copied!
              </>
            ) : (
              <>
                <ContentCopyIcon fontSize="small" /> Copy ID
              </>
            )}
          </Button>
          <IconButton onClick={() => onConfirmDelete(id)} size="small">
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default HomeBoards;
