import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { api } from "@/lib/api";
import { getDeviceTag } from "@/lib/deviceTag";

export function getPasskeyStatus(): Promise<{ registered: boolean }> {
  return api(`/auth/passkey/status?deviceTag=${encodeURIComponent(getDeviceTag())}`);
}

export async function registerPasskey(): Promise<void> {
  const options = await api("/auth/passkey/register/options", { method: "POST", body: JSON.stringify({}) });
  const response = await startRegistration({ optionsJSON: options });
  await api("/auth/passkey/register/verify", { method: "POST", body: JSON.stringify({ response, deviceTag: getDeviceTag() }) });
}

export async function verifyPasskeyFallback(faceCheckId: string): Promise<{ allowed: boolean; faceCheckId: string }> {
  const deviceTag = getDeviceTag();
  const options = await api("/auth/passkey/fallback/options", { method: "POST", body: JSON.stringify({ faceCheckId, deviceTag }) });
  const response = await startAuthentication({ optionsJSON: options });
  return api("/auth/passkey/fallback/verify", { method: "POST", body: JSON.stringify({ faceCheckId, response, deviceTag }) });
}
