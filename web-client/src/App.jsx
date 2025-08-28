import { useEffect, useRef, useState } from 'react'
import './styles.css'
import { streamChat } from './api'

function Message({ role, content }) {
  return <div className={"msg " + (role === 'user' ? 'user' : 'bot')} dangerouslySetInnerHTML={{ __html: content }}></div>
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: `Hey Aakey! I\'m Broco — your AI Agent. Ask me
for products or say your user id to fetch your profile.Try: "Show me
filament under 1400"` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])
  const send = () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    const abort = streamChat({ message: userMsg.content, thread_id: 101 },
      (token) => {
        setMessages(m => {
          const copy = [...m]
          const last = copy[copy.length - 1]
          last.content += token
          return copy
        })
      },
      () => setLoading(false),
      () => setLoading(false),
      setMessages
    )
    return abort
  }
  // console.log({messages})
  return (
    <div className="container">
      <h2>Broco × Aakey — AI Agent</h2>
      <div className="small">Streaming with typing effect. Backend tools:
        Node API + LLM routing.</div>
      <div ref={scrollRef} className="messages card">
        {messages.map((m, i) => <Message key={i} role={m.role}
          content={m.content} />)}
      </div>
      <div className="inputbar">
        <input type="text" value={input} onChange={e =>
          setInput(e.target.value)} placeholder="Type a task…" onKeyDown={e => e.key
            === 'Enter' ? send() : null} />
        <button onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  )
}
