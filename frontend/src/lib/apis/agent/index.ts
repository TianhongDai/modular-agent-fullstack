import { UserQuery } from "@/lib/types";

// this is used to fetch the data
export const getAgentResponse = async (query: UserQuery, agentURL: string) => {
  try{
    const res = await fetch(`/backend/${agentURL}`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    });
    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(`Server responded with ${res.status}: ${errorMsg}`);
    }
    return res;
  } catch (error) {
    console.error("Failed to get the response: ", error);
    return { "error": `Failed to get the agent response: ${error}`};
  }
};