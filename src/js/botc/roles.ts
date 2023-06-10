/* Script Tool roles
 *
 * Provides roleType but not abilities (these are in images which are assembled
 * to form the script PDF).
 *
 * Official characters from https://script.bloodontheclocktower.com/
 * clocktower.online (old online website) roles
 *
 * Unofficial, but quite up-to-date. Has abilities and storyteller instructions
 * ("reminders") for first and other nights. The reminder text is unofficial;
 * the wiki has detailed "how to run" instructions but not concise ones suitable
 * for a night sheet. There are also night orderings here, but they're ignored
 * in favor of the official script tool.
 */
import botc_roles from "../../../assets/data/botc_online_roles.json";

/* Script Tool "night sheet"
 *
 * Gives a global ordering for all characters, for first night and other nights.
 */
import nightsheet from "../../../assets/data/nightsheet.json";
import script_roles from "../../../assets/data/roles.json";

/* Custom overrides provided by this app. Most of these are simplifications to
 * the night sheet to surface more important instructions, but this also
 * includes fabled abilities which are otherwise not available anywhere.
 */
import { overrides } from "./overrides";

interface NightAction {
  details: string;
  index: number;
}

const RoleTypes = [
  "townsfolk",
  "outsider",
  "minion",
  "demon",
  "fabled",
  "travellers",
] as const;
export type RoleType = (typeof RoleTypes)[number];

const Editions = ["tb", "snv", "bmr", "other"] as const;
export type Edition = (typeof Editions)[number];

export class CharacterInfo {
  readonly id: string;
  readonly name: string;
  readonly roleType: RoleType;
  readonly edition: Edition;
  ability: string | null;

  firstNight: NightAction | null;
  otherNights: NightAction | null;

  constructor(id: string, name: string, roleType: RoleType, edition: Edition) {
    this.id = id;
    this.name = name;
    this.roleType = roleType;
    this.edition = edition;
    this.ability = null;
    this.firstNight = null;
    this.otherNights = null;
  }

  get good(): boolean {
    return ["townsfolk", "outsider"].includes(this.roleType);
  }

  get evil(): boolean {
    return ["minion", "demon"].includes(this.roleType);
  }

  get special(): boolean {
    return ["travellers", "fabled"].includes(this.roleType);
  }

  nightDetails(firstNight: boolean): NightAction | null {
    if (firstNight) {
      return this.firstNight;
    }
    return this.otherNights;
  }
}

export const MinionInfo: CharacterInfo = new CharacterInfo(
  "MINION",
  "Minion Info",
  "minion",
  "other"
);
MinionInfo.firstNight = {
  details:
    "If there are 7 or more players: Wake all Minions. Show the THIS IS THE DEMON token. Point to the Demon.",
  index: nightsheet.firstNight.indexOf("MINION"),
};

export const DemonInfo: CharacterInfo = new CharacterInfo(
  "DEMON",
  "Demon Info",
  "demon",
  "other"
);
DemonInfo.firstNight = {
  details: `If there are 7 or more players: Wake the Demon.
  Show the THESE ARE YOUR MINIONS token. Point to all Minions.
  Show THESE CHARACTERS ARE NOT IN PLAY and three bluffs.`,
  index: nightsheet.firstNight.indexOf("DEMON"),
};

export function nameToId(name: string): string {
  return name.toLowerCase().replaceAll(/[ '-_]/g, "");
}

function versionToEdition(version: string): Edition {
  if (version == "1 - Trouble Brewing") {
    return "tb";
  } else if (version == "2 - Bad Moon Rising") {
    return "bmr";
  } else if (version == "3 - Sects and Violets") {
    return "snv";
  }
  return "other";
}

function createRoleData(): Map<string, CharacterInfo> {
  const roles: Map<string, CharacterInfo> = new Map();

  for (const role of script_roles) {
    const id = nameToId(role.id);
    const name: string = role.name;
    const roleType = role.roleType;
    const validRole = RoleTypes.find((r) => r == roleType);
    if (validRole) {
      const info = new CharacterInfo(
        id,
        name,
        validRole,
        versionToEdition(role.version)
      );
      roles.set(id, info);
    } else {
      console.warn(`invalid role ${roleType} for ${id}`);
    }
  }

  for (const role of botc_roles) {
    const id = role.id;
    const info = roles.get(id);
    if (info === undefined) {
      // a character in the online tool but not known to the script tool -
      // applies to Mephit (which was renamed)
      continue;
    }

    info.ability = overrides.ability(id) ?? role.ability;

    if (role.firstNightReminder != "") {
      const index = nightsheet.firstNight.indexOf(info.name);
      if (index < 0 && info.roleType != "travellers") {
        console.warn(`${id} not found in night sheet`);
      }
      info.firstNight = {
        details: overrides.firstNight(id) ?? role.firstNightReminder,
        index,
      };
    }
    if (role.otherNightReminder != "") {
      const index = nightsheet.otherNight.indexOf(info.name);
      if (index < 0 && info.roleType != "travellers") {
        console.warn(`${id} not found in night sheet`);
      }
      info.otherNights = {
        details: overrides.otherNights(id) ?? role.otherNightReminder,
        index,
      };
    }
  }

  for (const id of Object.keys(overrides.all)) {
    if (botc_roles.find((c) => c.id == id) === undefined) {
      // an override for a character not in Clocktower Online
      const info = roles.get(id);
      if (info === undefined) {
        console.error(`override info for unknown id ${id} `);
        continue;
      }
      info.ability = overrides.get(id).ability ?? info.ability;
    }
  }

  roles.set("MINION", MinionInfo);
  roles.set("DEMON", DemonInfo);

  return roles;
}

export const roles = createRoleData();

export function getCharacter(id: string): CharacterInfo {
  const c = roles.get(id);
  if (!c) {
    throw new Error(`unknown character ${id}`);
  }
  return c;
}
