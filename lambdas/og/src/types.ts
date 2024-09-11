export type CloudFrontConfig<EventType> = {
  config: {
    distributionDomainName: string;
    distributionId: string;
    eventType: EventType;
    requestId: string;
  };
};

export type CloudFrontOrigin = {
  custom: {
    customHeaders: object;
    domainName: string;
    keepaliveTimeout: number;
    path: string;
    port: number;
    protocol: "https" | "http";
    readTimeout: number;
    sslProtocols: string[];
  };
};

export type Headers = { [headerKey: string]: { key: string; value: string }[] };

export type CloudFrontRequest = {
  clientIp: string;
  headers: Headers;
  method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";
  querystring: string;
  uri: string;
};

export type CloudFrontResponse = {
  response: {
    headers: Headers;
    status: string;
    statusDescription: string;
    bodyEncoding?: "text" | "base64";
    body?: string;
  };
};

export type CloudFrontRequestEvt = {
  Records: [
    {
      cf:
        | (CloudFrontConfig<"viewer-request"> & { request: CloudFrontRequest })
        | (CloudFrontConfig<"origin-request"> & {
            request: CloudFrontRequest & { origin: CloudFrontOrigin };
          });
    },
  ];
};

export type CloudFrontResponseEvt = {
  Records: [
    {
      cf:
        | (CloudFrontConfig<"viewer-response"> & {
            request: CloudFrontRequest;
          } & CloudFrontResponse)
        | (CloudFrontConfig<"origin-response"> & {
            request: CloudFrontRequest & { origin: CloudFrontOrigin };
          } & CloudFrontResponse);
    },
  ];
};

export type CloudFrontEvent = CloudFrontRequestEvt | CloudFrontResponseEvt;
