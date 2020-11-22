import * as path from "path";

import * as core from "@actions/core";

import { minicondaPath } from "./conda";

/**
 * Add Conda executable to PATH
 */
export async function setVariables(useBundled: boolean): Promise<void> {
  // Set environment variables
  const condaBin: string = path.join(minicondaPath(useBundled), "condabin");
  const conda: string = minicondaPath(useBundled);
  core.info(`Add "${condaBin}" to PATH`);
  core.addPath(condaBin);
  if (!useBundled) {
    core.info(`Set 'CONDA="${conda}"'`);
    core.exportVariable("CONDA", conda);
  }
}
