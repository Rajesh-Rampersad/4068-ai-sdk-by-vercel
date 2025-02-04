// 'use client'

// import Button from '../Button';
// import ChatBubble from '../ChatBubble';
// import { ChatForm } from '../ChatForm';
// import { ChatHeader } from '../ChatHeader';
// import { IconStop } from '../Icons';
// import { Loader } from '../Loader';
// import { RetryButton } from '../RetryButton';
// import styles from './container.module.css';
// import { useChat } from 'ai/react';

// export const ChatContainer = () => {


//     const { messages, input, handleInputChange, handleSubmit } = useChat()
//     return (
//         <section className={styles.container}>
//             <ChatHeader />
//             <div className={styles.chat}>
                
//                 {messages.map((msg) => (
//                     <ChatBubble
//                         key={msg.id}
//                         message={msg.content}
//                         isUser={msg.role == 'user'} 
//                         onRemove={() => console.log('remove message', msg.id)}
//                     />
//                 ))}

//             </div>
//             <ChatForm
//                 input={input}
//                 handleInputChange={handleInputChange}
//                 handleSubmit={handleSubmit}
//             />
//         </section>
//     );
// };



// chatContainer/index.jsx
'use client'

import { useState } from 'react';
import ChatBubble from '../ChatBubble';
import { ChatForm } from '../ChatForm';
import { ChatHeader } from '../ChatHeader';
import styles from './container.module.css';
import { Loader } from '../Loader';

export const ChatContainer = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => setInput(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = { id: Date.now(), content: input, role: 'user' };
        setMessages([...messages, newMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input })
            });

            if (!res.ok) throw new Error("Error en la respuesta");

            // 🔥 Cambio aquí: ahora extraemos "text"
            const { text } = await res.json();  

            setMessages(prev => [...prev, { id: Date.now(), content: text, role: 'assistant' }]);

        } catch (error) {
            console.error("Error al obtener respuesta:", error);
        } finally {
            setLoading(false); // Desactivamos el indicador de carga
        }
    };

    return (
        <section className={styles.container}>
            <ChatHeader />
            <div className={styles.chat}>
                {messages.map((msg) => (
                    <ChatBubble
                        key={msg.id}
                        message={msg.content}
                        isUser={msg.role === 'user'}
                    />
                ))}
                {loading && <Loader />} {/* Indicador de carga */}
            </div>
            <ChatForm
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
            />
        </section>
    );
};
