import { useState } from "react";

// A readonly input + "Copy" button, used anywhere a secret/shareable link
// needs to be shown and easily copied (Publish/Save flow, admin reset).
export default function CopyField({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="copy-field">
      <input className="copy-field__input" readOnly value={value} onFocus={(e) => e.target.select()} />
      <button
        type="button"
        className="btn btn-upload"
        onClick={() => {
          navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
