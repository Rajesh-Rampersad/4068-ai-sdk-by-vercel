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

import { useState, useRef } from 'react';
import ChatBubble from '../ChatBubble';
import { ChatForm } from '../ChatForm';
import { ChatHeader } from '../ChatHeader';
import styles from './container.module.css';
import { Loader } from '../Loader';
import Button from '../Button';
import { IconStop, } from '../Icons';
import { RetryButton } from '../RetryButton';

export const ChatContainer = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [stop, setStop] = useState(false);
    const [lastPrompt, setLastPrompt] = useState(''); // Guardar la última consulta
    const controllerRef = useRef(null);

    const handleInputChange = (e) => setInput(e.target.value);

    const fetchResponse = async (prompt) => {
        setLoading(true);
        setStop(false);

        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
                signal: controller.signal, 
            });

            if (!res.ok) throw new Error("Error en la respuesta");

            const { text } = await res.json();  
            setMessages(prev => [...prev, { id: Date.now(), content: text, role: 'assistant' }]);
            setStop(true);

        } catch (error) {
            if (error.name === "AbortError") {
                console.log("La solicitud fue cancelada.");
            } else {
                console.error("Error al obtener respuesta:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = { id: Date.now(), content: input, role: 'user' };
        setMessages([...messages, newMessage]);
        setLastPrompt(input); // Guardamos el último prompt
        setInput('');

        await fetchResponse(input);
    };

    const handleStop = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
            setStop(true);
            setLoading(false);
        }
    };

    const handleReload = () => {
        if (lastPrompt) {
            fetchResponse(lastPrompt); // Repetir la última consulta
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
            </div>

            {loading && (
                <div>
                    <Loader />
                    <Button variant='danger' onClick={handleStop}>
                        <IconStop /> Parar
                    </Button>
                </div>
            )}

            {!loading && lastPrompt && (
                <div>
                    <Button variant='primary' onClick={handleReload}>
                        <RetryButton /> 
                    </Button>
                </div>
            )}

            <ChatForm
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
            />
        </section>
    );
};
