import {YouTubeRoute} from "../route";
import {AxiosResponse} from "axios";

const YT_INITIAL_DATA_REGEX = /"liveChatRenderer":\s*({.+?}])/g;
const YT_CONTINUATION_REGEX = /"continuation":\s*"([^"]*)"/;
const YT_VISITOR_DATA_REGEX = /"visitorData":\s*"([^"]*)"/g;
const YT_PAGE_HEADER_BANNER_TAG = /id="page-header-banner"/g;

export type LivePageRoutePayload = {
  creatorId: string
}

export type LivePageRouteResponse = {
  continuationToken: string,
  visitorDataToken: string
}

export class UserNotFoundError extends Error {

}

export class UserOfflineError extends Error {

}

export class LivePageRoute extends YouTubeRoute<LivePageRoutePayload, LivePageRouteResponse> {

  async fetch(config: LivePageRoutePayload): Promise<LivePageRouteResponse> {

    // Fetch the live info
    const fetchUrl = `https://www.youtube.com/@${config.creatorId}/live`;
    const response: AxiosResponse = await this.http.axios.get(fetchUrl);
    const responseText: string = response.data as string;

    // Case 1) Found user live data
    const liveChatRendererMatch = responseText.match(YT_INITIAL_DATA_REGEX)?.[0];

    if (liveChatRendererMatch) {
      const continuationTokenText = liveChatRendererMatch.match(YT_CONTINUATION_REGEX)?.[0];
      const visitorDataTokenText = responseText.match(YT_VISITOR_DATA_REGEX)?.[1];

      const continuationToken = continuationTokenText?.split(":")[1].replace(/"/g, "");
      const visitorDataToken = visitorDataTokenText?.split(":")[1].replace(/"/g, "");

      if (continuationToken && visitorDataToken) {
        return {
          continuationToken: continuationToken,
          visitorDataToken: visitorDataToken
        }
      }
    }

    // Case 2) User does not exist / cannot be found
    if (response.status == 404) {
      throw new UserNotFoundError("The user does not exist (page not found).");
    }

    // Case 2) User is not live but does exist
    if ((response.data as string).match(YT_PAGE_HEADER_BANNER_TAG)) {
      throw new UserOfflineError("The is not current live.");
    }

    // Case 3) Unknown error
    throw new UserNotFoundError("Unable to scrape the continuation & visitorData tokens.");

  }

}