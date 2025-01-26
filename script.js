document.addEventListener('DOMContentLoaded', () => {
    const emojiContainer = document.querySelector('.emoji-container');
    const youtubeInput = document.getElementById('youtube-link');
    const loadingDiv = document.getElementById('loading');
    const audioClip = document.getElementById('audio-clip');
    const buttonContainer = document.querySelector('.button-container');
    const saveButton = document.getElementById('save-clip');
    const retryButton = document.getElementById('retry');
    const shareButton = document.getElementById('share');

    const vibes = [
        { emoji: '🌙', type: 'slow_reverb', name: 'Dreamy' },
        { emoji: '🎉', type: 'energetic', name: 'Energetic' },
        { emoji: '🖤', type: 'dark', name: 'Dark' },
        { emoji: '💖', type: 'cute', name: 'Cute' },
        { emoji: '😎', type: 'cool', name: 'Cool' },
        { emoji: '🌈', type: 'happy', name: 'Happy' },
        { emoji: '🔥', type: 'intense', name: 'Intense' },
        { emoji: '🎶', type: 'melodic', name: 'Melodic' },
        { emoji: '🌿', type: 'chill', name: 'Chill' },
        { emoji: '💤', type: 'sleepy', name: 'Sleepy' }
    ];

    let selectedVibe = null;
    let processedAudioUrl = null;

    // Create emoji buttons with tooltips
    vibes.forEach(vibe => {
        const emojiWrapper = document.createElement('div');
        emojiWrapper.classList.add('emoji-wrapper');
        
        const emoji = document.createElement('span');
        emoji.textContent = vibe.emoji;
        emoji.classList.add('emoji');
        
        const tooltip = document.createElement('span');
        tooltip.classList.add('tooltip');
        tooltip.textContent = vibe.name;
        
        emojiWrapper.appendChild(emoji);
        emojiWrapper.appendChild(tooltip);
        emojiContainer.appendChild(emojiWrapper);

        emoji.addEventListener('click', () => {
            document.querySelectorAll('.emoji').forEach(e => e.classList.remove('selected'));
            emoji.classList.add('selected');
            selectedVibe = vibe;
            
            // If we have a processed audio and select a new vibe, enable retry
            if (processedAudioUrl) {
                buttonContainer.classList.remove('hidden');
            }
        });
    });

    async function processYouTubeLink(url, vibeType) {
        try {
            loadingDiv.classList.remove('hidden');
            buttonContainer.classList.add('hidden');
            audioClip.classList.add('hidden');

            const response = await fetch('/api/transform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    effect_type: vibeType
                })
            });

            // Check if response is ok
            if (!response.ok) {
                let errorText;
                try {
                    // Try to parse error as JSON
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorText = errorData.error || 'Failed to process audio';
                    } else {
                        // If not JSON, get text
                        errorText = await response.text();
                        // If it starts with 'A server error occurred', clean it up
                        if (errorText.startsWith('A server error occurred')) {
                            errorText = 'Server error: Failed to process audio. Please try a different video.';
                        }
                    }
                } catch (e) {
                    errorText = 'Failed to process audio. Please try a different video.';
                }
                throw new Error(errorText);
            }

            // Check content type
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process audio');
            }

            // Handle audio response
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            
            // Update audio player
            audioClip.src = audioUrl;
            audioClip.classList.remove('hidden');
            buttonContainer.classList.remove('hidden');
            
            // Start playing automatically
            try {
                await audioClip.play();
            } catch (playError) {
                console.log('Auto-play failed:', playError);
            }
            
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            loadingDiv.classList.add('hidden');
        }
    }

    function showError(message) {
        alert(message);
    }

    youtubeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && selectedVibe) {
            const url = youtubeInput.value.trim();
            if (url) {
                processYouTubeLink(url, selectedVibe.type);
            }
        }
    });

    saveButton.addEventListener('click', () => {
        if (processedAudioUrl) {
            const a = document.createElement('a');
            a.href = processedAudioUrl;
            a.download = `moodify_${selectedVibe.type}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });

    retryButton.addEventListener('click', () => {
        const url = youtubeInput.value.trim();
        if (url && selectedVibe) {
            processYouTubeLink(url, selectedVibe.type);
        }
    });

    shareButton.addEventListener('click', () => {
        if (processedAudioUrl) {
            // Implement sharing functionality here
            alert('Sharing coming soon!');
        }
    });

    // Add audio player controls
    audioClip.addEventListener('play', () => {
        audioClip.classList.add('playing');
    });

    audioClip.addEventListener('pause', () => {
        audioClip.classList.remove('playing');
    });

    audioClip.addEventListener('ended', () => {
        audioClip.classList.remove('playing');
    });
});