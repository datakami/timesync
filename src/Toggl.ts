import { readFileSync } from "node:fs"
import { Buffer } from "node:buffer"
import type * as Toggl_types from "./toggl-types.js"

function base64_encode(str: string): string {
  return Buffer.from(str).toString("base64")
}

export namespace API {
  export namespace Request.GET {
    export interface Me {
      with_related_data?: boolean
    }
    export interface Workspaces {
      since?: number
    }
    export interface TimeEntries {
      since?: number;
      before?: string;
      start_date?: string;
      end_date?: string;
    };
  }
  export namespace Request.POST {
    export interface TimeEntry extends Toggl_types.TimeEntryBase {
      created_with: string;
      start_date?: string;
      tag_action?: 'add' | 'delete';
    }
  }
  export namespace Response {
    export type Workspaces = Toggl_types.Workspace[]
  }
}

import Req = API.Request
import Res = API.Response

export class Toggl {
  constructor(private readonly api_token: string=readFileSync("toggl-api", "utf8").trim()) {
    this.api_token = api_token
  }
  async parseResponse(response: Awaited<ReturnType<typeof fetch>>) {
    if (response.ok) {
      if (response.headers.get('content-type')?.startsWith("application/json")) {
        return response.json()
      }
      return response.text()
    } else {
      throw [response.status, await response.text()]
    }
  }
  get(url: string, query: any={}) {
    return fetch(`https://api.track.toggl.com/api/v9/${url}?${new URLSearchParams(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${base64_encode(this.api_token + ":api_token")}`
      },
    }).then(resp => this.parseResponse(resp))
  }
  async post(url: string, body: any={}) {
    return fetch(`https://api.track.toggl.com/api/v9/${url}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${base64_encode(this.api_token + ":api_token")}`
      },
    }).then(resp => this.parseResponse(resp))
  }
  async me(query:API.Request.GET.Me={}): Promise<Toggl_types.Me> {
    return this.get("me", query)
  }
  async workspaces(query: Req.GET.Workspaces={}): Promise<Workspace[]> {
    const ws = (await this.get("me/workspaces", query)) as Res.Workspaces
    return ws.map(x => new Workspace(this, x))
  }
  async time_entries(query: Req.GET.TimeEntries={}): Promise<Toggl_types.TimeEntry[]> {
    return this.get("me/time_entries", query)
  }
  async post_time_entry(workspace_id: number, query: Omit<Req.POST.TimeEntry, "workspace_id">): Promise<Toggl_types.TimeEntry> {
    const q2: Req.POST.TimeEntry = Object.assign({ workspace_id }, query)
    return this.post("workspaces/" + workspace_id + "/time_entries", q2)
  }
}
export class Workspace {
  constructor(public readonly toggl: Toggl, public readonly workspace: Toggl_types.Workspace) {}

  async post_time_entry(query: Omit<Req.POST.TimeEntry, "workspace_id">): Promise<Toggl_types.TimeEntry> {
    const workspace_id = this.workspace.id
    const q2: Req.POST.TimeEntry = Object.assign({ workspace_id }, query)
    return this.toggl.post("workspaces/" + workspace_id + "/time_entries", q2)
  }
}
