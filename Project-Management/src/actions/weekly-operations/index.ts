"use server";

import { db } from "@/lib/db";

export interface WeeklyOperation {
  name: string;
  Total: number;
}

export async function getWeeklyOperations(
  commandProjectId: string
): Promise<WeeklyOperation[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);

  const devices = await db.device.findMany({
    where: {
      planning: {
        commandProjectId: commandProjectId,
      },
    },
    select: {
      deviceId: true,
    },
  });
  const deviceIds = devices.map((device) => device.deviceId);

  const operationRecords = await db.operationRecord.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      deviceId: {
        in: deviceIds,
      },
    },
    select: {
      count: true,
      createdAt: true,
    },
  });

  const dailyOperations = operationRecords.reduce(
    (acc, record) => {
      const date = record.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + (record.count || 1);
      return acc;
    },
    {} as Record<string, number>
  );

  const result: WeeklyOperation[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = currentDate.toISOString().split("T")[0];
    const dayName = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    result.push({
      name: dayName,
      Total: dailyOperations[dateString] || 0,
    });
  }

  return result;
}
export interface HourlyOperation {
  hour: number;
  Total: number;
}

export async function getHourlyOperations(
  commandProjectId: string
): Promise<HourlyOperation[]> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);

  const devices = await db.device.findMany({
    where: {
      planning: {
        commandProjectId: commandProjectId,
      },
    },
    select: {
      deviceId: true,
    },
  });
  const deviceIds = devices.map((device) => device.deviceId);

  const operationRecords = await db.operationRecord.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      deviceId: {
        in: deviceIds,
      },
    },
    select: {
      count: true,
      createdAt: true,
    },
  });

  const hourlyOperations = operationRecords.reduce(
    (acc, record) => {
      const hour = new Date(record.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + (record.count || 1);
      return acc;
    },
    {} as Record<number, number>
  );

  const result: HourlyOperation[] = [];
  for (let i = 0; i < 24; i++) {
    result.push({
      hour: i,
      Total: hourlyOperations[i] || 0,
    });
  }

  return result;
}
export async function getHourlyOperation(
  commandProjectId: string
): Promise<HourlyOperation[]> {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // Définir à 23:59:59.999
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0); // Définir à 00:00:00.000

  const devices = await db.device.findMany({
    where: {
      planning: {
        commandProjectId: commandProjectId,
      },
    },
    select: {
      deviceId: true,
    },
  });
  const deviceIds = devices.map((device) => device.deviceId);

  const operationRecords = await db.operationRecord.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      deviceId: {
        in: deviceIds,
      },
    },
    select: {
      count: true,
      createdAt: true,
    },
  });

  const hourlyOperations = operationRecords.reduce(
    (acc, record) => {
      const hour = new Date(record.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + (record.count || 1);
      return acc;
    },
    {} as Record<number, number>
  );

  const result: HourlyOperation[] = [];
  for (let i = 0; i < 24; i++) {
    result.push({
      hour: i,
      Total: hourlyOperations[i] || 0,
    });
  }

  return result;
}
