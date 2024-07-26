"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const SettingsPage = () => {
  const [theme, setTheme] = useState("Dark");
  const [appFontSize, setAppFontSize] = useState(12);
  const [tableFontSize, setTableFontSize] = useState(11);

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  const adjustFontSize = (setter, currentSize, adjustment) => {
    setter(currentSize + adjustment);
  };

  const resetFontSize = (setter, defaultSize) => {
    setter(defaultSize);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", color: "text.primary" }}>
      <Typography variant="h6" gutterBottom>
        UI
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography sx={{ width: 120 }}>Theme</Typography>
        <Select
          value={theme}
          onChange={handleThemeChange}
          sx={{ minWidth: 120 }}
          size="small"
        >
          <MenuItem value="Dark">Dark</MenuItem>
          <MenuItem value="Light">Light</MenuItem>
        </Select>
      </Box>

      {/* <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography sx={{ width: 120 }}>App font size</Typography>
        <Typography sx={{ mr: 2 }}>{appFontSize}px</Typography>
        <IconButton
          onClick={() => adjustFontSize(setAppFontSize, appFontSize, 1)}
          size="small"
        >
          <AddIcon />
        </IconButton>
        <IconButton
          onClick={() => adjustFontSize(setAppFontSize, appFontSize, -1)}
          size="small"
        >
          <RemoveIcon />
        </IconButton>
        <Button onClick={() => resetFontSize(setAppFontSize, 12)} size="small">
          Reset
        </Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ width: 120 }}>Table font size</Typography>
        <Typography sx={{ mr: 2 }}>{tableFontSize}px</Typography>
        <IconButton
          onClick={() => adjustFontSize(setTableFontSize, tableFontSize, 1)}
          size="small"
        >
          <AddIcon />
        </IconButton>
        <IconButton
          onClick={() => adjustFontSize(setTableFontSize, tableFontSize, -1)}
          size="small"
        >
          <RemoveIcon />
        </IconButton>
        <Button
          onClick={() => resetFontSize(setTableFontSize, 11)}
          size="small"
        >
          Reset
        </Button>
      </Box> */}
    </Box>
  );
};

export default SettingsPage;
