"use client";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import mqtt from "mqtt";
import { IClientOptions } from "mqtt";
import {
  createOperationHistory,
  // updateOperationHistory,
} from "../../_utils/actions";

var mqttClient: any;
const mqttHost = "test.mosquitto.org:8081/mqtt";
const protocol = "wss";
const port = "1883";
function connectToBroker() {
  const clientId = "client" + Math.random().toString(36).substring(7);

  // Change this to point to your MQTT broker
  const hostURL = `${protocol}://${mqttHost}:${port}`;

  const options: IClientOptions = {
    keepalive: 60,
    clientId: clientId,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  };

  mqttClient = mqtt.connect(hostURL, options);

  mqttClient.on("error", (err: string) => {
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
  mqttClient.on("message", (topic: string, message: string, packet: string) => {
    console.log(
      "Received Message: " + message.toString() + "\nOn topic: " + topic,
    );
  });
}

function publishMessage(topic: string, message: string) {
  //   console.log(`Sending Topic: ${topic}, Message: ${message}`);
  mqttClient.publish(topic, message, {
    qos: 0,
    retain: false,
  });
}
interface UpdatePojectCountProps {
  command_project_id: string;
  post_id: string;
  operation_id: string;
  operator_id: string;
}
let count = 0;
export default function UpdatePojectCount({
  command_project_id,
  post_id,
  operation_id,
  operator_id,
}: UpdatePojectCountProps) {
  function handleClick() {
    count++;
    // updateOperationHistory(
    //   command_project_id,
    //   post_id,
    //   operation_id,
    //   operator_id,
    //   count,
    // );
    connectToBroker();
    // publish("myTopic", "Hello MQTT");
    publishMessage(
      "topic1",
      `${command_project_id} ${post_id} ${operator_id} ${operation_id} ${count}`,
    );
  }
  //   const { publish, subscribe } = useMQTTService({
  //     host: "mqtt://127.0.0.1:1883",
  //     messageCallback: (topic, message) => {
  //       console.log(
  //         `Received message from topic ${topic}: ${message.toString()}`,
  //       );
  //     },
  //   });
  //   useEffect(() => {
  //     subscribe("myTopic");

  //     // Example of publishing a message
  //     publish("myTopic", "Hello MQTT");
  //   }, [publish, subscribe]);
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-fit gap-2 bg-card py-1 font-normal"
      onClick={handleClick}
    >
      <span>Update</span>
    </Button>
  );
}
