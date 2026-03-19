// This file is auto-generated. Do not edit manually.
import { Actor } from "@icp-sdk/core/agent";
import type { HttpAgentOptions } from "@icp-sdk/core/agent";
import { idlFactory } from "./declarations/backend.did.js";
import type { backendInterface } from "./backend.d";

export type { backendInterface } from "./backend.d";
export type { LeaderboardEntry, PlayerStats, RoomState } from "./backend.d";
export { Type, Type__1 } from "./backend.d";

export interface CreateActorOptions {
  agentOptions?: HttpAgentOptions;
  agent?: any;
  processError?: (e: unknown) => never;
}

export class ExternalBlob {
  private _bytes: Uint8Array | null = null;
  private _url: string | null = null;
  public onProgress?: (percentage: number) => void;

  constructor(bytes?: Uint8Array) {
    if (bytes) this._bytes = bytes;
  }

  static fromURL(url: string): ExternalBlob {
    const blob = new ExternalBlob();
    blob._url = url;
    return blob;
  }

  async getBytes(): Promise<Uint8Array> {
    if (this._bytes) return this._bytes;
    if (this._url) {
      const response = await fetch(this._url);
      const arrayBuffer = await response.arrayBuffer();
      this._bytes = new Uint8Array(arrayBuffer);
      return this._bytes;
    }
    return new Uint8Array();
  }

  getURL(): string | null {
    return this._url;
  }
}

type UploadFn = (file: ExternalBlob) => Promise<Uint8Array>;
type DownloadFn = (bytes: Uint8Array) => Promise<ExternalBlob>;

export function createActor(
  canisterId: string,
  _uploadFile: UploadFn,
  _downloadFile: DownloadFn,
  options: CreateActorOptions & { agent?: any } = {},
): backendInterface {
  const { agent, ...actorConfig } = options;
  const actor = Actor.createActor<backendInterface>(idlFactory, {
    agent,
    canisterId,
    ...actorConfig,
  });
  return actor;
}
