import { useState } from "react";
export function Avatar({ url, name }: { url?: string; name?: string }) {
  const [failed, setFailed] = useState(false);
  return url && !failed ? <img src={url} alt="" onError={() => setFailed(true)}
    style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
    <span aria-hidden="true">{name?.trim() ? name.trim().slice(0, 1).toLocaleUpperCase() :
      <svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true">
        <circle cx="12" cy="7" r="4" fill="currentColor" />
        <path d="M4 22v-3a8 8 0 0 1 16 0v3z" fill="currentColor" />
      </svg>}</span>;
}
