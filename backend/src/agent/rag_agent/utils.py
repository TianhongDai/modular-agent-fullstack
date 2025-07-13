def build_llm_message(messages):
    llm_messages = []
    for message in messages:
        if message.type == "human":
            llm_messages.append({"role": "user", "content": message.content})
        elif message.type == "ai":
            llm_messages.append({"role": "assistant", "content": message.content})
    return llm_messages
