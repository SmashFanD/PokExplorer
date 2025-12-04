import { SpeciesId } from "/src/enums/species-id.js";
import { AbilityId } from "/src/enums/ability-id.js";
//export const allAbilities: Ability[] = [];
//export const allMoves: Move[] = [];
export const allSpecies = {
  [SpeciesId.BULBASAUR]: { abilityId: AbilityId.OVERGROW, hp: 45, atk: 49, def: 49, spatk: 65, spdef: 45, spd: 45, exp: 64, posY: -5, sizeX: 12, sizeY: 10},
  [SpeciesId.IVYSAUR]: { abilityId: AbilityId.OVERGROW, hp: 60, atk: 62, def: 63, spatk: 80, spdef: 60, spd: 45, exp: 142, posY: -5, sizeX: 12, sizeY: 10 },
  [SpeciesId.VENUSAUR]: { abilityId: AbilityId.OVERGROW, hp: 80, atk: 82, def: 83, spatk: 100, spdef: 80, spd: 45, exp: 263, posY: -5, sizeX: 12, sizeY: 10 },
};