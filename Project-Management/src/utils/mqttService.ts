import mqtt from "mqtt";
import { db } from "@/lib/db";
import { equal } from "assert";
var mqttClient: mqtt.MqttClient;
const mqttHost = `mqtt://${process.env.MQTT_HOST}:1883`;
let step: number = 0;
export function connectToBroker() {
  //TODO make this global variable
  const clientId = "client123";

  const options: {
    keepalive: number;
    clientId: string;
    protocolId: "MQTT" | "MQIsdp" | undefined;
    protocolVersion: 4 | 5 | 3 | undefined;
    clean: boolean;
    reconnectPeriod: number;
    connectTimeout: number;
    username: string;
    password: string;
  } = {
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
    console.log(topic, messageRecieved);
    await publishToDevice(deviceId);
  });
}
async function publishToDevice(deviceId: string) {
  const device = await db.device.findUnique({
    where: {
      deviceId: deviceId,
    },
    select: {
      count: true,
      // planning:{select:{operation:{select:{WorkflowNode:}}}}
    },
  });

  if (device && device.count) {
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

    step = opRecord * device.count;
    const topic: string = `rpc/${deviceId}`;
    const messageTopublish: string = `${step},ffc226,on,off`;
    console.log(messageTopublish, topic);

    mqttClient.publish(topic, messageTopublish, {});
  }
}
async function updateOperationHistory(
  planning_id: string,
  isOpFinal: string,
  command_id: string,
  project_id: string
) {
  try {
    const opHistoryId = await db.operationHistory.findFirst({
      where: {
        planningId: planning_id,
      },
    });
    if (opHistoryId) {
      const operationHistory = await db.operationHistory.update({
        where: {
          id: opHistoryId?.id,
        },
        data: {
          count: { increment: 1 },
        },
      });
      if (isOpFinal) {
        const commandProject = await db.commandProject.update({
          where: {
            commandId_projectId: {
              commandId: command_id,
              projectId: project_id,
            },
          },
          data: {
            done: { increment: 1 },
          },
        });
        console.log(commandProject);
      }
      // const operationHistory = await db.post.findMany({});
      console.log(operationHistory);
    } else {
      console.log("No matching operation history record found");
    }
  } catch (error) {
    console.error("Error updating operation history:", error);
  }
}

export function subscribeToTopic() {
  mqttClient.subscribe("post/#", { qos: 0 });
}
