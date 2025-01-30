// This is a Parcel glob import: https://parceljs.org/features/dependency-resolution/#glob-specifiers
// vite.config.ts replaces this import by loading `character_icons_vite.ts` instead.
import images from "../../../assets/icons/*.webp";
import { css } from "@emotion/react";
import { characterIdWithoutNumber, getCharacter } from "botc/roles";

function iconPath(id: string): string {
  id = characterIdWithoutNumber(id);
  return images[`Icon_${id}`];
}

export function characterIconPath(char: {
  id: string;
  roleType: string;
}): string {
  // fallback to role type for a generic icon
  return iconPath(char.id) ?? iconPath(char.roleType);
}

export function characterClass(character: { roleType: string }): string {
  switch (character.roleType) {
    case "townsfolk":
    case "outsider":
      return "good";
    case "minion":
    case "demon":
      return "evil";
    case "fabled":
      return "fabled";
    default:
      return "";
  }
}

const imgSize = "30px";

const iconStyle = {
  container: css`
    display: inline-block;
    width: ${imgSize};
    height: ${imgSize};
    overflow: hidden;
  `,
  img: css`
    height: 100%;
    width: 100%;
  `,
};

export function CharacterIconElement(props: {
  id: string;
  name?: string;
}): JSX.Element {
  const { id } = props;
  const char = getCharacter(id);
  const name = props.name || char.name;
  if (!iconPath(id) && !["minion", "demon"].includes(id)) {
    // warn that a fallback is being used
    console.warn(`no icon for ${id}`);
  }
  return (
    <div css={iconStyle.container}>
      <img
        css={iconStyle.img}
        src={characterIconPath(char)}
        alt={name}
        draggable={false}
      />
    </div>
  );
}
