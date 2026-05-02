import { createLogger } from "@evaluation/logging-middleware";
import { fetchAllNotifications } from "./fetch-notifications.js";
import { topPriorityNotifications } from "./notification.js";

const log = createLogger("stage1-priority-inbox");

const TOP_N = 10;

async function main() {
  log.info("run:start", { topN: TOP_N });

  const token = process.env.EVALUATION_ACCESS_TOKEN;
  if (!token || !token.trim()) {
    log.error("config:missing_token", { env: "EVALUATION_ACCESS_TOKEN" });
    process.exitCode = 1;
    return;
  }

  try {
    const all = await fetchAllNotifications(token.trim());
    const top = topPriorityNotifications(all, TOP_N);

    log.info("priority:computed", {
      inputCount: all.length,
      outputCount: top.length,
    });

    const payload = { top_priority_notifications: top };
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    log.info("run:done", { emittedJson: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log.error("run:failed", { message });
    process.exitCode = 1;
  }
}

void main();
