export const BASE_URL = 'http://gd2.mlb.com/components/game/mlb/';
export const INNINGS_FILE_PATH = 'inning/inning_all.xml';

export class MinMax {
  min: number;
  max: number;

  constructor() {
    this.min = undefined;
    this.max = undefined;
  }
}

export function assignMinMax(value: number, minMax: MinMax) {
  if (minMax.max === undefined || value > minMax.max) {
    minMax.max = value;
  }
  if (minMax.min === undefined || value < minMax.min) {
    minMax.min = value;
  }
}

export type GameJson = {
  game: Game
};

export type Game = {
  atBat: string,
  inning: Inning|Inning[]
};

export type Inning = {
  num: string,
  away_team: string,
  home_team: string,
  next: string,
  top: InningHalf,
  bottom: InningHalf
};

export type InningHalf = {
  atbat: AtBat|AtBat[]
};

export type AtBat = {
  num: string,
  b: string,
  s: string,
  o: string,
  start_tfs: string,
  start_tfs_zulu: string,
  end_tfs_zulu: string,
  batter: string,
  stand: string,
  b_height: string,
  pitcher: string,
  p_throws: string,
  des: string,
  event_num: string,
  event: string,
  play_guid: string,
  pitch: PitchJson|PitchJson[]
};

export type PitchJson = {
  des: string,
  id: string,
  type: string,
  code: string,
  tfs: string,
  tfs_zulu: string,
  x: string,
  y: string,
  event_num: string,
  sv_id: string,
  play_guid: string,
  start_speed: string,
  end_speed: string,
  sz_top: string,
  sz_bot: string,
  pfx_x: string,
  pfx_z: string,
  px: string,
  pz: string,
  x0: string,
  y0: string,
  z0: string,
  vx0: string,
  vy0: string,
  vz0: string,
  ax: string,
  ay: string,
  az: string,
  break_y: string,
  break_angle: string,
  break_length: string,
  pitch_type: string,
  type_confidence: string,
  zone: string,
  nasty: string,
  spin_dir: string,
  spin_rate: string,
};

export type Pitch = {
  des: string,
  id: number,
  type: string,
  code: string,
  tfs_zulu: string,
  x: number,
  y: number,
  start_speed: number,
  end_speed: number,
  sz_top: number,
  sz_bot: number,
  pfx_x: number,
  pfx_z: number,
  px: number,
  pz: number,
  x0: number,
  y0: number,
  z0: number,
  vx0: number,
  vy0: number,
  vz0: number,
  ax: number,
  ay: number,
  az: number,
  break_y: number,
  break_angle: number,
  break_length: number,
  pitch_type: string,
  pitch_code: number,
  type_confidence: number,
  zone: number,
  nasty: number,
  spin_dir: number,
  spin_rate: number,
  is_left_handed: number
};

export type SZData = {
  px: number,
  pz: number,
  sz_top: number,
  sz_bot: number,
  label: number
};

// tslint:disable-next-line:no-any
function isArray(thing: any): boolean {
  return thing !== undefined && thing !== null && Array.isArray(thing);
}

function toInt(str: string): number {
  return parseInt(str, 10);
}

