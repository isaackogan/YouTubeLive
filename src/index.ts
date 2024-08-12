import {YouTubeLiveWebClient} from "./web/client";
import {CreateAxiosDefaults} from "axios";
import {EventEmitter} from "node:events";
import {LiveEvent} from "./event";
import {LivePageRouteResponse} from "./web/routes/fetch_page";
import {DeviceContextMissingError, LiveChatRouteResponse} from "./web/routes/fetch_chat";
import {DeviceContext} from "./web/context";

export * from "./web/client";
export * from "./web/http";


export class YouTubeLiveClient extends EventEmitter {

  public readonly web: YouTubeLiveWebClient;
  private commentInterval?: NodeJS.Timeout;
  private isConnected: boolean = false;
  private firstFetch: boolean = true;
  private deviceContext?: DeviceContext;

  /**
   * Create a new YouTube LIVE Client
   *
   * @param username The user you want to connect to
   * @param httpProxy The proxy to use for the connection
   * @param axiosConfig The axios configuration to use
   * @param commentFetchInterval The interval to fetch comments at
   * @param heartbeatFetchInterval The interval to fetch heartbeats at
   *
   */
  constructor(
      public readonly username: string,
      public readonly httpProxy?: URL,
      protected readonly axiosConfig?: CreateAxiosDefaults,
      protected commentFetchInterval: number = 5000,
      protected heartbeatFetchInterval: number = 5000
  ) {
    super();
    this.web = new YouTubeLiveWebClient(httpProxy, axiosConfig);
  }

  /**
   * Start a connection to a live stream
   *
   */
  public async start() {

    // Now we fetch the room info
    const continuationResponse: LivePageRouteResponse = await this.web.continuation_route.fetch(
        {creatorId: this.username}
    );

    this.deviceContext = new DeviceContext(
        continuationResponse.continuationToken,
        continuationResponse.visitorDataToken
    );

    try {
      await this.fetchComments();
      this.commentInterval = setInterval(this.fetchComments.bind(this), 5000);
    } catch (ex) {
      this.emit(LiveEvent.CONNECT_ERROR, ex);
      throw ex;
    }

  }

  /**
   * Stop polling the live stream, essentially "disconnecting" from it.
   */
  public disconnect<T extends unknown>(error?: T): void {
    clearInterval(this.commentInterval);

    this.isConnected = false;
    this.commentInterval = undefined;
    this.firstFetch = true;
    this.emit(LiveEvent.DISCONNECTED, error);

  }

  protected async fetchComments(): Promise<void> {
    let commentsResponse: LiveChatRouteResponse;

    if (this.deviceContext === undefined) {
      throw new DeviceContextMissingError("Device context not initialized!");
    }

    // Grab the comments
    try {
      commentsResponse = await this.web.chat_route.fetch({deviceContext: this.deviceContext});
    } catch (ex) {
      this.disconnect(ex);
      this.emit(LiveEvent.ERROR, ex);
      return;
    }

    // Update to connected state
    if (this.firstFetch) {
      this.emit(LiveEvent.CONNECTED);
      this.firstFetch = false;
      this.isConnected = true;
    }

    // Raw payload emit
    this.emit(LiveEvent.FETCH_COMMENTS, commentsResponse);

    // First, parse comments
    for (let action of commentsResponse?.continuationContents?.liveChatContinuation.actions || []) {

      if (action.addChatItemAction) {
        const item = action.addChatItemAction.item?.liveChatTextMessageRenderer;
        this.emit(LiveEvent.COMMENT, item);
      }
    }

    // Second, parse emojis
    for (let mutation of commentsResponse?.frameworkUpdates?.entityBatchUpdate.mutations || []) {
      if (mutation.payload.emojiFountainDataEntity.reactionBuckets) {
        this.emit(LiveEvent.EMOJI, mutation.payload.emojiFountainDataEntity.reactionBuckets);
      }
    }

  }

  /**
   * Check if the user is connected
   */
  public getIsConnected(): boolean {
    return this.isConnected;
  }

}