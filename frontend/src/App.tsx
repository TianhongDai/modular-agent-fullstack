import type { Message } from "@/lib/types";
import { useState, useEffect, useRef, useCallback } from "react";
import { ProcessedEvent } from "@/components/ActivityTimeline";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatMessagesView } from "@/components/ChatMessagesView";
import { getAgentResponse } from "@/lib/apis/agent";
import { UserQuery } from "@/lib/types";
import { getSelectedAgentState } from "@/components/registry/AgentRegistry";

export default function App() {
  const [processedEventsTimeline, setProcessedEventsTimeline] = useState<
    ProcessedEvent[]
  >([]);
  const [historicalActivities, setHistoricalActivities] = useState<
    Record<string, ProcessedEvent[]>
  >({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasFinalizeEventOccurredRef = useRef(false);
  const [chats, setChats] = useState<Message[]>([]);
  const chatsRef = useRef<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // select agent states
  const { selectedAgent, setSelectedAgent } = getSelectedAgentState();

  useEffect(() => {
    chatsRef.current = chats;
    // check the scroll area
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [chats]);

  useEffect(() => {
    if (
      hasFinalizeEventOccurredRef.current &&
      !isLoading &&
      chats.length > 0
    ) {
      const lastMessage = chats[chats.length - 1];
      if (lastMessage && lastMessage.type === "ai" && lastMessage.id) {
        setHistoricalActivities((prev) => ({
          ...prev,
          [lastMessage.id!]: [...processedEventsTimeline],
        }));
      }
      hasFinalizeEventOccurredRef.current = false;
    }
  }, [chats, isLoading, processedEventsTimeline]);

  const handleSubmit = useCallback(
    (submittedInputValue: string, agentURL: string, eventInfo: (data: any) => any, queryExtraInfo: any) => {
      if (!submittedInputValue.trim()) return;
      setProcessedEventsTimeline([]);
      hasFinalizeEventOccurredRef.current = false;
      // test the func
      const getAnswer = async (inputQuery: UserQuery) => {
        let message: string = "";
        let processedEvent: ProcessedEvent | null = null;
        const res = await getAgentResponse(inputQuery, agentURL);
        if ("error" in res) {
          // set the error message
          setChats((chats) => [
            ...(chats || []),
            {
              type: "ai",
              content: res.error,
              id: Date.now().toString(),
            },
          ]);
          console.error("No response from agent: ", res.error);
        } else { 
          const reader = res.body?.getReader();
          if (!reader) throw new Error("body is not available");
          const decoder = new TextDecoder("utf-8");
          let buffer: string = "";
          // start to process response
          while (true){
            const { value, done } = await reader.read();
            buffer += decoder.decode(value, {stream: true});
            setIsLoading(!done);
            if (done) break;
            let lines = buffer.split("\n");
            buffer = lines.pop()!;
            for (const line of lines) {
              if (line !== ""){
                const data = JSON.parse(line);
                const { titleDetails, extraInfo } = eventInfo(data);
                processedEvent = {
                  title: titleDetails,
                  data: extraInfo,
                };
                if (processedEvent && !hasFinalizeEventOccurredRef.current) {
                  setProcessedEventsTimeline((prevEvents) => [
                    ...prevEvents,
                    processedEvent!,
                  ]);
                }
                // finalize
                if (data.stage === "finalize_answer"){
                  hasFinalizeEventOccurredRef.current = true;
                  message += data.response; 
                  // detect if the last one is the ai or human
                  setChats((chats) => {
                    const lastMessage = chats[chats.length - 1];
                    if (lastMessage.type !== "ai"){
                      return [
                        ...chats,
                        {
                          type: "ai",
                          content: message,
                          id: Date.now().toString(),
                        }
                      ];
                    } else {
                      const updatedLastMessage = {
                        ...chats[chats.length - 1],
                        content: message,
                      };
                      return [
                        ...chats.slice(0, chats.length - 1),
                        updatedLastMessage,
                      ];
                    }
                  });
                }
              }
            }
          }
        }
      };

      const newHumanMessage: Message = {
        type: "human",
        content: submittedInputValue,
        id: Date.now().toString(),
      }

      setChats((chats) => [
        ...(chats || []),
        newHumanMessage,
      ]);

      const newMessages: Message[] = [
        ...(chatsRef.current || []),
        newHumanMessage,
      ];
      
      // execute the func
      getAnswer({
        messages: newMessages,
        extra_info: queryExtraInfo,
      });
    }, []
  );

  const handleCancel = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="flex h-screen bg-neutral-800 text-neutral-100 font-sans antialiased">
      <main className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full">
        <div
          className={`flex-1 overflow-y-auto ${
            chats.length === 0 ? "flex" : ""
          }`}
        >
          {chats.length === 0 ? (
            <WelcomeScreen
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onCancel={handleCancel}
              agentControl={{selectedAgent, setSelectedAgent}}
            />
          ) : (
            <ChatMessagesView
              messages={chats}
              isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              liveActivityEvents={processedEventsTimeline}
              historicalActivities={historicalActivities}
              agentControl={{selectedAgent, setSelectedAgent}}
            />
          )}
        </div>
      </main>
    </div>
  );
}
