import {YoutubeLiveHTTPClient} from "./http";

export abstract class YouTubeRoute<RoutePayload, RouteResponse> {

  constructor(
      protected http: YoutubeLiveHTTPClient
  ) {
  }

  abstract fetch(config: RoutePayload): Promise<RouteResponse>;

}
