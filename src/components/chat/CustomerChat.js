import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { apiUrl, server } from "../../constants";

export default function CustomerChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "สวัสดีค่ะคุณลูกค้า ยินดีต้อนรับสู่ **ALA Clinic (Aesthetic & Wellness)** นะคะ ✨\n\nหนิงเป็น **AI ผู้ช่วยที่ปรึกษาความงาม** ประจำคลินิก มีคำถามเรื่องหัตถการ ปัญหาผิวพรรณ โปรโมชั่นประจำเดือน หรือต้องการจองคิวตรวจกับคุณหมอ สามารถพิมพ์สอบถามได้เลยค่ะ 💖",
      time: moment().format("HH:mm"),
      actions: [
        { label: "💎 โปรโมชั่นยอดนิยมเดือนนี้", query: "โปรโมชั่นยอดนิยมเดือนนี้มีอะไรบ้างคะ" },
        { label: "💉 ปรึกษาฟิลเลอร์ / โบท็อกซ์", query: "อยากปรับรูปหน้า ปรึกษาฟิลเลอร์และโบท็อกซ์ค่ะ" },
        { label: "🌟 เลเซอร์รอยสิว ฝ้า กระ", query: "มีเลเซอร์รักษาจุดด่างดำ รอยสิว ฝ้ากระ แนะนำไหมคะ" },
        { label: "📅 ขอนัดหมายคิวคุณหมอ", query: "สนใจจองคิวปรึกษาคุณหมอค่ะ" },
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Quick Starter Pills
  const starterPills = [
    { icon: "💎", text: "โปรโมชั่นล่าสุด", query: "มีโปรโมชั่นพิเศษอะไรบ้างช่วงนี้คะ" },
    { icon: "💉", text: "โบท็อกซ์ / ฟิลเลอร์", query: "สอบถามราคาและยี่ห้อโบท็อกซ์ ฟิลเลอร์ค่ะ" },
    { icon: "✨", text: "เลเซอร์หน้าใส", query: "อยากทำเลเซอร์หน้าใส ลดรอย มีโปรอะไรบ้าง" },
    { icon: "📅", text: "จองคิวตรวจ", query: "อยากนัดคิวเข้ามาปรึกษาคุณหมอค่ะ" },
  ];

  // Send message function
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      time: moment().format("HH:mm"),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // 1. Try sending to ALA Clinic Backend Agent API
      const chatUrl = `${apiUrl}${server.CHAT_ASK_URL || "chat/ask"}`;
      const response = await axios.post(
        chatUrl,
        {
          message: query,
          agentId: "2659079934603066979",
          history: messages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.text,
          })),
        },
        { timeout: 8000 }
      );

      if (response?.data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            text: response.data.reply,
            time: moment().format("HH:mm"),
            actions: response.data.actions || null,
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.log("Using smart clinic assistant response (API offline or connecting):", err.message);
    }

    // 2. Fallback Smart Clinic AI Response (Simulated high-converting assistant)
    setTimeout(() => {
      let replyText = "";
      let actions = null;
      const lower = query.toLowerCase();

      if (lower.includes("โปร") || lower.includes("ราคา") || lower.includes("แพ็กเกจ")) {
        replyText =
          "🎉 **โปรโมชั่นพิเศษประจำเดือนนี้ที่ ALA Clinic ค่ะ**\n\n" +
          "1. 💉 **Botox ปรับรูปหน้า / ริ้วรอย** (Allergan / Nabota) เริ่มต้น 4,999.- / 100 ยูนิต\n" +
          "2. 💎 **Filler งานผิว & เติมเต็มร่องแก้ม คาง ขมับ** (Juvederm / Restylane) เริ่มต้น 8,900.- / cc\n" +
          "3. ✨ **Laser หน้าใส Pico Ultra Glow** จัดการฝ้า กระ รอยสิว คืนความกระจ่างใส ครั้งละ 2,500.- (คอร์ส 5 ครั้ง 9,900.-)\n\n" +
          "คุณลูกค้าสนใจหัตถการบริเวณไหนเป็นพิเศษ สามารถบอกหนิงเพื่อแนะนำโปรโมชั่นที่คุ้มค่าที่สุดให้ได้นะคะ 💖";
        actions = [
          { label: "📞 โทรนัดหมายคลินิก", url: "tel:0891234567" },
          { label: "📅 สอบถามคิวคุณหมอ", query: "คุณหมอเข้าวันไหนบ้างคะ" },
        ];
      } else if (lower.includes("โบท็อก") || lower.includes("botox") || lower.includes("ริ้วรอย") || lower.includes("กราม")) {
        replyText =
          "สำหรับ **Botox** ที่ ALA Clinic เราใช้ตัวยาแท้ 100% เปิดกล่องดึงยาต่อหน้าคุณหมอทุกเคสค่ะ 👩‍⚕️✨\n\n" +
          "• **ลดกราม ปรับหน้าเรียว**: เหมาะสำหรับผู้ที่มีกล้ามเนื้อกรามเยอะ หน้าบาน เห็นผลชัดเจนใน 2-4 สัปดาห์\n" +
          "• **ลดริ้วรอย (หางตา หน้าผาก ขมวดคิ้ว)**: ช่วยให้ใบหน้าดูอ่อนเยาว์ ริ้วรอยตื้นขึ้นใน 3-7 วัน\n" +
          "• **Lifting ยกกระชับกรอบหน้า**: ช่วยให้กรอบหน้าคมชัดยิ่งขึ้น\n\n" +
          "อยากให้คุณหมอช่วยประเมินรูปหน้า หรือต้องการดูเคสรีวิวก่อนได้เลยนะคะ";
        actions = [
          { label: "💎 ดูโปรโมชั่น Botox", query: "โปรโมชั่น Botox ราคาเท่าไหร่คะ" },
          { label: "📅 จองคิวปรึกษาแพทย์", query: "ขอนัดหมายคิวปรึกษาแพทย์ค่ะ" },
        ];
      } else if (lower.includes("ฟิลเลอร์") || lower.includes("filler") || lower.includes("คาง") || lower.includes("ปาก") || lower.includes("ร่องแก้ม")) {
        replyText =
          "**Filler (สารเติมเต็มไฮยาลูโรนิก)** ที่ ALA Clinic เป็นเทคนิคเฉพาะโดยแพทย์ผู้เชี่ยวชาญ ปรับรูปหน้าให้ดูละมุนเป็นธรรมชาติ ไม่เป็นก้อนค่ะ 💖\n\n" +
          "• **ปากกระจับ สายฝอ / สายเกาหลี**: ขอบปากชัด อวบอิ่มชุ่มชื้น\n" +
          "• **ร่องแก้ม & ใต้ตา**: คืนความสดใส ไม่โทรม ดูเด็กลงทันทีหลังทำ\n" +
          "• **คาง & ขมับ**: ปรับสัดส่วนใบหน้าให้ได้รูปตัว V สวยงาม\n\n" +
          "ทุกเคสสามารถสแกน QR Code ตรวจสอบกล่องยากับ อย. ได้โดยตรงค่ะ";
        actions = [
          { label: "📞 นัดคิวประเมินรูปหน้า", url: "tel:0891234567" },
          { label: "💬 ดูรีวิวฟิลเลอร์", query: "ขอดูรีวิวฟิลเลอร์หน่อยค่ะ" },
        ];
      } else if (lower.includes("นัด") || lower.includes("จอง") || lower.includes("คิว") || lower.includes("เวลา")) {
        replyText =
          "ยินดีเลยค่ะ! สำหรับการจองคิวตรวจ/ปรึกษาคุณหมอที่ ALA Clinic 🏥\n\n" +
          "🕒 **เวลาทำการ**: อังคาร - อาทิตย์ (11:00 - 20:00 น.) *หยุดทุกวันจันทร์*\n\n" +
          "คุณลูกค้าสามารถพิมพ์ **'ชื่อ - เบอร์โทรศัพท์ และวันเวลาที่สะดวก'** ไว้ที่นี่ได้เลยค่ะ หรือกดปุ่มโทรจองคิวด่วนกับเจ้าหน้าที่โดยตรงด้านล่างนี้ได้เลยนะคะ ✨";
        actions = [
          { label: "📞 โทรจองคิวด่วน: 089-123-4567", url: "tel:0891234567" },
          { label: "💬 ปรึกษาหัตถการอื่นเพิ่มเติม", query: "มีบริการอะไรอื่นอีกบ้างคะ" },
        ];
      } else {
        replyText =
          "ขอบคุณสำหรับคำถามนะคะคุณลูกค้า ✨ สำหรับหัวข้อนี้ หนิงขออนุญาตแนะนำให้เข้ามาปรึกษาและตรวจประเมินกับคุณหมอโดยตรงที่คลินิก เพื่อการวินิจฉัยที่ตรงจุดและปลอดภัยที่สุดค่ะ\n\n" +
          "คลินิกเรายินดีให้คำปรึกษาฟรี ไม่มีค่าใช้จ่ายเบื้องต้นค่ะ คุณลูกค้าสะดวกเข้ามาวันไหนดีคะ? หรือจะพิมพ์สอบถามข้อมูลโปรโมชั่นเพิ่มเติมก่อนได้เลยนะคะ 💖";
        actions = [
          { label: "💎 ดูโปรโมชั่นทั้งหมด", query: "โปรโมชั่นยอดนิยมเดือนนี้มีอะไรบ้างคะ" },
          { label: "📞 ติดต่อเจ้าหน้าที่คลินิก", url: "tel:0891234567" },
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: replyText,
          time: moment().format("HH:mm"),
          actions,
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        maxHeight: "100vh",
        backgroundColor: "#0F141C",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Prompt', 'Plus Jakarta Sans', sans-serif",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "fixed",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "300px",
          background: "radial-gradient(circle, rgba(233,192,112,0.15) 0%, rgba(15,20,28,0) 70%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Main Container (Mobile Frame on Desktop) */}
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#161B24",
          boxShadow: "0 0 40px rgba(0,0,0,0.6)",
          position: "relative",
          zIndex: 1,
          borderLeft: "1px solid rgba(233,192,112,0.2)",
          borderRight: "1px solid rgba(233,192,112,0.2)",
        }}
      >
        {/* Header Bar */}
        <header
          style={{
            padding: "14px 18px",
            backgroundColor: "#1A212D",
            borderBottom: "1px solid rgba(233,192,112,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <img
                src="/img/ALA_Clinic_icon.ico"
                alt="ALA Clinic"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "2px solid #E9C070",
                  backgroundColor: "#1E2430",
                  padding: "2px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "2px",
                  width: "11px",
                  height: "11px",
                  backgroundColor: "#2ecc71",
                  borderRadius: "50%",
                  border: "2px solid #161B24",
                }}
              />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#E9C070", fontWeight: "700", fontSize: "1.05rem", letterSpacing: "0.5px" }}>
                  ALA CLINIC
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(233,192,112,0.15)",
                    color: "#E9C070",
                    border: "1px solid rgba(233,192,112,0.4)",
                    fontSize: "0.65rem",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                >
                  AI CONSULTANT
                </span>
              </div>
              <small style={{ color: "#A0AEC0", fontSize: "0.72rem", display: "block" }}>
                ผู้ช่วยที่ปรึกษาความงามประจำคลินิก (พร้อมตอบ 24 ชม.)
              </small>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <a
              href="tel:0891234567"
              title="โทรด่วนหาคลินิก"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(85,197,217,0.15)",
                color: "#55C5D9",
                border: "1px solid rgba(85,197,217,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              <i className="fas fa-phone-alt" />
            </a>
            <button
              onClick={() => {
                if (window.confirm("ต้องการเริ่มการสนทนาใหม่ใช่หรือไม่?")) {
                  window.location.reload();
                }
              }}
              title="เริ่มแชทใหม่"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#CBD5E0",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              <i className="fas fa-redo-alt" />
            </button>
          </div>
        </header>

        {/* Starter Pills Bar */}
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#131720",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            overflowX: "auto",
            whiteSpace: "nowrap",
            display: "flex",
            gap: "8px",
            scrollbarWidth: "none",
          }}
        >
          {starterPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill.query)}
              style={{
                backgroundColor: "rgba(233,192,112,0.08)",
                border: "1px solid rgba(233,192,112,0.3)",
                color: "#E2E8F0",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: "500",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(233,192,112,0.2)";
                e.currentTarget.style.borderColor = "#E9C070";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(233,192,112,0.08)";
                e.currentTarget.style.borderColor = "rgba(233,192,112,0.3)";
              }}
            >
              <span>{pill.icon}</span>
              <span>{pill.text}</span>
            </button>
          ))}
        </div>

        {/* Messages Stream Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            backgroundColor: "#12161F",
          }}
        >
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: isBot ? "row" : "row-reverse",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                {/* Avatar */}
                {isBot && (
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      backgroundColor: "#1E2430",
                      border: "1.5px solid #E9C070",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "#E9C070",
                      fontSize: "0.85rem",
                    }}
                  >
                    <i className="fas fa-spa" />
                  </div>
                )}

                {/* Message Bubble Box */}
                <div style={{ maxWidth: "82%" }}>
                  <div
                    style={{
                      backgroundColor: isBot ? "#1F2633" : "linear-gradient(135deg, #C5953A 0%, #E9C070 100%)",
                      background: isBot ? "#1F2633" : "linear-gradient(135deg, #1E2430 0%, #293241 100%)",
                      color: isBot ? "#E2E8F0" : "#FFFFFF",
                      padding: "12px 16px",
                      borderRadius: isBot ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
                      border: isBot ? "1px solid rgba(233,192,112,0.2)" : "1px solid #E9C070",
                      fontSize: "0.88rem",
                      lineHeight: "1.55",
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* Optional Action Buttons Inside Bubble */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                      {msg.actions.map((act, aIdx) => (
                        act.url ? (
                          <a
                            key={aIdx}
                            href={act.url}
                            style={{
                              backgroundColor: "#2ecc71",
                              color: "#FFFFFF",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              textAlign: "center",
                              textDecoration: "none",
                              boxShadow: "0 2px 6px rgba(46,204,113,0.3)",
                            }}
                          >
                            {act.label}
                          </a>
                        ) : (
                          <button
                            key={aIdx}
                            onClick={() => handleSendMessage(act.query)}
                            style={{
                              backgroundColor: "rgba(233,192,112,0.12)",
                              border: "1px solid #E9C070",
                              color: "#E9C070",
                              padding: "7px 12px",
                              borderRadius: "8px",
                              fontSize: "0.78rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.2s",
                            }}
                          >
                            {act.label}
                          </button>
                        )
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "#718096",
                      marginTop: "3px",
                      textAlign: isBot ? "left" : "right",
                      padding: "0 2px",
                    }}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: "#1E2430",
                  border: "1.5px solid #E9C070",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#E9C070",
                  fontSize: "0.85rem",
                }}
              >
                <i className="fas fa-spa" />
              </div>
              <div
                style={{
                  backgroundColor: "#1F2633",
                  padding: "10px 16px",
                  borderRadius: "4px 16px 16px 16px",
                  border: "1px solid rgba(233,192,112,0.2)",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    backgroundColor: "#E9C070",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "pulse 1.2s infinite ease-in-out",
                  }}
                />
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    backgroundColor: "#E9C070",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "pulse 1.2s infinite ease-in-out 0.2s",
                  }}
                />
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    backgroundColor: "#E9C070",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "pulse 1.2s infinite ease-in-out 0.4s",
                  }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Form */}
        <div
          style={{
            padding: "12px 14px",
            backgroundColor: "#161B24",
            borderTop: "1px solid rgba(233,192,112,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1F2633",
              borderRadius: "28px",
              padding: "4px 6px 4px 16px",
              border: "1px solid rgba(233,192,112,0.3)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="พิมพ์คำถาม หรือปรึกษาเรื่องผิว..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: inputMessage.trim()
                  ? "linear-gradient(135deg, #E9C070 0%, #C5953A 100%)"
                  : "#2D3748",
                color: inputMessage.trim() ? "#1E2430" : "#718096",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: inputMessage.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                marginLeft: "6px",
                flexShrink: 0,
              }}
            >
              <i className="fas fa-paper-plane" style={{ fontSize: "0.95rem" }} />
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: "6px" }}>
            <small style={{ color: "#718096", fontSize: "0.68rem" }}>
              ⚡ ขับเคลื่อนด้วย AI ผู้ช่วยคลินิก • ข้อมูลปลอดภัยตามมาตรฐาน PDPA
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
