const lockArea = document.querySelector('#lock-area');
const coordinates = document.querySelector('#coordinates');
const status = document.querySelector('#pointer-status');
const releaseButton = document.querySelector('#release');
let totalX = 0;
let totalY = 0;
window.requestPointerLockForTest = async () => {
  try {
    await lockArea.requestPointerLock({ unadjustedMovement: true });
  } catch (error) {
    try { await lockArea.requestPointerLock(); }
    catch (fallbackError) { throw new Error(fallbackError.message || error.message); }
  }
};
lockArea.addEventListener('click', async () => { try { await window.requestPointerLockForTest(); } catch (error) { status.textContent = `Pointer lock failed: ${error.message}`; } });
document.addEventListener('pointerlockchange', () => { const locked = document.pointerLockElement === lockArea; lockArea.classList.toggle('locked', locked); releaseButton.disabled = !locked; status.textContent = locked ? 'Pointer is locked. Press Esc to release it.' : 'Pointer is not locked.'; });
document.addEventListener('pointerlockerror', () => { status.textContent = 'Pointer lock was denied by the browser.'; });
document.addEventListener('mousemove', (event) => { if (document.pointerLockElement !== lockArea) return; totalX += event.movementX; totalY += event.movementY; coordinates.textContent = `Movement: x ${totalX}, y ${totalY} (last: ${event.movementX}, ${event.movementY})`; });
releaseButton.addEventListener('click', () => document.exitPointerLock());
