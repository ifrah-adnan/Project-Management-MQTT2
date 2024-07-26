"use server";

import { db } from "@/lib/db";

export interface WeeklyProgress {
  weeklyTarget: number | null;
  weeklyCompleted: number;
  hasSprint: boolean;
  hasFinalOperation: boolean;
}
export interface OperationDetails {
  id: string;
  name: string;
  progress: number;
  target: number;
  completedCount: number;
  todayCount: number;
  lastWeekCount: number;
  lastMonthCount: number;
}

export interface OperationProgressSummary {
  operationDetails: OperationDetails[];
  totalCompleted: number;
  totalTarget: number;
  weeklyProgress: WeeklyProgress;
  totalEstimatedHours: number;
}

export async function getOperationProgress(
  commandProjectId: string
): Promise<OperationProgressSummary> {
  const workflow = await db.workFlow.findFirst({
    where: {
      project: {
        commandProjects: {
          some: { id: commandProjectId },
        },
      },
    },
    include: {
      WorkflowNode: {
        include: {
          operation: true,
          targetEdges: true,
          sourceEdges: true,
        },
      },
      WorkFlowEdge: true,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found for the given command project");
  }

  const finalOperation = workflow.WorkflowNode.find(
    (node) => node.operation.isFinal
  );
  const hasFinalOperation = !!finalOperation;

  const sprint = await db.sprint.findUnique({
    where: { commandProjectId },
  });
  const hasSprint = !!sprint;

  // Calculate weekly target
  const weeklyTarget = hasSprint
    ? Math.ceil((sprint!.target / sprint!.days) * 7)
    : null;

  let weeklyCompleted = 0;

  if (hasFinalOperation) {
    // Get device IDs for the final operation
    const deviceIds = await db.device
      .findMany({
        where: {
          planning: {
            commandProjectId: commandProjectId,
            operationId: finalOperation!.operation.id,
          },
        },
        select: {
          deviceId: true,
        },
      })
      .then((devices) => devices.map((device) => device.deviceId));

    // Calculate weekly completed for the final operation
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyCompletedResult = await db.operationRecord.aggregate({
      where: {
        deviceId: { in: deviceIds },
        createdAt: { gte: oneWeekAgo },
      },
      _sum: { count: true },
    });

    weeklyCompleted = weeklyCompletedResult._sum.count || 0;
  }

  const commandProject = await db.commandProject.findUnique({
    where: { id: commandProjectId },
  });

  if (!commandProject) {
    throw new Error("Command project not found");
  }

  const baseTarget = commandProject.target;

  // Function to calculate cumulative multiplier for a node
  const calculateNodeTarget = (
    nodeId: string,
    visited = new Set<string>()
  ): number => {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);

    const node = workflow.WorkflowNode.find((n) => n.id === nodeId);
    if (!node) return 0;

    const incomingEdges = workflow.WorkFlowEdge.filter(
      (e) => e.targetId === nodeId
    );
    if (incomingEdges.length === 0) return baseTarget; // This is the start node

    // Calculate target from each incoming edge
    const targets = incomingEdges.map((edge) => {
      const parentTarget = calculateNodeTarget(edge.sourceId, new Set(visited));
      return parentTarget * edge.count;
    });

    // Return the maximum target from all incoming paths
    return Math.max(...targets);
  };

  let totalCompleted = 0;
  let totalTarget = 0;
  let totalEstimatedHours = 0;

  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const operationDetails = await Promise.all(
    workflow.WorkflowNode.map(async (node) => {
      const target = calculateNodeTarget(node.id);
      totalTarget += target;

      const deviceIds = await db.device
        .findMany({
          where: {
            planning: {
              commandProjectId: commandProjectId,
              operationId: node.operation.id,
            },
          },
          select: {
            deviceId: true,
          },
        })
        .then((devices) => devices.map((device) => device.deviceId));

      today.setHours(0, 0, 0, 0);

      const [totalCount, todayCount, lastWeekCount, lastMonthCount] =
        await Promise.all([
          db.operationRecord.aggregate({
            where: { deviceId: { in: deviceIds } },
            _sum: { count: true },
          }),
          db.operationRecord.aggregate({
            where: {
              deviceId: { in: deviceIds },
              createdAt: { gte: today },
            },
            _sum: { count: true },
          }),
          db.operationRecord.aggregate({
            where: {
              deviceId: { in: deviceIds },
              createdAt: { gte: lastWeek },
            },
            _sum: { count: true },
          }),
          db.operationRecord.aggregate({
            where: {
              deviceId: { in: deviceIds },
              createdAt: { gte: lastMonth },
            },
            _sum: { count: true },
          }),
        ]);

      const completedCount = totalCount._sum.count || 0;
      totalCompleted += completedCount;

      const progress = (completedCount / target) * 100;

      workflow.WorkflowNode.forEach((node) => {
        const nodeTarget = calculateNodeTarget(node.id);
        totalEstimatedHours += (node.operation.estimatedTime * nodeTarget) / 60;
      });

      return {
        id: node.operation.id,
        name: node.operation.name,
        progress: Math.min(progress, 100),
        target: target,
        completedCount: completedCount,
        todayCount: todayCount._sum.count || 0,
        lastWeekCount: lastWeekCount._sum.count || 0,
        lastMonthCount: lastMonthCount._sum.count || 0,
      };
    })
  );

  return {
    operationDetails,
    totalCompleted,
    totalTarget,
    weeklyProgress: {
      weeklyTarget,
      weeklyCompleted,
      hasSprint,
      hasFinalOperation,
    },
    totalEstimatedHours,
  };
}
