import {YoutubeLiveHTTPClient} from "./http";
import {LivePageRoute} from "./routes/fetch_page";
import {CreateAxiosDefaults} from "axios";
import {LiveChatRoute} from "./routes/fetch_chat";

export class YouTubeLiveWebClient extends YoutubeLiveHTTPClient {

  public readonly continuation_route: LivePageRoute;
  public readonly chat_route: LiveChatRoute;

  constructor(
      proxy?: URL,
      axiosConfig?: CreateAxiosDefaults
  ) {
    super(axiosConfig, proxy);

    this.continuation_route = new LivePageRoute(this);
    this.chat_route = new LiveChatRoute(this);

  }

}


