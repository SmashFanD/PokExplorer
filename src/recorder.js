let recording = false;
let mediaRecorder;
let chunks = [];

export async function recordAndSave() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  chunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = event => chunks.push(event.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screen-recording.webm';
    a.click();
  };

  mediaRecorder.start();
}

export function toggleRecording() {
  recording = !recording;
  if (recording) recordAndSave();
  else mediaRecorder?.stop();
}