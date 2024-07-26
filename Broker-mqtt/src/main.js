import mqtt from "mqtt";
import { PrismaClient } from "@prisma/client";

var mqttClient;
const db = new PrismaClient();
const mqttHost = "mqtt://192.168.10.232:1883";
const clientId = "PickToLight";
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
    username: "PickToLight",
    password: "PickToLight",
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
    console.log("Client connected:" + clientId);
  });

  // Received Message
  mqttClient.on("message", async (topic, message, packet) => {
    const deviceId = topic.split("/")[1];
    const messageRecieved = message.toString();
    console.log("recieved from", topic, "message", messageRecieved);
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
    const workflowNode = device?.planning?.operation.WorkflowNode?.filter(
      (wfNode) =>
        wfNode.workFlowId === device.planning.commandProject.project.workFlowId
    )[0];
    const sumOperationTarget = workflowNode?.targetEdges?.reduce(
      (acc, edge) => {
        return acc + edge.count; // Replace 'count' with the appropriate property you want to sum
      },
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
    } else
      beeper =
        totalOpRecord * device.count == sumOperationTarget ? "on" : "off";

    step = opRecord * device.count;
    const topic = `rpc/${deviceId}`;
    const messageTopublish = `${step},ffc226,${beeper},${beeper}`;
    console.log(messageTopublish, topic);

    mqttClient.publish(topic, messageTopublish, {});
  }
}

export function subscribeToTopic() {
  mqttClient.subscribe("post/#", { qos: 0 });
}

connectToBroker();
subscribeToTopic();
