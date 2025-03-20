document.addEventListener('DOMContentLoaded', () => {
    const chatSection = document.getElementById('chatSection');
    const chatMessages = document.getElementById('chatMessages');
    const stopSection = document.getElementById('stopSection');
    const questionInput = document.getElementById('questionInput');
    const sendButton = document.getElementById('sendButton');
    const voiceButton = document.getElementById('voiceButton');
    const homeButton = document.getElementById('homeButton');
    const funFactButton = document.getElementById('funFactButton');
    const funFactPopup = document.getElementById('funFactPopup');
    const funFactText = document.getElementById('funFactText');
    const closePopup = document.getElementById('closePopup');
    const confirmPopup = document.getElementById('confirmPopup');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const closeConfirmPopup = document.getElementById('closeConfirmPopup');

    // Store conversation history and context
    let conversationHistory = [];
    let sessionContext = '';
    let typingBubble = null;

    // Fun facts about Jindal School of Management
    const funFacts = [
        "The Jindal School is named after Naveen Jindal, a 1992 MBA alumnus who made the largest alumni gift to UT Dallas at the time.",
        "JSOM’s Online MBA program was ranked No. 1 in the U.S. by U.S. News & World Report in 2025.",
        "The school has over 10,000 students, making it the largest and fastest-growing school at UT Dallas.",
        "JSOM broke ground on a new 125,000-square-foot building in October 2024, set to open in 2026.",
        "The Jindal School offers Bachelor of Science degrees instead of BBAs, emphasizing a unique educational approach.",
        "JSOM hosts over 50 academic institutions at its annual Business Analytics Summit.",
        "Naveen Jindal, the school’s namesake, is a prominent industrialist and statesman in India."
    ];

    // Start Session (Chat is always visible, no start button)
    chatSection.style.display = 'block';
    stopSection.style.display = 'none';

    // Scroll to bottom of chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Adjust textarea height dynamically
    function adjustTextareaHeight() {
        questionInput.style.height = 'auto';
        questionInput.style.height = `${Math.min(questionInput.scrollHeight, 120)}px`;
    }

    // Add a chat message
    function addChatMessage(content, isUser = false, audioSrc = null, link = '', contact = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const messageContent = document.createElement('p');
        messageContent.textContent = content;
        messageDiv.appendChild(messageContent);

        if (audioSrc) {
            const audioControls = document.createElement('div');
            audioControls.className = 'audio-controls';

            const audio = document.createElement('audio');
            audio.src = audioSrc;
            audio.id = `audio-${conversationHistory.length}`;
            audio.style.display = 'none';
            messageDiv.appendChild(audio);

            const playButton = document.createElement('button');
            playButton.className = 'play-btn';
            playButton.textContent = 'Play';
            playButton.onclick = () => {
                audio.play();
            };

            const stopButton = document.createElement('button');
            stopButton.className = 'stop-btn';
            stopButton.textContent = 'Stop';
            stopButton.onclick = () => {
                audio.pause();
                audio.currentTime = 0;
            };

            audioControls.appendChild(playButton);
            audioControls.appendChild(stopButton);
            messageDiv.appendChild(audioControls);
        }

        if (link) {
            const linkP = document.createElement('p');
            linkP.innerHTML = `<strong>Source:</strong> <a href="${link}" target="_blank" class="source-link">${link}</a>`;
            messageDiv.appendChild(linkP);
        }

        if (contact) {
            const contactP = document.createElement('p');
            contactP.textContent = `Contact: ${contact}`;
            messageDiv.appendChild(contactP);
        }

        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Add typing bubble
    function addTypingBubble() {
        typingBubble = document.createElement('div');
        typingBubble.className = 'typing-bubble';
        typingBubble.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingBubble);
        scrollToBottom();
    }

    // Remove typing bubble
    function removeTypingBubble() {
        if (typingBubble) {
            typingBubble.remove();
            typingBubble = null;
        }
    }

    // Submit Question
    window.submitQuestion = async () => {
        const textQuestion = questionInput.value.trim();
        if (!textQuestion) {
            addChatMessage("Please enter a question.", false);
            return;
        }

        // Add user message to chat and clear input immediately
        addChatMessage(textQuestion, true);
        questionInput.value = ''; // Clear input right after adding the message
        adjustTextareaHeight();
        conversationHistory.push({ question: textQuestion });

        const formData = new FormData();
        formData.append('text_question', textQuestion);
        formData.append('context', sessionContext);

        addTypingBubble();

        try {
            const response = await fetch('/ask', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            removeTypingBubble();

            // Update context
            sessionContext += `\nUser: ${textQuestion}\nCometVerse: ${data.answer}`;

            // Add bot response to chat
            addChatMessage(data.answer, false, data.audio, data.link || '', data.contact || '');

            // Update history
            conversationHistory[conversationHistory.length - 1].answer = data.answer;
            conversationHistory[conversationHistory.length - 1].link = data.link || '';
            conversationHistory[conversationHistory.length - 1].contact = data.contact || '';
            conversationHistory[conversationHistory.length - 1].audio = data.audio;
        } catch (error) {
            removeTypingBubble();
            addChatMessage(`Error: ${error.message}`, false);
        }
    };

    // Stop Session
    window.stopSession = () => {
        chatSection.style.display = 'none';
        stopSection.style.display = 'block';
    };

    // Save as PDF
    window.saveAsPDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let yOffset = 10;

        doc.setFontSize(16);
        doc.setTextColor(245, 128, 37);
        doc.text('CometVerse Chatbot - Jindal School History', 10, yOffset);
        yOffset += 10;

        doc.setFontSize(12);
        conversationHistory.forEach((entry, index) => {
            doc.setTextColor(0, 132, 61);
            doc.text(`Q${index + 1}: ${entry.question}`, 10, yOffset);
            yOffset += 10;

            doc.setTextColor(224, 224, 224);
            doc.text(`A${index + 1}: ${entry.answer}`, 10, yOffset);
            yOffset += 10;

            if (entry.link) {
                doc.setTextColor(245, 128, 37);
                doc.textWithLink(`Source: ${entry.link}`, 10, yOffset, { url: entry.link });
                yOffset += 5;
            }

            if (entry.contact) {
                doc.setTextColor(136, 136, 136);
                doc.text(`Contact: ${entry.contact}`, 10, yOffset);
                yOffset += 5;
            }

            yOffset += 5;
            if (yOffset > 270) {
                doc.addPage();
                yOffset = 10;
            }
        });

        doc.save('CometVerse_Jindal_School_Conversation.pdf');
    };

    // Start Over (called after confirmation)
    window.startOver = () => {
        chatSection.style.display = 'block';
        stopSection.style.display = 'none';
        conversationHistory = [];
        sessionContext = '';
        chatMessages.innerHTML = `
            <div class="chat-message bot-message">
                <p>Welcome to CometVerse! Ask me anything about the Jindal School of Management.</p>
            </div>
        `;
        questionInput.value = '';
        adjustTextareaHeight();
    };

    // Home Button - Show Confirmation Popup
    homeButton.addEventListener('click', () => {
        confirmPopup.style.display = 'block';
    });

    // Confirmation Popup - Yes
    confirmYes.addEventListener('click', () => {
        confirmPopup.style.display = 'none';
        startOver();
    });

    // Confirmation Popup - No
    confirmNo.addEventListener('click', () => {
        confirmPopup.style.display = 'none';
    });

    // Confirmation Popup - Close
    closeConfirmPopup.addEventListener('click', () => {
        confirmPopup.style.display = 'none';
    });

    // Confirmation Popup - Close when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === confirmPopup) {
            confirmPopup.style.display = 'none';
        }
    });

    // Voice input setup
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        voiceButton.addEventListener('click', () => {
            recognition.start();
            voiceButton.textContent = '🎤 Listening...';
            voiceButton.disabled = true;
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            questionInput.value = transcript;
            voiceButton.textContent = '🎤';
            voiceButton.disabled = false;
            adjustTextareaHeight();
            submitQuestion();
        };

        recognition.onerror = (event) => {
            addChatMessage(`Voice input error: ${event.error}`, false);
            voiceButton.textContent = '🎤';
            voiceButton.disabled = false;
        };

        recognition.onend = () => {
            voiceButton.textContent = '🎤';
            voiceButton.disabled = false;
        };
    } else {
        voiceButton.style.display = 'none';
    }

    // Show random fun fact
    funFactButton.addEventListener('click', () => {
        const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
        funFactText.textContent = randomFact;
        funFactPopup.style.display = 'block';
    });

    // Close fun fact popup
    closePopup.addEventListener('click', () => {
        funFactPopup.style.display = 'none';
    });

    // Close fun fact popup when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === funFactPopup) {
            funFactPopup.style.display = 'none';
        }
    });

    // Send button click
    sendButton.addEventListener('click', submitQuestion);

    // Enter key to submit, Shift+Enter for new line
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitQuestion();
        }
    });

    // Adjust textarea height on input
    questionInput.addEventListener('input', adjustTextareaHeight);

    // Initial height adjustment
    adjustTextareaHeight();
});