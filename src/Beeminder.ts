export namespace API {
  export type CreateDatapoint = {
    value: number;
    timestamp?: number;
    daystamp?: string;
    comment?: string;
    requestid?: string;
  }
  export type Datapoint = Required<CreateDatapoint> & {
    id: string
    updated_at: number
  }
  export interface GetDatapoints {
    sort?: string;
    count?: number;
    page?: number;
    per?: number;
  }
  export type GoalType = 'hustler' | 'biker' | 'fatloser' | 'gainer' | 'inboxer' | 'drinker' | 'custom';
  export interface Goal {
    slug: string;
    updated_at: number;
    title: string;
    fineprint: string;
    yaxis: string;
    goaldate: number;
    goalval: number;
    rate: number;
    runits: string;
    svg_url: string;
    graph_url: string;
    thumb_url: string;
    autodata: string | null;
    goal_type: GoalType
    losedate: number | null;
    queued: boolean;
    secret: boolean;
    datapublic: boolean;
    datapoints: Datapoint[];
    numpts: number;
    pledge: number;
    initday: number;
    initval: number;
    curday: number;
    curval: number;
    lastday: number;
    yaw: -1 | 1;
    dir: -1 | 1;
    lane: number;
    mathishard: [number, number, number];
    headsum: string;
    limsum: string;
    kyoom: boolean;
    odom: boolean;
    aggday: 'min' | 'max' | 'mean';
    steppy: boolean;
    rosy: boolean;
    movingav: boolean;
    aura: boolean;
    frozen: boolean;
    won: boolean;
    lost: boolean;
    maxflux: number;
    contract: {
      amount: number;
      stepdown_at: number | null;
    };
    road: Array<[number | null, number | null, number | null]>;
    roadall: Array<[number, number, number | null]>;
    fullroad: Array<[number, number, number]>;
    rah: number;
    delta: number;
    delta_text: string;
    safebuf: number;
    safebump: number;
    id: string;
    callback_url: string;
    description: string;
    graphsum: string;
    lanewidth: number;
    deadline: number;
    leadtime: number;
    alertstart: number;
    plotall: boolean;
    last_datapoint: Datapoint;
    integery: boolean;
    gunits: string;
    hhmmformat: boolean;
    todayta: boolean;
    weekends_off: boolean;
    tmin: string;
    tmax: string;
    tags: string[];
  }
  export interface NewGoal {
    slug: string;
    title: string;
    goal_type: GoalType
    gunits: string;
    goaldate?: number | null;
    goalval?: number | null;
    rate?: number | null;
    initval?: number;
    secret?: boolean;
    datapublic?: boolean;
    datasource?: "api" | "ifttt" | "zapier" | string;
    dryrun?: boolean;
    tags?: string[];
  };
  export interface UpdateGoal {
    title?: string;
    yaxis?: string;
    tmin?: string; // date format "yyyy-mm-dd"
    tmax?: string; // date format "yyyy-mm-dd"
    secret?: boolean;
    datapublic?: boolean;
    roadall?: Array<[number | null, number, number | null]>; // array of arrays like [date::int, value::float, rate::float] each with exactly one field null
    datasource?: string; // one of {"api", "ifttt", "zapier", or clientname}. Default: none.
    tags?: Array<string>; // a list of tags for the goal
  }
}
export class Beeminder {
  token: string
  constructor(token: string) {
    this.token = token
  }
  async post_request(url: string, post_data: any, method: "POST" | "PUT" = "POST") {
    const response = await fetch("https://www.beeminder.com/api/v1/" + url + ".json", {
      method,
      body: JSON.stringify(Object.assign({}, post_data, { auth_token: this.token })),
      headers: { 'Content-Type': 'application/json' }
    })
    if (response.ok || response.status == 422) {
      return response.json()
    } else {
      throw [response.status, await response.text()]
    }
  }
  async get_request(url: string, params = {}) {
    const qs = new URLSearchParams(Object.assign({}, params, { auth_token: this.token }))
    const response = await fetch("https://www.beeminder.com/api/v1/" + url + ".json?" + qs.toString())
    if (response.ok || response.status == 422) {
      return response.json()
    } else {
      throw [response.status, await response.text()]
    }
  }
  user(user = "me") {
    return new User(this, user)
  }
  charge(amount: number, note: string, dryrun = true) {
    return this.post_request(`charges`, { amount, note, dryrun })
  }
}

export class User {
  b: Beeminder
  user: string
  constructor(b: Beeminder, user: string) {
    this.b = b
    this.user = user
  }
  info() {
    return this.b.get_request(`users/${this.user}`)
  }
  goals() {
    return this.b.get_request(`users/${this.user}/goals`)
  }
  goal(goal: string) {
    return new Goal(this.b, this.user, goal)
  }
  create_goal(params: API.NewGoal) {
    return this.b.post_request(`users/${this.user}/goals`, params, 'POST')
  }
}
export class Goal {
  b: Beeminder
  user: string
  goal: string
  prefix: string
  constructor(b: Beeminder, user: string, goal: string) {
    Object.assign(this, { b, user, goal })
    this.b = b
    this.user = user
    this.goal = goal
    this.prefix = `users/${this.user}/goals/${this.goal}`
  }
  info(): Promise<Goal> {
    return this.b.get_request(`${this.prefix}`)
  }
  update(params: API.UpdateGoal): Promise<Goal> {
    return this.b.post_request(`${this.prefix}`, params, 'PUT')
  }
  refresh_graph(): Promise<boolean> {
    return this.b.get_request(`${this.prefix}/refresh_graph`)
  }
  create_datapoint(params: API.CreateDatapoint): Promise<API.Datapoint> {
    return this.b.post_request(`${this.prefix}/datapoints`, params)
  }
  create_datapoints(params: API.CreateDatapoint[]): Promise<API.Datapoint[]> {
    return this.b.post_request(`${this.prefix}/datapoints/create_all`, params)
  }
  datapoints(params: API.GetDatapoints = {}): Promise<API.Datapoint[]> {
    return this.b.get_request(`${this.prefix}/datapoints`, params)
  }
  // todo: put, delete datapoint
}

module.exports = Beeminder
