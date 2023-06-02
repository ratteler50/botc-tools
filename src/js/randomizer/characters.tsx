import React, { useContext } from "react";
import { CharacterInfo, RoleType } from "../botc/roles";
import { Columns } from "./columns";
import classnames from "classnames";
import { iconPath } from "../views";
import { CharacterContext } from "./character_context";

function RoleLabel(props: { roleType: string }): JSX.Element {
  var letter = props.roleType.charAt(0).toUpperCase();
  return <span className='role-label'>{letter}</span>;
}

export function CharacterIconElement(props: {
  name: string,
  id: string
}): JSX.Element {
  let { id } = props;
  if (!iconPath(id)) {
    return <></>;
  }
  return <div className="img-container">
    <img className="char-icon"
      src={iconPath(id)} alt={props.name} />
  </div>;
}

// like CharacterInfo but not a class
export interface CardInfo {
  id: string;
  name: string;
  good: boolean;
  roleType: RoleType,
}

export function CharacterCard(props: {
  character: CardInfo,
  onClick?: React.MouseEventHandler<HTMLElement>,
  selected: boolean
}): JSX.Element {
  let { character } = props;
  let { roleType } = character;
  let needsLabel = ["outsider", "minion"].includes(roleType);
  return <div
    className={classnames(
      character.good ? "good" : "evil",
      "character",
      { "selected": props.selected })}
    onClick={props.onClick}>
    {needsLabel && <RoleLabel roleType={roleType} />}
    <CharacterIconElement {...character} />
    <span className='name'>{character.name}</span>
  </div>;
}

export type Selection = Set<string>;

export type SelAction =
  {
    type: "toggle",
    id: string,
  } | {
    type: "set all",
    ids: string[],
  } | {
    type: "clear",
  }

export function selectionReducer(selection: Selection, action: SelAction): Selection {
  var newSelection = new Set(selection);
  switch (action.type) {
    case "toggle": {
      if (newSelection.has(action.id)) {
        newSelection.delete(action.id);
      } else {
        newSelection.add(action.id);
      }
      return newSelection;
    }
    case "set all": {
      return new Set(action.ids);
    }
    case "clear": {
      return new Set();
    }
  }
}

interface SelectionVar {
  selection: Selection,
  dispatch: (a: SelAction) => void,
}

export function CharacterSelection(props: SelectionVar): JSX.Element {
  const chars = useContext(CharacterContext);
  let { selection, dispatch } = props;

  return <div>
    {["townsfolk", "outsider", "minion", "demon"].map(roleType =>
      <div className="characters" key={`${roleType}-roles`}>
        <Columns numColumns={2}>
          {chars.filter(char => char.roleType == roleType).map(char =>
            <CharacterCard
              character={char}
              key={char.id}
              selected={selection.has(char.id)}
              onClick={() => dispatch({ type: "toggle", id: char.id })} />
          )}
        </Columns>
      </div>
    )}
  </div>;
}
