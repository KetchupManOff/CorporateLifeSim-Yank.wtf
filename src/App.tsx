import { useState, useEffect, useRef } from 'react';
import Desktop from './components/Desktop';
import LoginScreen from './sites/LoginScreen';
import { useGameStore } from './store/gameStore';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { tick } = useGameStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const mouseBuffersRef = useRef<AudioBuffer[]>([]);
  const keyboardBuffersRef = useRef<AudioBuffer[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    // Generate background computer hum and router modem buzz sounds
    const startAudio = async () => {
      if (audioContextRef.current) return;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      // Preload custom WAV files to prevent fetch latencies during typing/clicking
      const preloadCustomSounds = async (folder: string, prefix: string, count: number, isMouse: boolean) => {
        const buffers: AudioBuffer[] = [];
        // Support both "click1.wav" style and plain "1.wav" style
        const filenames = [
          ...Array.from({ length: count }, (_, i) => `${prefix}${i}.wav`),
          ...Array.from({ length: count }, (_, i) => `${prefix}${i + 1}.wav`),
          ...Array.from({ length: count }, (_, i) => `${i}.wav`),
          ...Array.from({ length: count }, (_, i) => `${i + 1}.wav`)
        ];
        
        // Filter unique names to avoid double fetching
        const uniqueFilenames = Array.from(new Set(filenames));

        for (const name of uniqueFilenames) {
          try {
            const url = `/sounds/${folder}/${name}`;
            const response = await fetch(url);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
              buffers.push(audioBuffer);
            }
          } catch (e) {
            // Ignore failed requests
          }
        }

        if (isMouse) {
          mouseBuffersRef.current = buffers;
        } else {
          keyboardBuffersRef.current = buffers;
        }
      };

      // Run preloading in background
      preloadCustomSounds('mouse', 'click', 5, true);
      preloadCustomSounds('keyboard', 'key', 5, false);

      // Try to load custom background fan hum sound from public/sounds/ambient/hum_loop.wav
      try {
        const response = await fetch('/sounds/ambient/hum_loop.wav');
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.loop = true;
          
          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          source.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          source.start();
        } else {
          // Fallback if file load fails
          playDefaultMonitorHum(ctx);
        }
      } catch (e) {
        // Fallback to synthesized hum if custom file fails
        playDefaultMonitorHum(ctx);
      }

      // 2. Dial-up/Router modem ambient data chatter (Filtered brown noise with random bandpass)
      // We'll generate a white-noise source and modulate a lowpass/bandpass filter
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.Q.setValueAtTime(10, ctx.currentTime);
      noiseFilter.frequency.setValueAtTime(800, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.003, ctx.currentTime); // Extremely subtle, non-intrusive

      // LFO to modulate filter to sound like data transmission packets
      const lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.setValueAtTime(4, ctx.currentTime); // 4Hz data bursts
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(300, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(noiseFilter.frequency);
      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start();
      lfo.start();
    };

    const playDefaultMonitorHum = (ctx: AudioContext) => {
      // 1. CRT Monitor Hum (Low frequency sine wave with slight gain distortion)
      const monitorHum = ctx.createOscillator();
      const humGain = ctx.createGain();
      monitorHum.type = 'sine';
      monitorHum.frequency.setValueAtTime(60, ctx.currentTime); // 60Hz CRT refresh rate hum
      humGain.gain.setValueAtTime(0.015, ctx.currentTime); // Quiet background hum
      monitorHum.connect(humGain);
      humGain.connect(ctx.destination);
      monitorHum.start();
    };

    // User click sound generator (Simulate microswitch tactile mouse click with custom audio files support)
    const playClickSound = () => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      
      // If custom mouse sound buffers are loaded, choose one randomly
      if (mouseBuffersRef.current.length > 0) {
        const randomBuffer = mouseBuffersRef.current[Math.floor(Math.random() * mouseBuffersRef.current.length)];
        const source = ctx.createBufferSource();
        source.buffer = randomBuffer;
        
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        source.start();
        return;
      }

      // Synthesized microswitch click fallback
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);

      clickGain.gain.setValueAtTime(0.08, ctx.currentTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(clickGain);
      clickGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    };

    // Keyboard press sound generator
    const playKeyboardSound = () => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;

      // If custom keyboard sound buffers are loaded, choose one randomly
      if (keyboardBuffersRef.current.length > 0) {
        const randomBuffer = keyboardBuffersRef.current[Math.floor(Math.random() * keyboardBuffersRef.current.length)];
        const source = ctx.createBufferSource();
        source.buffer = randomBuffer;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start();
        return;
      }

      // Synthesized key press fallback
      const osc = ctx.createOscillator();
      const keyGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);

      keyGain.gain.setValueAtTime(0.05, ctx.currentTime);
      keyGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(keyGain);
      keyGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    };

    // Attach startAudio on first interaction (required by browsers before audio context starts)
    const handleFirstInteraction = () => {
      startAudio();
    };

    window.addEventListener('click', handleFirstInteraction);
    // Bind click sound globally
    window.addEventListener('mousedown', playClickSound);
    // Bind keydown sound globally
    window.addEventListener('keydown', playKeyboardSound);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('mousedown', playClickSound);
      window.removeEventListener('keydown', playKeyboardSound);
    };
  }, []);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Desktop />
  );
}

export default App;