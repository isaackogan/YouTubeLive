import {YouTubeRoute} from "../route";
import {DeviceContext} from "../context";

export class LiveChatFetchError extends Error {

}

export class DeviceContextMissingError extends Error {

}


export type LiveChatRoutePayload = {
  deviceContext: DeviceContext
}


export type ServiceTrackingParam = {
  service: string,
  params: { key: string, value: string }[]
}

export type Action = {
  addChatItemAction?: { item: { liveChatTextMessageRenderer: ChatMessage } }
  // Additional actions here
};

export type LiveChatRouteResponse = {
  responseContext?: {
    visitorData: string,
    serviceTrackingParams: ServiceTrackingParam[],
    mainAppWebResponseContext: {
      loggedOut: boolean,
      trackingParam: string
    },
    webResponseContextExtensionData: {
      hasDecorated: boolean
    }
  },
  continuationContents?: {
    liveChatContinuation: {
      continuations: {
        reloadContinuationData: {
          continuation: string
        }
      }[],
      actions: Action[]
    }
  },
  frameworkUpdates?: {
    entityBatchUpdate: {
      mutations: {
        entityKey: string,
        payload: {
          emojiFountainDataEntity: {
            key: string,
            reactionBuckets: {
              duration: { seconds: string },
              intensityScore: number,
              reactionsData: { unicodeEmojiId: string, reactionCount: number }[],
              totalReactions: number
            }[]
          }
        }
      }[]
    }
  }
}


export interface ChatMessage {
  message: { runs?: Run[] }
  authorName?: SimpleText;
  authorPhoto?: AuthorPhoto;
  contextMenuEndpoint?: ContextMenuEndpoint;
  id?: string;
  timestampUsec?: string;
  authorExternalChannelId?: string;
  contextMenuAccessibility?: ContextMenuAccessibility;
}

export interface Run {
  text?: string;
}

export interface SimpleText {
  simpleText?: string;
}

export interface AuthorPhoto {
  thumbnails?: Thumbnail[];
}

export interface Thumbnail {
  url?: string;
  width?: number;
  height?: number;
}

export interface ContextMenuEndpoint {
  commandMetadata?: CommandMetadata;
  liveChatItemContextMenuEndpoint?: LiveChatItemContextMenuEndpoint;
}

export interface CommandMetadata {
  webCommandMetadata?: WebCommandMetadata;
}

export interface WebCommandMetadata {
  ignoreNavigation?: boolean;
}

export interface LiveChatItemContextMenuEndpoint {
  params?: string;
}

export interface ContextMenuAccessibility {
  accessibilityData?: AccessibilityData;
}

export interface AccessibilityData {
  label?: string;
}


export class LiveChatRoute extends YouTubeRoute<LiveChatRoutePayload, LiveChatRouteResponse> {

  private readonly endpointUrl: string = "https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?prettyPrint=false";

  /**
   * Fetch comments from an YouToube Live session
   *
   * @param config Device context for continuous successive requests to the live chat route.
   */
  async fetch(
      config: LiveChatRoutePayload
  ): Promise<LiveChatRouteResponse> {

    if (config.deviceContext === undefined) {
      throw new DeviceContextMissingError("Silly billy, you forgot to set the device context!");
    }

    const axiosResponse = await fetch(
        this.endpointUrl, {
          method: "POST",
          body: JSON.stringify(config.deviceContext.buildDeviceContext())
        }
    );

    const responseJSON: LiveChatRouteResponse = await axiosResponse.json();

    const continuationJSON: Record<string, any> | undefined = (
        responseJSON
            ?.continuationContents
            ?.liveChatContinuation
            ?.continuations
            ?.[0]
    );

    const continuationToken = (
        continuationJSON?.reloadContinuationData || continuationJSON?.invalidationContinuationData
            ?.continuation
    );

    if (continuationToken === undefined) {
      throw new LiveChatFetchError("Failed to fetch the live chat continuation param.");
    }

    config.deviceContext.setContinuationToken(continuationToken);
    return responseJSON;

  }

}