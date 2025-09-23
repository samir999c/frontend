import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./Chat.css";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        // **FIXED**: Send the 'input' as the query and the original 'messages' as history
        body: JSON.stringify({ 
            user_query: input, 
            history: messages 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
          throw new Error(data.ai_response || "An error occurred.");
      }
      
      const aiMessage = { role: "ai", content: data.ai_response };
      setMessages([...newMessages, aiMessage]);

    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          content: "Sorry, I'm having trouble connecting right now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // The JSX for your component remains the same
  return (
    <div className="chat-container">
      {/* ... Your form and results display JSX ... */}
    </div>
  );
}