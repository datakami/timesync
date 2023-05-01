// Copyright 2023 Datakami
//
// SPDX-License-Identifier: MIT

import { Toggl, Workspace } from "./Toggl.js"
import { DateTime, Interval, Settings as LuxonSettings } from "luxon"
import { Marvin } from "./Marvin.js"
import { xdgData, xdgConfig } from 'xdg-basedir';
import { mkdir, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'

LuxonSettings.throwOnInvalid = true;
declare module 'luxon' {
  interface TSSettings {
    throwOnInvalid: true;
  }
}

type Configuration = {
  toggl: string,
  marvin: string,
  marvinDB: string
};

async function inferConfig(): Promise<Configuration> {
  let files: Configuration
  if (!xdgData || !xdgConfig) {
    console.warn("xdg_data or xdg_config dir not found, defaulting to cwd")
    files = {
      toggl: process.cwd() + "toggl-api",
      marvin: process.cwd() + "marvin-credentials",
      marvinDB: process.cwd() + "db/"
    }
  } else {
    files = {
      toggl: xdgConfig + "/marvin-timesync/toggl-api",
      marvin: xdgConfig + "/marvin-timesync/marvin-credentials",
      marvinDB: xdgData + "/marvin-timesync/db/"
    }
  }
  await Promise.all([
    mkdir(dirname(files.toggl), { recursive: true} ),
    mkdir(dirname(files.marvin), { recursive: true} ),
    mkdir(files.marvinDB, { recursive: true } )
  ])
  return {
    toggl: (await readFile(files.toggl, 'utf8')).trim(),
    marvin: (await readFile(files.marvin, 'utf8')).trim(),
    marvinDB: files.marvinDB
  }
}

function dateToInterval(d: string = "today"): Interval {
  const now = DateTime.local()
  let retDate
  if (d == "today") {
    retDate = now.startOf('day')
  } else if (d == "yesterday") {
    retDate = now.startOf('day').minus({ days: 1 })
  } else {
    retDate = DateTime.fromISO(d)
  }
  return Interval.fromDateTimes(retDate.startOf('day'), retDate.endOf('day'))
}

function toRFC3339(d: DateTime): string {
  return d.set({ millisecond: 0 }).toUTC().toISO()
}

interface TogglTE {
  description: string,
  start: string,
  stop: string
}
async function apply_tasks_for_range(workspace: Workspace, interval: Interval, wanted_tes: TogglTE[]) {
  const existing_tes = await workspace.toggl.time_entries({
    start_date: toRFC3339(interval.start),
    end_date: toRFC3339(interval.end),
  })
  const existing_by_start: Map<number, typeof existing_tes[0]> = new Map()
  for (const existing of existing_tes)
    existing_by_start.set(DateTime.fromISO(existing.start).toMillis(), existing)

  for (const wanted of wanted_tes) {
    const matched = existing_by_start.get(DateTime.fromISO(wanted.start).toMillis())
    if (matched) {
      if (matched.description === wanted.description) {
        console.log("matched", wanted.description)
        continue
      } else {
        console.log("unmatched!", wanted, matched)
        continue
      }
    }
    console.log("posting", wanted)
    await workspace.post_time_entry(Object.assign({ created_with: "marvin-timesync" }, wanted))
  }
}

void (async function () {
  const config = await inferConfig()
  const interval = dateToInterval(process.argv.length > 2 ? process.argv[2] : 'today')

  const marvin = new Marvin(Marvin.parseCredentials(config.marvin), config.marvinDB + "marvin")
  const tasks = await (marvin.root.category('Datakami').then(datakami => datakami.tasksOverlapping(interval)))

  const toggl = new Toggl(config.toggl)
  const workspaces = await toggl.workspaces()
  if (workspaces.length !== 1) throw new Error("not sure which workspace to use")

  const res_tasks: TogglTE[] = []
  for (const task of tasks)
    for (const task_interval of task.timesInInterval(interval))
      res_tasks.push({
        description: `${task.title}`,
        start: toRFC3339(task_interval.start),
        stop: toRFC3339(task_interval.end)
      })

  await apply_tasks_for_range(workspaces[0], interval, res_tasks)
  
})()
