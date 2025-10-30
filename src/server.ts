import express, {
  NextFunction,
  Request,
  Response as ExpressResponse,
} from "express";
import { promises as fs } from "node:fs";
import path from "node:path";

const VALIDATION_URL = "https://schoolbaseapp.com/validate-name";
const USERS_PATH = path.resolve(__dirname, "../data/users.json");

const app = express();

app.get("/health", (_req: Request, res: ExpressResponse) => {
  res.json({ status: "ok" });
});

app.get(
  "/api/validate-users",
  async (_req: Request, res: ExpressResponse, next: NextFunction) => {
    try {
      const users = await loadUsers();
      for (const name of users) {
        await validateUser(name);
      }
      res.json({ validated: users.length });
    } catch (error) {
      next(error);
    }
  },
);

app.use(
  (
    error: unknown,
    _req: Request,
    res: ExpressResponse,
    _next: NextFunction,
  ) => {
    if (res.headersSent) {
      return;
    }
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while validating user names.";
    res.status(500).json({ error: message });
  },
);

// Only start the server if this file is run directly (not imported for testing)
if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

type RemoteResponse = {
  message?: string;
  name?: string;
};

async function loadUsers(): Promise<string[]> {
  const raw = await fs.readFile(USERS_PATH, "utf8");
  return JSON.parse(raw) as string[];
}

// This function cleans up names before sending them to the validation API
// The API rejects special characters like apostrophes and accents even though they're valid in real names
// So we strip them out while keeping letters and spaces
export function sanitizeName(name: string): string {
  return name
    .normalize("NFD") // break down accented characters into base + accent
    .replace(/[\u0300-\u036f]/g, "") // strip out the accent marks
    .replace(/[^a-zA-Z\s]/g, "") // remove anything that's not a letter or space
    .replace(/\s+/g, " ") // collapse multiple spaces into one
    .trim();
}

async function validateUser(name: string): Promise<void> {
  // Clean the name before sending to the API
  const sanitizedName = sanitizeName(name);
  const url = `${VALIDATION_URL}?name=${encodeURIComponent(sanitizedName)}`;
  
  let response: Response;
  try {
    response = await fetch(url);
  } catch (_error) {
    console.error(`${name} - Failed to reach validation service.`);
    process.exit(1);
  }

  const message = await extractMessage(response);
  if (response.status !== 200) {
    console.error(`${name} - ${message}`);
    process.exit(1);
  }
  console.log(`${name} - ${message}`);
}

async function extractMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as RemoteResponse;
    if (typeof payload?.message === "string") {
      return payload.message;
    }
  } catch (_error) {
    // Ignore JSON parse errors, they are handled below.
  }
  return `Received status ${response.status}`;
}

export { app };