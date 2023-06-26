// Copyright 2023 Datakami
//
// SPDX-License-Identifier: MIT

import { readFileSync } from "node:fs"
import { DateTime, Interval, Duration } from "luxon"
import { inspect } from "node:util"
import { DurationUtil } from "./util.js"

import PouchDB from "pouchdb"
import pouchdb_find from "pouchdb-find"
PouchDB.plugin(pouchdb_find)

import type * as Marvin_types from "./marvin-types.js"
import type InspectOptions from "node:util"


interface Credentials {
  apiToken: string
  fullAccessToken: string
  syncServer: string
  syncDatabase: string
  syncUser: string
  syncPassword: string
}

export class Marvin {
  remote: PouchDB.Database
  db: PouchDB.Database
  synced: Promise<PouchDB.Find.CreateIndexResponse<{}>>
  root: Taskset
  constructor(public credentials: Credentials=Marvin.parseCredentials(), dbName = "marvin") {
    const c = credentials
    let u = new URL(c.syncServer)
    Object.assign(u, {
      username: c.syncUser,
      password: c.syncPassword,
      pathname: "/" + c.syncDatabase
    })
    this.remote = new PouchDB(u.href)
    this.db = new PouchDB(dbName)
    this.synced = new Promise((resolve, reject) => {
      console.log("syncing..")
      this.remote.replicate.to(this.db)
        .on('complete', resolve)
        .on('error', reject)
    }).then(() => {
      return this.db.createIndex({
        index: {
          fields: ["db", "parentId"]
        }
      })
    })
    this.synced.then(() => {
      console.log("sync complete!")
    })
    this.root = new Taskset(this, 'root', null)
  }
  async api(url: string, data: any=null) {
    const response = await fetch("https://serv.amazingmarvin.com/api/" + url, {
      method: data ? "POST" : "GET",
      body: data ? JSON.stringify(data) : null,
      headers: {
        "X-API-Token": this.credentials.apiToken,
        'Content-Type': 'application/json',
        "Accept": "application/json"
        // todo: full access token
      }
    })
    if (response.ok) {
      if (response.headers.get('content-type')?.startsWith("application/json")) {
        return response.json()
      }
      return response.text()
    } else {
      throw new Error(`got http ${response.status}: ${await response.text()}`)
    }
  }
  async test() {
    // todo: throw?
    return (await this.api("test", {})) == "OK"
  }
  trackedItem() {
    // todo: wrap in Task?
    return this.api("trackedItem")
  }
  todayItems() {
    return this.api("todayItems")
  }
  dueItems() {
    return this.api("dueItems")
  }
  categories() {
    return this.api("categories")
  }
  labels() {
    return this.api("labels")
  }
  me() {
    return this.api("me")
  }
  trackInfo(taskIds: string[]) {
    return this.api("tracks", { taskIds })
  }

  static parseCredentials(fileContents = readFileSync("credentials", "utf8")): Credentials {
    const res: Record<string, string> = {}
    for(const line of fileContents.split('\n')) {
      if (line.startsWith('# ') || !line) continue
      const [k,v] = line.split(': ', 2)
      res[k] = v
    }
    return res as unknown as Credentials
  }
}

type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;
function chunk<A, N extends number>(xs: A[], n: N): Array<Tuple<A, N>> {
  if ((xs.length % n) != 0) console.error("wrong chunk length")
  const res = new Array(xs.length / n)
  for(let i = 0; i < xs.length; i += n) {
    res[i/n] = xs.slice(i, i+n)
  }
  return res
}

function toInterval([start, end]: [number, number]): Interval {
  return Interval.fromDateTimes(DateTime.fromMillis(start), DateTime.fromMillis(end))
}

class Task {
  title: string
  day: string
  dueDate: string | null
  done: boolean
  doneAt: DateTime | null
  createdAt: DateTime
  times: Interval[]
  constructor(public _task: Marvin_types.Task) {
    this.title = _task.title
    this.day = _task.day
    this.dueDate = _task.dueDate
    this.done = !!_task.done
    this.doneAt = _task.doneAt ? DateTime.fromMillis(_task.doneAt) : null
    this.createdAt = DateTime.fromMillis(_task.createdAt)
    this.times = _task.times ? chunk(_task.times, 2).map(toInterval) : []
  }
  timesInInterval(interval: Interval): Interval[] {
    return this.times.map(time => time.intersection(interval)).filter(x => x !== null) as Interval[]
  }
  timeSpentOn(interval: Interval): Duration {
    return DurationUtil.sum(this.timesInInterval(interval).map(x => x.toDuration()))
  }
  [inspect.custom](_depth: number, _opts: InspectOptions.InspectOptions) {
    return {
      title: this.title,
      day: this.day,
      dueDate: this.dueDate,
      done: this.done,
      doneAt: this.doneAt ? this.doneAt.toISO() : null,
      createdAt: this.createdAt.toISO(),
      times: this.times
    }
  }
}

class Taskset {
  constructor(public marv: Marvin, public _id: string, rest: Marvin_types.DBEntry | null) {
    Object.assign(this, rest)
  }
  async category(n: string): Promise<Taskset> {
    await this.marv.synced
    const d = await this.marv.db.find({
      selector: {
        db: "Categories",
        title: n,
        parentId: this._id
      }
    })
    if (d && d.docs) return new Taskset(this.marv, d.docs[0]._id, d.docs[0] as unknown as Marvin_types.DBEntry)
    throw new Error("category not found")
  }
  async tasks(): Promise<Task[]> {
    await this.marv.synced
    const d = await this.marv.db.find({
      selector: {
        db: "Tasks",
        parentId: this._id
      },
    })
    if (d) {
      return d.docs.map(x => new Task(x as unknown as Marvin_types.Task))
    }
    return []
  }
  async tasksOverlapping(interval: Interval): Promise<Task[]> {
    const tasks = await this.tasks()
    return tasks.filter(task =>
      task.times.some(x => x.overlaps(interval))
    )
  }
}

