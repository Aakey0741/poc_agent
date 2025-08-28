const BASE = import.meta.env.VITE_AGENT_BASE_URL || 'http://localhost:5000'
// export async function sendOnce(payload) {
//     const r = await fetch(`${BASE}/chat`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//     })
//     return r.json()
// }
export function streamChat(payload, onToken, onDone, onError, setMessages) {
    const ctrl = new AbortController()
    fetch(`${BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // signal: ctrl.signal
    }).then(async (res) => {
        const reader = res.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const parts = buffer.split("\n\n")
            const simpleJsonData = JSON.parse(parts);
            console.log({ simpleJsonData })
            console.log({ ctrl })
            setMessages(m => [...m, { role: 'bot', content: simpleJsonData.response }])
            // buffer = parts.pop()
            // for (const part of parts) {
            //     if (!part.startsWith('data:')) continue
            //     const data = part.replace(/^data:\s*/, '')
            //     if (data === '[DONE]') { onDone?.(); return }
            //     onToken?.(data)
            // }
        }
        onDone?.()
    }).catch(err => onError?.(err))
    return () => ctrl.abort()
}