import api from "api";

// don't use this library because idk how to typesafe this

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const sdk = api("@ai21-studio/v3.0#rkid1g1h6lbxhal56");

export type AI21 = {
  auth: (token: string) => AI21;
  textSegmentationRef: (
    req: TextSegmentationReq
  ) => Promise<TextSegmentationRes>;
} & typeof sdk;

export type TextSegmentationReq = {
  source: string;
  sourceType: "TEXT" | "URL";
};

export type Segment = {
  segmentText: string;
  segmentType: string;
};

export type TextSegmentationRes = {
  id: string;
  segments: Segment[];
};

// export const ai21 = (api("@ai21-studio/v3.0#rkid1g1h6lbxhal56") as AI21).auth(
//   `Bearer ${process.env.AI21_API_KEY || ""}`
// );
