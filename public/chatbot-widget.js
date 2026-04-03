/**
 * BlockVault Chatbot Widget - Standalone JS for static HTML pages
 * Injects a floating chatbot powered by Lovable AI
 */
(function () {
  const SUPABASE_URL = "https://jprrdtmqfyiiyoccpjoc.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcnJkdG1xZnlpaXlvY2Nwam9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTE5MDMsImV4cCI6MjA5MDc4NzkwM30.jVrNNLdYRy7PacqV53rC8Lb22JJ-Z2_eCUL8HrEJn9w";
  const CHAT_URL = SUPABASE_URL + "/functions/v1/chat";

  const QUICK_ACTIONS = [
    "How does BlockVault work?",
    "How to verify a credential?",
    "What is AI confidence score?",
    "How to share my certificate?",
  ];

  let messages = [];
  let isLoading = false;
  let isOpen = false;

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    #bv-chat-btn{position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;background:#C1FF2F;color:#0A0A0B;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(193,255,47,0.3);transition:transform .2s}
    #bv-chat-btn:hover{transform:scale(1.08)}
    #bv-chat-panel{position:fixed;bottom:96px;right:24px;z-index:9999;width:380px;height:520px;border-radius:16px;background:#0A0A0B;border:1px solid #1E1E22;box-shadow:0 20px 60px rgba(0,0,0,0.5);display:none;flex-direction:column;overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif}
    #bv-chat-panel.open{display:flex}
    .bv-header{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid #1E1E22}
    .bv-header-icon{width:36px;height:36px;border-radius:8px;background:#C1FF2F;display:flex;align-items:center;justify-content:center}
    .bv-header-title{color:#C1FF2F;font-size:14px;font-weight:700}
    .bv-header-sub{color:#71717A;font-size:12px}
    .bv-messages{flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin}
    .bv-msg{display:flex;gap:8px;max-width:100%}
    .bv-msg.user{justify-content:flex-end}
    .bv-msg.assistant{justify-content:flex-start}
    .bv-avatar{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:4px}
    .bv-avatar.bot{background:#C1FF2F}
    .bv-avatar.usr{background:#27272A}
    .bv-bubble{max-width:80%;border-radius:12px;padding:10px 14px;font-size:14px;line-height:1.6}
    .bv-bubble.user{background:#C1FF2F;color:#0A0A0B}
    .bv-bubble.assistant{background:#18181B;color:#E4E4E7}
    .bv-bubble.assistant p{margin:0 0 4px}
    .bv-bubble.assistant ul,.bv-bubble.assistant ol{margin:4px 0;padding-left:18px}
    .bv-bubble.assistant li{margin:2px 0}
    .bv-bubble.assistant strong{color:#C1FF2F}
    .bv-bubble.assistant code{background:#27272A;padding:1px 4px;border-radius:3px;font-size:12px}
    .bv-input-area{padding:8px 16px 16px;border-top:1px solid #1E1E22}
    .bv-input-form{display:flex;align-items:center;gap:8px;background:#18181B;border-radius:12px;padding:8px 12px}
    .bv-input-form input{flex:1;background:transparent;border:none;outline:none;color:#E4E4E7;font-size:14px;font-family:inherit}
    .bv-input-form input::placeholder{color:#52525B}
    .bv-send-btn{width:32px;height:32px;border-radius:8px;background:#C1FF2F;color:#0A0A0B;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center}
    .bv-send-btn:disabled{opacity:.3;cursor:default}
    .bv-quick{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
    .bv-quick button{background:transparent;border:1px solid #27272A;color:#D4D4D8;font-size:12px;padding:6px 12px;border-radius:8px;cursor:pointer;font-family:inherit;transition:all .2s}
    .bv-quick button:hover{border-color:rgba(193,255,47,0.5);background:rgba(193,255,47,0.1)}
    .bv-thinking{color:#71717A;font-size:14px;animation:bvPulse 1.5s infinite}
    @keyframes bvPulse{0%,100%{opacity:1}50%{opacity:.4}}
    @media(max-width:440px){#bv-chat-panel{width:calc(100vw - 32px);right:16px;bottom:88px;height:70vh}}
  `;
  document.head.appendChild(style);

  // SVG icons
  const chatIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`;
  const closeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
  const sendIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;
  const botIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`;
  const userIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  // Create elements
  const btn = document.createElement("button");
  btn.id = "bv-chat-btn";
  btn.innerHTML = chatIcon;
  btn.setAttribute("aria-label", "Open chat");

  const panel = document.createElement("div");
  panel.id = "bv-chat-panel";

  function render() {
    let html = `<div class="bv-header">
      <div class="bv-header-icon">${botIcon}</div>
      <div><div class="bv-header-title">BlockVault Assistant</div><div class="bv-header-sub">Online • Ask me anything</div></div>
    </div><div class="bv-messages" id="bv-msgs">`;

    if (messages.length === 0) {
      html += `<div style="color:#A1A1AA;font-size:14px">Hi! I'm your BlockVault assistant. How can I help you today?</div>`;
      html += `<div class="bv-quick">${QUICK_ACTIONS.map(q => `<button onclick="window.__bvSend('${q.replace(/'/g, "\\'")}')">${q}</button>`).join("")}</div>`;
    }

    for (const m of messages) {
      if (m.role === "user") {
        html += `<div class="bv-msg user"><div class="bv-bubble user">${esc(m.content)}</div><div class="bv-avatar usr">${userIcon}</div></div>`;
      } else {
        html += `<div class="bv-msg assistant"><div class="bv-avatar bot">${botIcon}</div><div class="bv-bubble assistant">${simpleMarkdown(m.content)}</div></div>`;
      }
    }

    if (isLoading && (messages.length === 0 || messages[messages.length - 1].role !== "assistant")) {
      html += `<div class="bv-msg assistant"><div class="bv-avatar bot">${botIcon}</div><div class="bv-bubble assistant"><span class="bv-thinking">Thinking...</span></div></div>`;
    }

    html += `</div><div class="bv-input-area">
      <form class="bv-input-form" onsubmit="event.preventDefault();window.__bvSend()">
        <input id="bv-input" placeholder="Type your question..." ${isLoading ? "disabled" : ""} autocomplete="off"/>
        <button type="submit" class="bv-send-btn" ${isLoading ? "disabled" : ""}>${sendIcon}</button>
      </form></div>`;

    panel.innerHTML = html;
    const msgs = document.getElementById("bv-msgs");
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function simpleMarkdown(text) {
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/^### (.+)$/gm, "<strong style='color:#C1FF2F'>$1</strong>")
      .replace(/^## (.+)$/gm, "<strong style='color:#C1FF2F;font-size:15px'>$1</strong>")
      .replace(/^- (.+)$/gm, "• $1")
      .replace(/^\d+\. (.+)$/gm, (_, c) => "• " + c)
      .replace(/\n/g, "<br>");
  }

  window.__bvSend = async function (text) {
    const input = document.getElementById("bv-input");
    const msg = (text || (input && input.value) || "").trim();
    if (!msg || isLoading) return;
    if (input) input.value = "";
    messages.push({ role: "user", content: msg });
    isLoading = true;
    render();

    let assistantText = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + SUPABASE_KEY },
        body: JSON.stringify({ messages }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        assistantText = err.error || "Sorry, something went wrong.";
        messages.push({ role: "assistant", content: assistantText });
        isLoading = false;
        render();
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || !line.trim() || !line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const p = JSON.parse(json);
            const c = p.choices && p.choices[0] && p.choices[0].delta && p.choices[0].delta.content;
            if (c) {
              assistantText += c;
              const last = messages[messages.length - 1];
              if (last && last.role === "assistant") last.content = assistantText;
              else messages.push({ role: "assistant", content: assistantText });
              render();
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) {
      console.error(e);
      assistantText = "Sorry, I'm unable to connect right now.";
      messages.push({ role: "assistant", content: assistantText });
    }
    isLoading = false;
    render();
  };

  btn.addEventListener("click", () => {
    isOpen = !isOpen;
    btn.innerHTML = isOpen ? closeIcon : chatIcon;
    panel.classList.toggle("open", isOpen);
    if (isOpen) {
      render();
      setTimeout(() => { const inp = document.getElementById("bv-input"); if (inp) inp.focus(); }, 100);
    }
  });

  document.body.appendChild(btn);
  document.body.appendChild(panel);
})();
