import React from "react";

export default function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="loader" />
      <style>{`
        .loader {
          width:36px;height:36px;border-radius:50%;border:4px solid rgba(0,0,0,0.1);border-top-color:#06b6d4;animation:spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
