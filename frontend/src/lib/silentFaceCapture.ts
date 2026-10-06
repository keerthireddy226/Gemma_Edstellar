// One-shot background capture: opens the camera, grabs a single frame, closes it
// immediately — no visible camera light left on between periodic mid-test checks.
export async function captureSilentFrame(): Promise<string | null> {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 960, facingMode: "user" } });
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    if (video.readyState < 2) {
      await new Promise((resolve) => {
        video.onloadeddata = resolve;
      });
    }
    if (!video.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}
