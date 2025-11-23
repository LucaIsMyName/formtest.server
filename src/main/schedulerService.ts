import * as cron from "node-cron";
import { testScheduleQueries } from "./database";
import { createAndRunTest } from "./testExecutor";
import type { TestSchedule } from "../common/types";

class SchedulerService {
  private jobs: Map<number, cron.ScheduledTask> = new Map();

  constructor() {}

  /**
   * Initialize scheduler by loading all active jobs from database
   */
  public init() {
    console.log("Scheduler: Initializing...");
    const schedules = testScheduleQueries.getAll();
    console.log(`Scheduler: Found ${schedules.length} schedules`);

    for (const schedule of schedules) {
      if (schedule.isActive) {
        this.scheduleJob(schedule);
      }
    }
    console.log(`Scheduler: Started ${this.jobs.size} active jobs`);
  }

  /**
   * Schedule a new cron job
   */
  public scheduleJob(schedule: TestSchedule) {
    // Cancel existing job if any (e.g. on update)
    this.stopJob(schedule.id);

    if (!cron.validate(schedule.cronExpression)) {
      console.error(`Scheduler: Invalid cron expression for schedule ${schedule.id}: ${schedule.cronExpression}`);
      return;
    }

    console.log(`Scheduler: Scheduling job ${schedule.id} (${schedule.name}) with cron: ${schedule.cronExpression}`);

    const task = cron.schedule(schedule.cronExpression, async () => {
      console.log(`Scheduler: Executing job ${schedule.id} (${schedule.name})...`);
      try {
        await createAndRunTest(schedule.formId, schedule.paymentMethodId);
        
        // Update lastRun
        testScheduleQueries.update(schedule.id, { lastRun: new Date() });
        console.log(`Scheduler: Job ${schedule.id} execution initiated successfully`);
      } catch (error) {
        console.error(`Scheduler: Job ${schedule.id} failed to start:`, error);
      }
    });

    this.jobs.set(schedule.id, task);
  }

  /**
   * Stop a scheduled job
   */
  public stopJob(id: number) {
    const job = this.jobs.get(id);
    if (job) {
      job.stop();
      this.jobs.delete(id);
      console.log(`Scheduler: Stopped job ${id}`);
    }
  }

  /**
   * Reload a job (e.g. after update)
   */
  public reloadJob(id: number) {
    const schedule = testScheduleQueries.getById(id);
    if (schedule) {
      if (schedule.isActive) {
        this.scheduleJob(schedule);
      } else {
        this.stopJob(id);
      }
    }
  }
}

export const scheduler = new SchedulerService();
