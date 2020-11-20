/**
 * Modify environment variables
 */
import * as types from "./_types";
import * as core from "@actions/core";

import * as path from "path";
import * as conda from "./conda";

import * as constants from "./_constants";
import * as utils from "./_utils";

/**
 * Add Conda executable to PATH
 */
export async function setPathVariables(
  options: types.IDynamicOptions
): Promise<void> {
  const condaBin: string = path.join(conda.condaBasePath(options), "condabin");
  const condaPath: string = conda.condaBasePath(options);
  core.info(`Add "${condaBin}" to PATH`);
  core.addPath(condaBin);
  if (!options.useBundled) {
    core.info(`Set 'CONDA="${condaPath}"'`);
    core.exportVariable("CONDA", condaPath);
  }
}

/**
 * Ensure the conda cache path is available as a variable
 */
export async function setCacheVariable(options: types.IDynamicOptions) {
  const folder = utils.cacheFolder();
  await conda.condaCommand(["config", "--add", "pkgs_dirs", folder], options);
  core.exportVariable(constants.ENV_VAR_CONDA_PKGS, folder);
}