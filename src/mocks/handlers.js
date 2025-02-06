import { rest } from "msw";

export const handlers = [
  // Mock API endpoints
  rest.post("/api/videos/transcript", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: "Mocked transcript data",
      })
    );
  }),

  rest.post("/api/videos/upload", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: "Mocked upload response",
      })
    );
  }),

  rest.post("/api/ai/summary", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: "Mocked summary data",
      })
    );
  }),
];
