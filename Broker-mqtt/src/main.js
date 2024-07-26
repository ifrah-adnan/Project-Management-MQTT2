import mqtt from "mqtt";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

var mqttClient;
const db = new PrismaClient();
const mqttHost = process.env.MQTT_HOST;
const clientId = process.env.MQTT_CLIENT_ID;
let step = 0;
let beeper = "off";
let status = "ACTIVE";

export function connectToBroker() {
  const options = {
    keepalive: 120,
    clientId: clientId,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  };

  mqttClient = mqtt.connect(mqttHost, options);
  mqttClient.on("error", (err) => {
    console.log("Error: ", err);
    mqttClient.end();
  });

  mqttClient.on("reconnect", () => {
    console.log("Reconnecting...");
  });

  mqttClient.on("connect", () => {
    console.log("Client connected: " + clientId);
  });

  // Received Message
  mqttClient.on("message", async (topic, message, packet) => {
    const deviceId = topic.split("/")[1];
    const messageReceived = message.toString();
    console.log("Received from", topic, "message", messageReceived);
    await publishToDevice(deviceId);
  });
}

async function publishToDevice(deviceId) {
  const device = await db.device.findUnique({
    where: {
      deviceId: deviceId,
    },
    select: {
      count: true,
      planning: {
        select: {
          operation: {
            select: {
              id: true,
              isFinal: true,
              WorkflowNode: {
                select: {
                  workFlowId: true,
                  operationId: true,
                  targetEdges: { select: { count: true } },
                },
              },
            },
          },
          commandProject: {
            select: {
              project: { select: { workFlowId: true } },
              id: true,
              done: true,
              target: true,
            },
          },
        },
      },
    },
  });

  if (device && device.count && device.planning) {
    const workflowNode = device.planning.operation.WorkflowNode.filter(
      (wfNode) =>
        wfNode.workFlowId === device.planning.commandProject.project.workFlowId
    )[0];
    const sumOperationTarget = workflowNode.targetEdges.reduce(
      (acc, edge) => acc + edge.count,
      0
    );

    await db.operationRecord.create({
      data: {
        deviceId: deviceId,
        count: +device.count,
      },
    });

    const today = new Date();
    today.setHours(0);

    const opRecord = await db.operationRecord.count({
      where: { deviceId: deviceId, createdAt: { gte: today } },
    });

    const totalOpRecord = await db.operationRecord.count({
      where: { deviceId: deviceId },
    });

    if (device.planning.operation.isFinal) {
      if (
        device.planning.commandProject.target ==
        totalOpRecord * device.count
      ) {
        status = "COMPLETED";
        beeper = "on";
      } else {
        beeper = "off";
      }

      await db.commandProject.update({
        where: { id: device.planning.commandProject.id },
        data: {
          done: device.planning.commandProject.done + 1,
          status: status,
        },
      });
    } else {
      beeper =
        totalOpRecord * device.count == sumOperationTarget ? "on" : "off";
    }

    step = opRecord * device.count;
    const topic = `rpc/${deviceId}`;
    const messageToPublish = `${step},ffc226,${beeper},${beeper}`;
    console.log(messageToPublish, topic);

    mqttClient.publish(topic, messageToPublish, {});
  }
}

export function subscribeToTopic() {
  mqttClient.subscribe("post/#", { qos: 0 });
}

connectToBroker();
subscribeToTopic();
