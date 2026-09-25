import React from "react";
import { ComingSoon } from "../../components/ui/ComingSoon";

export default function MessagesPage() {
  return (
    <ComingSoon
      title="Guest & Host Messaging"
      description="Real-time messaging between guests and hosts is currently mocked for this assessment. In production, this integrates WebSocket communication for live trip coordination."
    />
  );
}
