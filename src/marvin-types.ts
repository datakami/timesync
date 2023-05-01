// Copyright 2023 Datakami
//
// SPDX-License-Identifier: MIT

export interface Task {
  _id: string;
  createdAt: number;
  updatedAt: number;
  workedOnAt: number;
  title: string;
  parentId: string;
  dueDate: string | null;
  startDate: string | null;
  endDate: string | null;
  day: string;
  firstScheduled: string;
  plannedWeek: string;
  plannedMonth: string;
  sprintId: string | null;
  rank: number;
  masterRank: number;
  done: boolean;
  completedAt: number | null;
  duration: number;
  times: number[];
  firstTracked: number;
  doneAt: number;
  isReward: boolean;
  isStarred: boolean;
  isFrogged: boolean;
  isPinned: boolean;
  pinId: string;
  recurring: boolean;
  recurringTaskId: string;
  echo: boolean;
  echoId: string;
  link: string;
  subtasks: { [id: string]: Subtask };
  colorBar: string | null;
  labelIds: string[];
  timeEstimate: number;
  note: string;
  email: string;
  dailySection: string;
  bonusSection: string;
  customSection: string;
  timeBlockSection: string;
  dependsOn: { [id: string]: boolean };
  backburner: boolean;
  reviewDate: string;
  itemSnoozeTime: number;
  permaSnoozeTime: string;
  calId: string;
  calURL: string;
  etag: string;
  calData: string;
  generatedAt: number;
  echoedAt: number;
  deletedAt: number;
  restoredAt: number;
  onboard: boolean;
  imported: boolean;
  marvinPoints: number;
  mpNotes: string[];
  rewardPoints: number;
  rewardId: number;
  taskTime: string;
  reminderOffset: number;
  reminderTime: string;
  snooze: number;
  autoSnooze: number;
  g_in_GOALID: boolean;
  g_sec_GOALID: string;
  g_rank_GOALID: number;
  remindAt: string;
  reminder: {
    time: string;
    diff: number;
  };
}

export interface Subtask {
  _id: string;
  title: string;
  done: boolean;
  rank: number;
  timeEstimate: number;
}

interface Category {
  _id: string;
  title: string; // The category/project's title, like "Work".
  type: "project" | "category";
  updatedAt: number; // Date.now() when updated.  This includes adding a task.
  workedOnAt: number; // Date.now() when last worked on.  That means completing a task within it.
  parentId: string; // ID of parent project or category, or "unassigned" or "root".
  rank: number; // Sort rank within parent.
  dayRank: number; // Sort rank within day.
  day: string | null | undefined; // Schedule date or null/undefined. Only projects can be scheduled. This might also be "unassigned", so check for both. See https://github.com/amazingmarvin/MarvinAPI/issues/11
  firstScheduled: string | "unassigned"; // Which day the project was first assigned to, formatted as "YYYY-MM-DD" or "unassigned" if it was never scheduled yet. Used to calculate how many !!! in procrastination strategy.
  dueDate: string; // Date when project is due, formatted as "YYYY-MM-DD".
  labelIds: string[]; // The IDs of labels assigned to the Project.  Any labelId that doesn't correspond to an existing label in strategySettings.labels should be ignored.
  timeEstimate: number; // How long the user thinks the project will take, in ms. When shown in Marvin this is added to the child tasks' time estimates.
  startDate: string; // When this task can be started, formatted as "YYYY-MM-DD".
  endDate: string; // When this task should be completed (soft deadline), formatted as "YYYY-MM-DD".
  plannedWeek: string; // Which week the task is planned for. Date of the Monday of the week (Mon-Sun) "YYYY-MM-DD"
  plannedMonth: string; // Which month the task is planned for. "YYYY-MM"
  sprintId: string; // The project's sprint. Not used yet.
  done: boolean; // Whether the project has been marked as done.
  doneDate: string | undefined; // If done, then this was the date the project/subproject (previously called milestone) was finished.
  priority: "low" | "mid" | "high"; // Project only: one of "low", "mid", or "high". Used when priorities strategy is enabled. Why not isStarred like tasks? These used to be different strategies.
  color: string; // Color chosen by clicking icon in master list "#222222" (rrggbb).
  icon: string; // Icon chosen by clicking icon in master list.
  note: string; // note for "notes" strategy.
  recurring: boolean; // True if it's a recurring project.
  recurringTaskId: string; // ID of RecurringTask creator.
  echo: boolean; // True if created by RecurringTask with type="echo".
  isFrogged: boolean; // True if this project has been frogged for eatThatFrog. 1=normal, 2=baby, 3=monster.
  reviewDate: string; // Date when user wants to review a project.
  marvinPoints: number; // How many kudos you got for this project. Always 500.
  mpNotes: string[]; // Notes on how Marvin awarded you kudos when you completed the project. Always ["PROJECT"].
}

export type DBEntry = Task | Category

