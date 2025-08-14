
        let liveAudio = null;
        let database = null;

        // Configuración de Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDHxvxILBO9zY42EcIDcBSTTTGkGXqK61k",
            authDomain: "lfm-radio-750cb.firebaseapp.com",
            databaseURL: "https://lfm-radio-750cb-default-rtdb.firebaseio.com",
            projectId: "lfm-radio-750cb",
            storageBucket: "lfm-radio-750cb.firebasestorage.app",
            messagingSenderId: "476508090552",
            appId: "1:476508090552:web:c5b343123ea472fcdf444d",
            measurementId: "G-XM288R8CDD"
        };

        // Inicializar Firebase
        try {
            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            console.log('🔥 Firebase conectado correctamente a LFM Radio');
            console.log('Database URL:', firebaseConfig.databaseURL);
        } catch (error) {
            console.error('Error conectando Firebase:', error);
            console.log('Usando chat local como respaldo');
        }

        // Función para reproducir LFM Radio directamente
        function playLFMRadio() {
            // Poner la URL de LFM Radio en el campo
            document.getElementById('streamUrl').value = 'https://uk6freenew.listen2myradio.com/live.mp3?typeportmount=s1_8571_stream_296700849';
            
            // Reproducir automáticamente
            playLiveStream();
        }

        // Función para abrir WhatsApp con dedicatoria
        function openWhatsAppDedication() {
            const phoneNumber = "573218384587"; // Número con código de país de Colombia
            const message = "¡Hola! Me gustaría dedicar una canción en la radio 🎵";
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            
            // Abrir en nueva pestaña
            window.open(whatsappUrl, '_blank');
        }

        // Funciones del chat con Firebase
        function initializeChat() {
            if (!database) {
                console.log('Usando chat local');
                return;
            }

            // Escuchar mensajes en tiempo real
            const messagesRef = database.ref('messages');
            messagesRef.limitToLast(50).on('child_added', (snapshot) => {
                const message = snapshot.val();
                displayMessageFromFirebase(message);
            });

            // Limpiar mensajes antiguos (más de 100)
            messagesRef.on('value', (snapshot) => {
                const messages = snapshot.val();
                if (messages && Object.keys(messages).length > 100) {
                    const oldestKey = Object.keys(messages)[0];
                    messagesRef.child(oldestKey).remove();
                }
            });
        }

        function sendMessage() {
            const messageInput = document.getElementById('chatInput');
            const userName = document.getElementById('userName').value || 'Anónimo';
            const messageText = messageInput.value.trim();

            if (messageText === '') return;

            const message = {
                author: userName,
                content: messageText,
                timestamp: Date.now(),
                time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
            };

            if (database) {
                // Enviar a Firebase
                database.ref('messages').push(message).then(() => {
                    console.log('Mensaje enviado a Firebase');
                }).catch((error) => {
                    console.error('Error enviando mensaje:', error);
                    // Fallback a chat local
                    displayMessageFromFirebase(message);
                });
            } else {
                // Fallback local
                displayMessageFromFirebase(message);
            }

            messageInput.value = '';
            
            // Auto-scroll al final
            const chatContainer = document.getElementById('chatMessages');
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
        }

        function displayMessageFromFirebase(message) {
            const chatContainer = document.getElementById('chatMessages');
            
            // Evitar duplicados
            const existingMessages = chatContainer.querySelectorAll('.chat-message.user');
            for (let msg of existingMessages) {
                const msgContent = msg.querySelector('.message-content').textContent;
                const msgAuthor = msg.querySelector('.message-author').textContent;
                const msgTime = msg.querySelector('.message-time').textContent;
                
                if (msgContent === message.content && 
                    msgAuthor === message.author && 
                    msgTime === message.time) {
                    return; // Ya existe
                }
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message user';
            
            // Filtrar palabras inapropiadas básicas
            const cleanContent = filterBadWords(message.content);
            
            messageDiv.innerHTML = `
                <div class="message-author">${escapeHtml(message.author)}</div>
                <div class="message-content">${escapeHtml(cleanContent)}</div>
                <div class="message-time">${message.time}</div>
            `;
            
            chatContainer.appendChild(messageDiv);

            // Mantener máximo 50 mensajes visibles
            if (chatContainer.children.length > 51) { // +1 por el mensaje del sistema
                const userMessages = chatContainer.querySelectorAll('.chat-message.user');
                if (userMessages.length > 50) {
                    chatContainer.removeChild(userMessages[0]);
                }
            }

            // Auto-scroll
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function filterBadWords(text) {
            const badWords = ['puta', 'pendejo', 'marica', 'gonorrea']; // Agregar más si necesitas
            let filtered = text;
            badWords.forEach(word => {
                const regex = new RegExp(word, 'gi');
                filtered = filtered.replace(regex, '*'.repeat(word.length));
            });
            return filtered;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Permitir enviar con Enter
        document.addEventListener('DOMContentLoaded', function() {
            const chatInput = document.getElementById('chatInput');
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });

            // Inicializar chat
            setTimeout(initializeChat, 1000);
        });

        // Funciones para información del DJ
        function updateDJInfo() {
            const djName = document.getElementById('djNameInput').value;
            const djAvatar = document.getElementById('djAvatarInput').value;

            if (djName) {
                document.getElementById('djName').textContent = djName;
                document.getElementById('djNameInput').value = '';
            }

            if (djAvatar) {
                document.getElementById('djAvatar').src = djAvatar;
                document.getElementById('djAvatarInput').value = '';
            }

            // Animación de confirmación
            const djSection = document.querySelector('.dj-section');
            djSection.style.transform = 'scale(1.02)';
            setTimeout(() => {
                djSection.style.transform = 'scale(1)';
            }, 200);
        }

        // Funciones para stream en vivo
        function playLiveStream() {
            const audioElement = document.getElementById('lfmPlayer');
            if (!audioElement) return;
            audioElement.play().then(() => {
                document.getElementById('liveEqualizer').style.display = 'flex';
            }).catch(err => {
                console.error('Error al reproducir:', err);
                alert('No se pudo reproducir el stream');
            });
        }

            stopLocalPlayback();

            if (liveAudio) {
                liveAudio.pause();
            }

            liveAudio = new Audio(streamUrl);
            liveAudio.volume = document.getElementById('liveVolume').value / 100;
            
            liveAudio.play().then(() => {
                document.getElementById('liveEqualizer').style.display = 'flex';
            }).catch(error => {
                alert('Error al reproducir el stream. Verifica la URL.');
                console.error('Error:', error);
            });
        }

        function stopLiveStream() {
            const audioElement = document.getElementById('lfmPlayer');
            if (!audioElement) return;
            audioElement.pause();
            document.getElementById('liveEqualizer').style.display = 'none';
        }
        }

        function setLiveVolume(value) {
            if (liveAudio) {
                liveAudio.volume = value / 100;
            }
        }

        // Funciones para stream en vivo
        function playLiveStream() {
            const streamUrl = document.getElementById('streamUrl').value;
            if (!streamUrl) {
                alert('Por favor ingresa una URL de stream válida');
                return;
            }

            if (liveAudio) {
                liveAudio.pause();
            }

            liveAudio = new Audio(streamUrl);
            liveAudio.volume = document.getElementById('liveVolume').value / 100;
            
            liveAudio.play().then(() => {
                document.getElementById('currentTrackDisplay').textContent = '🔴 Transmisión en Vivo';
                document.getElementById('liveEqualizer').style.display = 'flex';
            }).catch(error => {
                alert('Error al reproducir el stream. Verifica la URL.');
                console.error('Error:', error);
            });
        }

        function stopLiveStream() {
            if (liveAudio) {
                liveAudio.pause();
                liveAudio = null;
                document.getElementById('liveEqualizer').style.display = 'none';
                document.getElementById('currentTrackDisplay').textContent = 'Stream detenido';
            }
        }

        function setLiveVolume(value) {
            if (liveAudio) {
                liveAudio.volume = value / 100;
            }
        }

        // Inicialización
        window.addEventListener('load', () => {
            console.log('LFM Radio cargada correctamente');
            
            // Precargar la URL de LFM Radio
            document.getElementById('streamUrl').value = 'https://uk6freenew.listen2myradio.com/live.mp3?typeportmount=s1_8571_stream_296700849';
            
            // Mensaje de bienvenida con instrucciones
            setTimeout(() => {
                const welcomeMsg = {
                    author: 'LFM Radio',
                    content: '🎵 ¡Bienvenidos al chat de LFM Radio! Pidan sus canciones favoritas y compartan con otros oyentes. ¡La música nos une! 📻',
                    time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
                };
                displayMessageFromFirebase(welcomeMsg);
            }, 2000);
        });
    


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Config Firebase (tuya)
const firebaseConfig = {
  apiKey: "AIzaSyDHxvxILBO9zY42EcIDcBSTTTGkGXqK61k",
  authDomain: "lfm-radio-750cb.firebaseapp.com",
  databaseURL: "https://lfm-radio-750cb-default-rtdb.firebaseio.com/",
  projectId: "lfm-radio-750cb",
  storageBucket: "lfm-radio-750cb.firebasestorage.app",
  messagingSenderId: "476508090552",
  appId: "1:476508090552:web:c5b343123ea472fcdf444d",
  measurementId: "G-XM288R8CDD"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elementos del DOM según tu HTML
const elMessages = document.getElementById("chatMessages");
const elInput = document.getElementById("chatInput");
const elName = document.getElementById("userName");

// Referencia del chat global
const chatRef = ref(db, "mensajes");

// Pintar un mensaje
function appendMessage(usuario, texto, timestamp){
  const cont = document.createElement("div");
  cont.className = "chat-message";
  const time = new Date(timestamp || Date.now()).toLocaleTimeString();
  cont.innerHTML = `<span class="message-user">[${time}] ${usuario}:</span> <span class="message-content">${texto}</span>`;
  elMessages.appendChild(cont);
  elMessages.scrollTop = elMessages.scrollHeight;
}

// Escuchar nuevos mensajes en tiempo real
onChildAdded(chatRef, (snap) => {
  const data = snap.val();
  appendMessage(data.usuario || "Anónimo", data.texto || "", data.timestamp);
});

// Enviar mensaje
window.sendMessage = function () {
  const usuario = (elName && elName.value.trim()) ? elName.value.trim() : "Anónimo";
  const texto = elInput ? elInput.value.trim() : "";
  if (!texto) return;
  push(chatRef, { usuario, texto, timestamp: Date.now() });
  elInput.value = "";
};
