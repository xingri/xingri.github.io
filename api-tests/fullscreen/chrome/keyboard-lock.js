const fullscreenButton = document.querySelector('#fullscreen');
const lockBothButton = document.querySelector('#lock-both');
const lockButton = document.querySelector('#keyboard');
const unlockButton = document.querySelector('#unlock');
const status = document.querySelector('#status');
const eventLog = document.querySelector('#event-log');
const pointerLockArea = document.querySelector('#lock-area');
const pointerStatus = document.querySelector('#pointer-status');
const coordinates = document.querySelector('#coordinates');
const releasePointerButton = document.querySelector('#release');
let keyboardLocked = false;
let pointerX = 0;
let pointerY = 0;
function setStatus(message) { status.textContent = message; }
function updateControls() {
  const fullscreen = document.fullscreenElement === document.documentElement;
  fullscreenButton.textContent = fullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
  lockBothButton.disabled = !fullscreen || keyboardLocked;
  lockButton.disabled = !fullscreen || keyboardLocked;
  unlockButton.disabled = !keyboardLocked;
}
async function requestCombinedPointerLock() {
  if (!pointerLockArea?.requestPointerLock) {
    throw new Error('Pointer Lock API is unavailable in this browser.');
  }
  try {
    await pointerLockArea.requestPointerLock({ unadjustedMovement: true });
  } catch (error) {
    // Some Chromium configurations reject raw input but support normal lock.
    await pointerLockArea.requestPointerLock();
  }
}
document.addEventListener('pointerlockchange', () => {
  const pointerLocked = document.pointerLockElement === pointerLockArea;
  pointerLockArea.classList.toggle('locked', pointerLocked);
  releasePointerButton.disabled = !pointerLocked;
  pointerStatus.textContent = pointerLocked ? 'Pointer is locked. Press Esc to release it.' : 'Pointer is not locked.';
});
document.addEventListener('pointerlockerror', () => { pointerStatus.textContent = 'Pointer lock was denied by the browser.'; });
document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement !== pointerLockArea) return;
  pointerX += event.movementX;
  pointerY += event.movementY;
  coordinates.textContent = `Movement: x ${pointerX}, y ${pointerY} (last: ${event.movementX}, ${event.movementY})`;
});
releasePointerButton.addEventListener('click', () => document.exitPointerLock());
pointerLockArea.addEventListener('click', async () => {
  try { await requestCombinedPointerLock(); }
  catch (error) { pointerStatus.textContent = `Pointer lock failed: ${error.message}`; }
});
fullscreenButton.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch (error) { setStatus(`Fullscreen failed: ${error.message}`); } });
lockButton.addEventListener('click', async () => {
  if (!navigator.keyboard?.lock) { setStatus('Keyboard Lock API is unavailable in this browser.'); return; }
  try { await navigator.keyboard.lock(); keyboardLocked = true; window.keyboardLockActive = true; setStatus('Keyboard is locked. Try a shortcut below.'); updateControls(); } catch (error) { setStatus(`Keyboard lock failed: ${error.message}`); }
});
lockBothButton.addEventListener('click', async () => {
  if (!isSecureContext) {
    setStatus('Keyboard Lock requires HTTPS (or localhost). Reload this page from a secure origin.');
    return;
  }
  try {
    // Start both requests in this button's user-activation event.
    const pointerLockRequest = requestCombinedPointerLock();
    if (!navigator.keyboard?.lock) {
      await pointerLockRequest;
      setStatus('Pointer lock requested. Keyboard Lock is not exposed by this Chromium build.');
      return;
    }
    await Promise.all([navigator.keyboard.lock(), pointerLockRequest]);
    keyboardLocked = true;
    window.keyboardLockActive = true;
    setStatus('Keyboard and pointer lock requested together.');
    updateControls();
  } catch (error) {
    navigator.keyboard.unlock();
    setStatus(`Combined lock failed: ${error.message}`);
  }
});
unlockButton.addEventListener('click', () => { navigator.keyboard?.unlock(); keyboardLocked = false; window.keyboardLockActive = false; setStatus('Keyboard lock released.'); updateControls(); });
document.addEventListener('keydown', (event) => {
  if (!keyboardLocked) return;
  eventLog.textContent = `${event.code} (${event.key})${event.ctrlKey ? ' + Ctrl' : ''}${event.metaKey ? ' + Command' : ''}${event.altKey ? ' + Alt' : ''}${event.shiftKey ? ' + Shift' : ''}`;
});
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && keyboardLocked) { navigator.keyboard?.unlock(); keyboardLocked = false; window.keyboardLockActive = false; } setStatus(document.fullscreenElement ? 'Fullscreen enabled. You can lock the keyboard.' : 'Waiting to enter fullscreen.'); updateControls(); });
updateControls();
