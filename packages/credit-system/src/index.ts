import { ApolloServer } from "@apollo/server";
import { getLogger } from "./utils/config";
import dotenv from "dotenv";
import { GraphQLError } from "graphql";
import { resolvers, typeDefs } from "./graph";
import { PrismaClient } from "@prisma/client";
import { MyContext } from "./utils/context";
import cors from "cors";
import express, { Request, Response } from "express";
import http from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { sendLarkMessage } from "./utils/lark";
import fs from "fs";

if (process.env.run_from == "third_party") {
} else {
  dotenv.config();
}
const logger = getLogger();
const client = new PrismaClient();

// define port from env named bind_port or default 4000.
const bind_port = process.env.bind_port || 4000;

const main = async () => {
  // dump current pid
  const pid_file = "./apollo-server.pid";
  fs.writeFileSync(pid_file, process.pid.toString());

  logger.debug("hello debug meesage! %s ", process.pid);

  const app = express();
  const httpServer = http.createServer(app);

  const corsOption = {
    origin: (_origin: any, callback: any) => {
      let allow = true;
      // console.log("origin", _origin);
      callback(null, allow);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
  };

  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  //   GET /api/getPoints?address=0xYourEVMAddress
  // Host: yourdomain.com
  // Content-Type: application/json

  // Response：
  // {
  //     "success": true,
  //     "data": {
  //         "address": "0xYourEVMAddress",
  //         "points": 1234
  //     }
  // }

  app.get("/api/getPoints", async (_req: Request, res: Response) => {
    const { address } = _req.query;
    if (address) {
      const summary = await client.pointSummary.findFirst({
        where: {
          address: (address as string).toLocaleLowerCase(),
        },
      });

      if (summary) {
        res.json({
          success: true,
          data: {
            address,
            points: summary.points,
          },
        });
      } else {
        res.status(404).json({
          success: false,
          error: "address not found",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: "address is required",
      });
    }
  });

  app.use(
    "/",
    cors(corsOption),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const headers: String[] = [];
        const userInfo = req.headers["x-auth-info"];
        for (const key in req.headers) {
          headers.push(`${key}: ${req.headers[key]}`);
        }

        if (userInfo === undefined || userInfo === "") {
          throw new GraphQLError("header x-auth-info is not found", {
            extensions: {
              code: "UNAUTHENTICATED",
              http: { status: 401 },
            },
          });
        }
        return { authScope: userInfo, client, headers };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: bind_port }, resolve)
  );
  logger.info(`🚀 Server ready at http://localhost:%s/`, bind_port);
  sendLarkMessage("ApolloServer  started ..");
};

main().catch((err) => {
  logger.error(err);
});
