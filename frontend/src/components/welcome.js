export default function Welcome(root) {
  const component = document.createElement('div');
  component.innerHTML = `
        <div class="game-box">
            <img src="https://res.cloudinary.com/dpxfbom0j/image/upload/v1740983456/LO-removebg-preview_t4phmb.png" alt="Lotto Pinoy Logo" class="logo">
        </div>
    </div>
    <div class="play-container">
        <a href="/login" class="play-btn">PLAY NOW</a>
    </div>
    <div class="coins-background"></div>
  `;

  root.appendChild(component);
}
