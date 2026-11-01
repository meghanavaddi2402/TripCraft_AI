import { useState } from "react";
import api, { errMsg } from "../api";
import "./Chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! 👋 Welcome to TripCraft AI! I'm your personal travel assistant. How can I help you plan your next trip?",
    },
  ]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    const history = messages.slice(-10).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", {
        message: text,
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errMsg(error),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">

      {/* Floating button */}
      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle chatbot"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <div className="chatbot-avatar">🤖</div>

              <div>
                <h3>TripCraft AI</h3>
                <span>Your personal travel assistant</span>
              </div>
            </div>

            <button
              type="button"
              className="clear-chat"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`chat-message ${
                  item.role === "user"
                    ? "user-message"
                    : "bot-message"
                }`}
              >
                <div className="message-content">
                  {item.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="typing">
                TripCraft AI is typing...
              </div>
            )}
          </div>

          {/* Input */}
          <form
            className="chatbot-input"
            onSubmit={sendMessage}
          >
            <input
              type="text"
              placeholder="Ask anything about travel..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
            >
              ➤
            </button>
          </form>

          <div className="chatbot-footer">
            Powered by TripCraft AI
          </div>
        </div>
      )}
    </div>
  );
}