function safeStr(str: string): string {
  return str.replace(/['"]+/g, '');
}

function pitchTypeToInt(type: string): number {
  if (type === 'FT') {  // Fastball 2-seam
    return 0;
  } else if (type === 'FF') {  // Fastball 4-seam
    return 1;
  } else if (type === 'FS') {  // Fastball sinker
    return 2;
  } else if (type === 'FC') {  // Fastball cutter
    return 3;
  } else if (type === 'SL') {  // Slider
    return 4;
  } else if (type === 'CH') {  // Changeup
    return 5;
  } else if (type === 'CB') {  // Curveball
    return 6;
    // } else if (type === 'KC') {  // Knuckle-curve
    //   return 7;
    // } else if (type === 'KN') {  // Knuckleball
    //   return 8;
    // } else if (type === 'EP') {  // Eephus
    //   return 9;
  } else {
    return -1;
  }
}

function convertPitchJson(json: PitchJson, isLefty: boolean): Pitch {
  // Sanity check some values
  if (json.start_speed === undefined || json.vx0 === undefined ||
      json.x0 === undefined) {
    return null;
  }

  // Ignore some pitch types
  let pitchType = json.pitch_type;
  // Pitchout:
  if (pitchType === 'FO' || pitchType === 'PO') {
    pitchType = 'PO';
  }
  // // Unidentified:
  // if (pitchType === 'UN' || pitchType === 'XX' || pitchType === 'AB' ||
  //     pitchType === 'SC' || pitchType === 'IN' || pitchType === 'FA') {
  //   return null;
  // }

  // Ignore Knucklecurve Knuckleball and Eephus for now
  // if (pitchType === 'KC' || pitchType === 'KN' || pitchType === 'EP') {
  //   return null;
  // }

  // Some pitch types are actually the same. Collapse as needed
  if (pitchType === 'SI') {
    pitchType = 'FS';
  }
  if (pitchType === 'CU') {
    pitchType = 'CB';
  }

  // Some pitches have bad type_confidence:
  const conf = parseFloat(json.type_confidence);
  // if (conf < 0.85) {
  //   return null;
  // }

  return {
    des: json.des,
    id: toInt(json.id),
    type: json.type,
    code: json.code,
    tfs_zulu: json.tfs_zulu,
    x: parseFloat(json.x),
    y: parseFloat(json.y),
    start_speed: parseFloat(json.start_speed),
    end_speed: parseFloat(json.end_speed),
    sz_top: parseFloat(json.sz_top),
    sz_bot: parseFloat(json.sz_bot),
    pfx_x: parseFloat(json.pfx_x),
    pfx_z: parseFloat(json.pfx_z),
    px: parseFloat(json.px),
    pz: parseFloat(json.pz),
    x0: parseFloat(json.x0),
    y0: parseFloat(json.y0),
    z0: parseFloat(json.z0),
    vx0: parseFloat(json.vx0),
    vy0: parseFloat(json.vy0),
    vz0: parseFloat(json.vz0),
    ax: parseFloat(json.ax),
    ay: parseFloat(json.ay),
    az: parseFloat(json.az),
    break_y: parseFloat(json.break_y),
    break_angle: parseFloat(json.break_angle),
    break_length: parseFloat(json.break_length),
    pitch_type: pitchType,
    pitch_code: pitchTypeToInt(pitchType),
    type_confidence: conf,
    zone: parseFloat(json.zone),
    nasty: parseFloat(json.nasty),
    spin_dir: parseFloat(json.spin_dir),
    spin_rate: parseFloat(json.spin_rate),
    is_left_handed: isLefty ? 1 : 0
  };
}

function convertPitchJsonArray(json: PitchJson[], isLefty: boolean): Pitch[] {
  const pitches = [] as Pitch[];
  for (let i = 0; i < json.length; i++) {
    const pitch = convertPitchJson(json[i], isLefty);
    if (pitch !== null) {
      pitches.push(pitch);
    }
  }
  return pitches;
}

function findAtBatPitches(atBat: AtBat): Pitch[] {
  if (atBat !== undefined) {
    const isLefty = atBat.p_throws.toUpperCase() === 'L';
    if (isArray(atBat.pitch)) {
      return convertPitchJsonArray(atBat.pitch as PitchJson[], isLefty);
    } else if (atBat.pitch !== undefined) {
      const pitch = convertPitchJson(atBat.pitch as PitchJson, isLefty);
      return pitch !== null ? [pitch] : [];
    }
  }
  return [] as Pitch[];
}

function findHalfInningPitches(halfInning: InningHalf): Pitch[] {
  let pitches = [] as Pitch[];
  if (halfInning !== undefined) {
    if (isArray(halfInning.atbat)) {
      (halfInning.atbat as AtBat[]).forEach((atbat) => {
        pitches = pitches.concat(findAtBatPitches(atbat));
      });
    } else {
      pitches = findAtBatPitches(halfInning.atbat as AtBat);
    }
  }
  return pitches;
}

function findInningsPitches(inning: Inning[]|Inning): Pitch[] {
  let pitches = [] as Pitch[];
  // Annoyingly, MLB data is stored as an object if the element has one item,
  // if it has more than one item it is an array.
  if (isArray(inning)) {
    (inning as Inning[]).forEach((curInning) => {
      pitches = pitches.concat(findHalfInningPitches(curInning.top));
      pitches = pitches.concat(findHalfInningPitches(curInning.bottom));
    });
  } else {
    pitches = pitches.concat(findHalfInningPitches((inning as Inning).top));
    pitches = pitches.concat(findHalfInningPitches((inning as Inning).bottom));
  }
  return pitches;
}

export function convertCsvToPitch(row: string): Pitch {
  const v = row.split(',');
  let i = 0;
  return {
    des: safeStr(v[i++]),
    id: toInt(v[i++]),
    type: safeStr(v[i++]),
    code: safeStr(v[i++]),
    tfs_zulu: safeStr(v[i++]),
    x: parseFloat(v[i++]),
    y: parseFloat(v[i++]),
    start_speed: parseFloat(v[i++]),
    end_speed: parseFloat(v[i++]),
    sz_top: parseFloat(v[i++]),
    sz_bot: parseFloat(v[i++]),
    pfx_x: parseFloat(v[i++]),
    pfx_z: parseFloat(v[i++]),
    px: parseFloat(v[i++]),
    pz: parseFloat(v[i++]),
    x0: parseFloat(v[i++]),
    y0: parseFloat(v[i++]),
    z0: parseFloat(v[i++]),
    vx0: parseFloat(v[i++]),
    vy0: parseFloat(v[i++]),
    vz0: parseFloat(v[i++]),
    ax: parseFloat(v[i++]),
    ay: parseFloat(v[i++]),
    az: parseFloat(v[i++]),
    break_y: parseFloat(v[i++]),
    break_angle: parseFloat(v[i++]),
    break_length: parseFloat(v[i++]),
    pitch_type: safeStr(v[i++]),
    pitch_code: toInt(v[i++]),
    type_confidence: parseFloat(v[i++]),
    zone: parseFloat(v[i++]),
    nasty: parseFloat(v[i++]),
    spin_dir: parseFloat(v[i++]),
    spin_rate: parseFloat(v[i++]),
    is_left_handed: toInt(v[i++])
  };
}

export function convertSZData(pitch: Pitch, isStrike: boolean): SZData {
  return {
    px: pitch.px,
    pz: pitch.pz,
    sz_top: pitch.sz_top,
    sz_bot: pitch.sz_bot,
    label: isStrike ? 0 : 1
  };
}

export function getGamePitches(gameJson: GameJson): Pitch[] {
  let pitches = [] as Pitch[];
  if (gameJson.game !== undefined && gameJson.game.inning !== undefined) {
    pitches = findInningsPitches(gameJson.game.inning);
  }
  return pitches;
}
