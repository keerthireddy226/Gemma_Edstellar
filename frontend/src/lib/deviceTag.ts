const STORAGE_KEY = "spica_device_tag";

// Random, persisted per-browser, never synced anywhere — pins passkey usage to this device.
export function getDeviceTag(): string {
  let tag = localStorage.getItem(STORAGE_KEY);
  if (!tag) {
    tag = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, tag);
  }
  return tag;
}
