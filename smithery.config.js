/**
 * Smithery build configuration
 * Externalizes native modules that can't be bundled
 */
export default {
  external: [
    "@napi-rs/canvas",
    "@napi-rs/canvas-darwin-arm64",
    "@napi-rs/canvas-darwin-x64",
    "@napi-rs/canvas-linux-x64-gnu",
    "@napi-rs/canvas-linux-x64-musl",
    "@napi-rs/canvas-win32-x64-msvc",
    "@napi-rs/canvas-linux-arm64-gnu",
    "@napi-rs/canvas-linux-arm64-musl",
  ],
};
