import { CouldBePromise } from "src/type";
import { toReversePolish, toTokenStream, toCharacterStream } from "./compile";
import { VariableType, VariableTable } from "./compile/utils";


export const parser = (strings: TemplateStringsArray, ...keys: Array<VariableType>) => {
  return toReversePolish(
    toTokenStream(
      toCharacterStream(
        strings, keys,
      )
    )
  )
}
