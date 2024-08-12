const DEFAULT_CONTEXT: Record<string, any> = (
    {
      "context": {
        "client": {
          "hl": "en",
          "gl": "CA",
          "remoteHost": "76.69.53.202",
          "deviceMake": "Apple",
          "deviceModel": "",
          "visitorData": "[FILL_DATA]",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36,gzip(gfe)",
          "clientName": "WEB",
          "clientVersion": "2.20240715.07.00",
          "osName": "Macintosh",
          "osVersion": "10_15_7",
          "originalUrl": "[FILL_URL]",
          "screenPixelDensity": 2,
          "platform": "DESKTOP",
          "clientFormFactor": "UNKNOWN_FORM_FACTOR",
          "configInfo": {
            "appInstallData": "EhDvzbAFEND6sAUQ3Y6xBRCk7bAFEJrwrwUQlZWxBRCXg7EFENuvrwUQooGwBRD8hbAFEKiTsQUQppOxBRD68LAFENCNsAUQ1YuxBRDM364FENnJrwUQi8-"
          },
          "screenDensityFloat": 2,
          "userInterfaceTheme": "USER_INTERFACE_THEME_DARK",
          "timeZone": "America/Toronto",
          "browserName": "Chrome",
          "browserVersion": "126.0.0.0",
          "acceptHeader": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "deviceExperimentId": "ChxOek01TWpNek9UQXlNRGt6TXpnd05qZzVOQT09EKy627QGGKy627QG",
          "screenWidthPoints": 424,
          "screenHeightPoints": 594,
          "utcOffsetMinutes": -240,
          "connectionType": "CONN_CELLULAR_4G",
          "memoryTotalKbytes": "8000000",
          "mainAppWebInfo": {
            "graftUrl": "[FILL_URL]",
            "webDisplayMode": "WEB_DISPLAY_MODE_BROWSER",
            "isWebNativeShareAvailable": false
          }
        },
        "user": {
          "lockedSafetyMode": false
        },
        "request": {
          "useSsl": true,
          "internalExperimentFlags": [],
          "consistencyTokenJars": []
        },
        "adSignalsInfo": {
          "params": [
            {
              "key": "dt",
              "value": "[TIME_MILLIS]"
            },
            {
              "key": "flash",
              "value": "0"
            },
            {
              "key": "frm",
              "value": "1"
            },
            {
              "key": "u_tz",
              "value": "-240"
            },
            {
              "key": "u_his",
              "value": "8"
            },
            {
              "key": "u_h",
              "value": "1440"
            },
            {
              "key": "u_w",
              "value": "2560"
            },
            {
              "key": "u_ah",
              "value": "1415"
            },
            {
              "key": "u_aw",
              "value": "2560"
            },
            {
              "key": "u_cd",
              "value": "30"
            },
            {
              "key": "bc",
              "value": "31"
            },
            {
              "key": "bih",
              "value": "1328"
            },
            {
              "key": "biw",
              "value": "424"
            },
            {
              "key": "brdim",
              "value": "-2560,-531,-2560,-531,2560,-531,2560,1415,424,594"
            },
            {
              "key": "vis",
              "value": "1"
            },
            {
              "key": "wgl",
              "value": "true"
            },
            {
              "key": "ca_type",
              "value": "image"
            }
          ]
        }
      },
      "continuation": "[FILL_DATA]",
      "webClientInfo": {
        "isDocumentHidden": false
      }
    }
);

/**
 * Context manager for device context used in payloads to give google their sweet, sweet (fake) advertisement data.
 */
export class DeviceContext {

  constructor(
      private continuationToken: string,
      private readonly visitorDataToken: string,
      private readonly originalUrlParam: string = (
          `https://www.youtube.com/live_chat?continuation=${continuationToken}&dark_theme=true&authuser=0`
      )
  ) {
  }

  /**
   * Update the continuation token context
   *
   * @param continuationToken The new continuation token
   *
   */
  public setContinuationToken(
      continuationToken: string
  ): void {
    this.continuationToken = continuationToken;
  }

  /**
   * Build the device context
   *
   */
  public buildDeviceContext(): Record<string, any> {

    const data: Record<string, any> = {...DEFAULT_CONTEXT};

    data.continuation = this.continuationToken;
    data.context.client.visitorData = this.visitorDataToken;
    data.context.client.originalUrl = this.originalUrlParam;
    data.context.client.mainAppWebInfo.graftUrl = this.originalUrlParam;
    data.context.adSignalsInfo.params.filter((p: any) => p.key === "dt")[0].value = Date.now().toString();

    return data;
  }


}


