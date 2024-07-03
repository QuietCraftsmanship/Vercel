import { CommandOption, PrimitiveConstructor } from '../commands/help';

export type Flags<T extends CommandOption[]> =
  | `--${T[number]['name']}`
  | `-${T[number]['shorthand']}`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FlagValue<T extends string> = T extends `--${infer _}`
  ? PrimitiveConstructor | [PrimitiveConstructor]
  : string;

export function getFlagsSpecification<T extends CommandOption[]>(options: T) {
  const flagsSpecification: {
    [k in Flags<T>]?: FlagValue<k>;
  } = {};

  for (const option of options) {
    flagsSpecification[`--${option.name}` as Flags<T>] =
      option.type as FlagValue<Flags<T>>;
    if (option.shorthand) {
      flagsSpecification[`-${option.shorthand}` as Flags<T>] =
        `--${option.name}` as FlagValue<Flags<T>>;
    }
  }

  return flagsSpecification as {
    [k in Flags<T>]: FlagValue<k>;
  };
}
