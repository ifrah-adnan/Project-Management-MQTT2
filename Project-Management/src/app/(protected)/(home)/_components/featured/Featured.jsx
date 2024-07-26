import React, { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Grid,
  Divider,
  Paper,
  Slider,
  Alert,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Featured = ({ operations }) => {
  const [open, setOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [progressSize, setProgressSize] = useState(200);
  const [showAlert, setShowAlert] = useState(false);

  const handleClickOpen = (event, operation) => {
    event.stopPropagation();
    setSelectedOperation(operation);
    setOpen(true);
    if (operation.progress === 100) {
      setShowAlert(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOperation(null);
  };

  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowAlert(false);
  };

  const DetailedInfo = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Total operations made today
      </Typography>
      <Typography variant="h4" gutterBottom>
        {selectedOperation.todayCount}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Previous operations processing
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Typography variant="subtitle2" color="text.secondary">
            Target
          </Typography>
          <Typography variant="h6">{selectedOperation.target}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2" color="text.secondary">
            Last Week
          </Typography>
          <Typography variant="h6">
            {selectedOperation.lastWeekCount}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2" color="text.secondary">
            Last Month
          </Typography>
          <Typography variant="h6">
            {selectedOperation.lastMonthCount}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <div className="featured">
      <Box
        className="bottom"
        sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}
      >
        {operations.map((operation) => (
          <Paper
            key={operation.id}
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              transition: "all 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              },
              cursor: "pointer",
            }}
            onClick={(event) => handleClickOpen(event, operation)}
          >
            <Box
              className="featuredChart"
              sx={{
                width: `${progressSize}px`,
                height: `${progressSize}px`,
                margin: "0 auto 20px",
              }}
            >
              <CircularProgressbar
                value={operation.progress}
                text={`${Math.round(operation.progress)}%`}
                strokeWidth={8}
                styles={buildStyles({
                  textSize: `${16 * (progressSize / 200)}px`,
                  pathColor: `rgba(62, 152, 199, ${operation.progress / 100})`,
                  textColor: "#3e98c7",
                  trailColor: "#d6d6d6",
                  pathTransitionDuration: 0.5,
                })}
              />
            </Box>
            <Typography variant="h6" align="center" gutterBottom>
              {operation.name}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Completed: {operation.completedCount} / {operation.target}
            </Typography>
          </Paper>
        ))}
      </Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h5" component="div">
            {selectedOperation
              ? `${selectedOperation.name} Details`
              : "Operation Details"}
          </Typography>
          <IconButton aria-label="close" onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>{selectedOperation && <DetailedInfo />}</DialogContent>
      </Dialog>
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert
          onClose={handleAlertClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Congratulations ! You have reached 100% progress for{" "}
          {selectedOperation?.name} !
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Featured;

