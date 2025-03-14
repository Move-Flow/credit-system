import "dotenv/config";
import crypto from "crypto";
import { exec } from "child_process";
import os from "os";
import { getLogger } from "./config";

const logger = getLogger();

const getSign = (timestamp: Number) => {
  const app_id = process.env.LARK_APP_ID;
  const string_to_sign = `${timestamp}\n${app_id}`;
  const hmac = crypto.createHmac(
    "sha256",
    process.env.LARK_APP_SECRET as string
  );

  hmac.update(string_to_sign);
  const hmacCode = hmac.digest();
  const sign = Buffer.from(hmacCode).toString("base64");
  return sign;
};

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export const sendLarkMessage = async (message: string) => {
  // if (process.env.is_debug == "true") {
  //   logger.warn("debug mode, skip send message to lark");
  //   return;
  // }
  // const now = Math.round(new Date().getTime() / 1000);
  // const sign = getSign(now);
  // const url = `https://open.larksuite.com/open-apis/bot/v2/hook/${process.env.LARK_APP_ID}?timestamp=${now}&sign=${sign}`;
  // const data = {
  //   msg_type: "text",
  //   content: {
  //     text: ` ${message}  [ ${new Date().toISOString()} ] FROM : ${os.hostname()}`,
  //   },
  // };
  // const res = await fetch(url, { method: "POST", body: JSON.stringify(data) });
  // const result = await res.json();
  // if (result.msg != "success") {
  //   logger.error("send message to lark failed ❌ ");
  //   throw new Error(result.msg);
  // } else {
  //   logger.info("send message to lark success 🚀 ");
  // }
};

export const execPromise = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
};

// const main = async () => {
//   await sendMessage("Hello, World!");
// };

// main();
