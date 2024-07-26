"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Featured from "../_components/featured/Featured";
import Chart from "../_components/chart/Chart";
import dynamic from "next/dynamic";
import { Layouts, Layout } from "react-grid-layout";
import {
  getHourlyOperations,
  getWeeklyOperations,
  HourlyOperation,
  WeeklyOperation,
} from "@/actions/weekly-operations/index";
import {
  getOperationProgress,
  OperationDetails,
  WeeklyProgress,
} from "@/actions/operation-progress/index";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Container,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCommandProject,
  CommandProject,
} from "../../projects/_utils/actions";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = dynamic(
  () =>
    import("react-grid-layout").then((mod) => {
      const { Responsive, WidthProvider } = mod;
      return WidthProvider(Responsive);
    }),
  { ssr: false },
);

const StyledCard = styled(Card)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  borderRadius: "12px",
  overflow: "hidden",
});

const StyledLinearProgress = styled(LinearProgress)({
  height: 10,
  borderRadius: 5,
});

function ProjectOverview({ params }: any) {
  const searchParams = useSearchParams();
  const commandProjectId = searchParams.get("commandProjectId");

  const [commandProject, setCommandProject] = useState<CommandProject | null>(
    null,
  );
  const [weeklyOperations, setWeeklyOperations] = useState<WeeklyOperation[]>(
    [],
  );
  const [hourlyOperations, setHourlyOperations] = useState<HourlyOperation[]>(
    [],
  );
  const [totalWeeklyOperations, setTotalWeeklyOperations] = useState(0);
  const [totalHourlyOperations, setTotalHourlyOperations] = useState(0);
  const [operationDetails, setOperationDetails] = useState<OperationDetails[]>(
    [],
  );
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [selectedView, setSelectedView] = useState("Week");
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({
    weeklyTarget: null,
    weeklyCompleted: 0,
    hasSprint: false,
    hasFinalOperation: false,
  });
  const [totalEstimatedHours, setTotalEstimatedHours] = useState(0);
  const [mounted, setMounted] = React.useState(false);

  const [layouts, setLayouts] = useState({
    lg: [
      { i: "chart", x: 0, y: 0, w: 12, h: 4, minH: 3, maxH: 6 },
      { i: "featured", x: 0, y: 5, w: 12, h: 4, minH: 3, maxH: 6 },
      { i: "summary", x: 0, y: 10, w: 12, h: 2, minH: 2, maxH: 4 },
    ],
    md: [
      { i: "chart", x: 0, y: 0, w: 10, h: 4, minH: 3, maxH: 6 },
      { i: "featured", x: 0, y: 5, w: 10, h: 4, minH: 3, maxH: 6 },
      { i: "summary", x: 0, y: 10, w: 10, h: 2, minH: 2, maxH: 4 },
    ],
    sm: [
      { i: "chart", x: 0, y: 0, w: 6, h: 4, minH: 3, maxH: 6 },
      { i: "featured", x: 0, y: 5, w: 6, h: 4, minH: 3, maxH: 6 },
      { i: "summary", x: 0, y: 10, w: 6, h: 2, minH: 2, maxH: 4 },
    ],
    xs: [
      { i: "chart", x: 0, y: 0, w: 4, h: 4, minH: 3, maxH: 6 },
      { i: "featured", x: 0, y: 5, w: 4, h: 4, minH: 3, maxH: 6 },
      { i: "summary", x: 0, y: 10, w: 4, h: 2, minH: 2, maxH: 4 },
    ],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!commandProjectId) return;

      try {
        const projectData = await getCommandProject(commandProjectId);
        setCommandProject(projectData);

        const weeklyOps = await getWeeklyOperations(commandProjectId);
        setWeeklyOperations(weeklyOps);
        setTotalWeeklyOperations(
          weeklyOps.reduce((sum, op) => sum + op.Total, 0),
        );

        const hourlyOps = await getHourlyOperations(commandProjectId);
        setHourlyOperations(hourlyOps);
        setTotalHourlyOperations(
          hourlyOps.reduce((sum, op) => sum + op.Total, 0),
        );

        const progressData = await getOperationProgress(commandProjectId);
        setOperationDetails(progressData.operationDetails);
        setTotalCompleted(progressData.totalCompleted);
        setTotalTarget(progressData.totalTarget);
        setWeeklyProgress(progressData.weeklyProgress);
        setTotalEstimatedHours(progressData.totalEstimatedHours);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchData();
    setMounted(true);
  }, [commandProjectId, mounted]);
  if (!mounted) return null;

  const totalProgress =
    totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

  const transformedHourlyOperations = hourlyOperations.map((operation) => ({
    name: `${operation.hour}:00`,
    Total: operation.Total,
  }));

  const weeklyProgressPercentage =
    weeklyProgress.weeklyTarget && weeklyProgress.weeklyTarget > 0
      ? (weeklyProgress.weeklyCompleted / weeklyProgress.weeklyTarget) * 100
      : null;

  const onLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    const sortedLayout = currentLayout.sort((a, b) => a.y - b.y);

    let currentY = 0;
    const updatedLayout = sortedLayout.map((item) => {
      const newItem = { ...item, y: currentY };
      currentY += item.h;
      return newItem;
    });

    const breakpointKey =
      allLayouts.breakpoint && allLayouts.breakpoint.toString
        ? allLayouts.breakpoint.toString()
        : "default";

    setLayouts((prevLayouts) => ({
      ...prevLayouts,
      [breakpointKey]: updatedLayout,
    }));
  };

  const renderComponent = (componentId: string) => {
    switch (componentId) {
      case "summary":
        return (
          <Grid container spacing={4} className="drag-handle">
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Total Operations Progress
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {`${Math.round(totalProgress)}%`}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <StyledLinearProgress
                      variant="determinate"
                      value={totalProgress}
                      color="primary"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {`${totalCompleted} / ${totalTarget} completed`}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Weekly Project Progress
                  </Typography>
                  {weeklyProgress.hasFinalOperation &&
                    weeklyProgress.hasSprint && (
                      <>
                        <Typography
                          variant="h5"
                          component="div"
                          fontWeight="bold"
                        >
                          {weeklyProgressPercentage !== null
                            ? `${Math.round(weeklyProgressPercentage)}%`
                            : "N/A"}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <StyledLinearProgress
                            variant="determinate"
                            value={weeklyProgressPercentage || 0}
                            color="secondary"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {`${weeklyProgress.weeklyCompleted} / ${weeklyProgress.weeklyTarget || "N/A"} completed this week`}
                        </Typography>
                      </>
                    )}
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Project Dates
                  </Typography>
                  <Typography variant="body1" component="div">
                    Start:{" "}
                    {commandProject?.startDate
                      ? new Date(commandProject.startDate).toLocaleDateString()
                      : ""}
                  </Typography>
                  <Typography variant="body1" component="div">
                    Due:{" "}
                    {commandProject?.endDate
                      ? new Date(commandProject.endDate).toLocaleDateString()
                      : ""}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Total Estimated Hours
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight="bold">
                    {totalEstimatedHours.toFixed(2)}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        );
      case "featured":
        return (
          <div>
            <div className="drag-handle featured-header">
              <h2>Operations progress</h2>
            </div>
            <Featured operations={operationDetails} />
          </div>
        );
      case "chart":
        return (
          <Box sx={{ height: "100%" }}>
            <Box
              className="drag-handle"
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Select onValueChange={(value) => setSelectedView(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Time</SelectLabel>
                    <SelectItem value="Week">Week</SelectItem>
                    <SelectItem value="Hours">Hours</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Box>
            {selectedView === "Week" ? (
              <Chart
                title="Daily operations in the past week"
                data={weeklyOperations}
                width="100%"
                height="100%"
                totalOperations={totalWeeklyOperations}
              />
            ) : (
              <Chart
                title="Hourly operations in the past week"
                data={transformedHourlyOperations}
                width="100%"
                height="100%"
                totalOperations={totalHourlyOperations}
              />
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 6, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Overview
        </Typography>
      </Box>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={100}
        isResizable={true}
        isDraggable={true}
        draggableHandle=".drag-handle"
        compactType="vertical"
        preventCollision={false}
      >
        {["chart", "featured", "summary"].map((key) => (
          <div key={key} className="grid-item">
            {renderComponent(key)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </Container>
  );
}

export default ProjectOverview;
