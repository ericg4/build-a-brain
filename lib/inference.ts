import * as ort from "onnxruntime-web";

let cachedSession: ort.InferenceSession | null = null;

export async function loadModel(): Promise<ort.InferenceSession> {
  if (cachedSession) return cachedSession;

  ort.env.wasm.wasmPaths =
    "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/";

  const session = await ort.InferenceSession.create(
    "/build_a_brain_assets/model.onnx",
    { executionProviders: ["wasm"] }
  );
  cachedSession = session;
  return session;
}

export function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export interface InferenceResult {
  logits: number[];
  probs: number[];
  prediction: number;
  conv1: Float32Array; // [8, 28, 28]
  conv2: Float32Array; // [16, 14, 14]
}

export async function runInference(
  session: ort.InferenceSession,
  pixels: Float32Array
): Promise<InferenceResult> {
  const inputTensor = new ort.Tensor("float32", pixels, [1, 1, 28, 28]);

  const feeds: Record<string, ort.Tensor> = {};
  const inputName = session.inputNames[0];
  feeds[inputName] = inputTensor;

  const results = await session.run(feeds);

  const outputNames = session.outputNames;
  const logitsData = results[outputNames[0]].data as Float32Array;
  const conv1Data = results[outputNames[1]].data as Float32Array;
  const conv2Data = results[outputNames[2]].data as Float32Array;

  const logits = Array.from(logitsData);
  const probs = softmax(logits);
  const prediction = probs.indexOf(Math.max(...probs));

  return {
    logits,
    probs,
    prediction,
    conv1: conv1Data,
    conv2: conv2Data,
  };
}
