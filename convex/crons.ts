import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Fire due reminders every minute (free-tier friendly: ~43k calls/month).
crons.interval("send due reminders", { minutes: 1 }, internal.reminders.sweep);

export default crons;
