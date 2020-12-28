import * as fs from "fs";

import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

import getHrefs from "get-hrefs";

import * as types from "../types";
import * as constants from "../constants";

import * as base from "./base";

/**
 * List available Miniforge versions
 *
 * @param arch
 */
async function miniforgeVersions(
  variant: string,
  osName: string,
  arch: string
): Promise<string[]> {
  try {
    let extension: string = constants.IS_UNIX ? "sh" : "exe";
    const downloadPath: string = await tc.downloadTool(
      constants.MINIFORGE_BASE_URL
    );
    const content: string = fs.readFileSync(downloadPath, "utf8");
    let hrefs = getHrefs(content).filter(
      (item) =>
        // Only grab real downloads
        item.startsWith(constants.MINIFORGE_HREF_PREFIX) &&
        // Ensure the correct variant
        item.match(`/${variant}-\d`) &&
        // Ensure the os, architecture and extension
        item.endsWith(`${osName}-${arch}.${extension}`)
    );
    return hrefs;
  } catch (err) {
    core.warning(err);
    return [];
  }
}

/**
 * Download specific Miniforge defined by variant, version and architecture
 */
export async function downloadMiniforge(
  inputs: types.IActionInputs,
  options: types.IDynamicOptions
): Promise<string> {
  // Check valid arch
  const arch = constants.ARCHITECTURES[inputs.architecture];

  if (!arch) {
    throw new Error(`Invalid 'architecture: ${inputs.architecture}'`);
  }

  const extension: string = constants.IS_UNIX ? "sh" : "exe";
  const osName: string = constants.OS_NAMES[process.platform];
  const inputVersion = inputs.miniforgeVersion.trim();

  let installerPath: string;

  if (inputVersion) {
    const installerName = [
      inputs.miniforgeVariant,
      inputs.miniforgeVersion,
      osName,
      `${arch}.${extension}`,
    ].join("-");
    installerPath = [
      constants.MINIFORGE_HREF_PREFIX,
      inputs.miniforgeVersion,
      installerName,
    ].join("/");
  } else {
    const versions = await miniforgeVersions(
      inputs.miniforgeVariant,
      osName,
      arch
    );
    if (!versions.length) {
      throw new Error(
        `Couldn't fetch Miniforge versions and 'miniforge-version' not provided`
      );
    }
    installerPath = versions[0];
  }

  core.info(installerPath);

  return await base.ensureLocalInstaller({
    url: `${constants.MINIFORGE_BASE_URL}${installerPath}`,
    tool: inputs.miniforgeVariant,
    version: inputs.miniforgeVersion,
    arch,
  });
}

/**
 * Provide a path to a Miniforge downloaded from github.com.
 *
 * ### Note
 * Uses the well-known structure of GitHub releases to resolve and download
 * a particular Miniforge installer.
 */
export const miniforgeDownloader: types.IInstallerProvider = {
  label: "download Minforge",
  provides: async (inputs, options) => {
    return inputs.miniforgeVariant !== "" && inputs.installerUrl === "";
  },
  installerPath: async (inputs, options) => {
    return {
      localInstallerPath: await downloadMiniforge(inputs, options),
      options: {
        ...options,
        useBundled: false,
        mambaInInstaller: inputs.miniforgeVariant
          .toLowerCase()
          .includes("mamba"),
      },
    };
  },
};
