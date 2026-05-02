import axios from "axios";

export async function submitFeedback(text: string): Promise<void> {
  await axios.post("/api/morning-brief/feedback", { text });
}
