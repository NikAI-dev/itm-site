import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="navbar">
        <div className="titlebox">
          <h3>MinecraftIMG</h3>
        </div>
        <div className="infobox">
          <h4>Help</h4>
          <div>
            <h4>English</h4>
          </div>
        </div>
      </div>
      <div className="mainContent">
        <form class="mainForm">
          <div class="upload-container">
            <input type="file" id="image-upload" name="profile_pic" accept="image/png, image/jpeg" class="fileInput" />
            
            <label for="image-upload" class="file-label">
              <span class="upload-icon">⬆️</span>
              <span class="upload-text">Click to Upload Image</span>
            </label>
          </div>
          <button type="submit" id="submitButton">Upload Image</button>
        </form>
      </div>
      <div className="footer">
        <p><a>Github</a></p>
      </div>
    </div>
  );
}

export default App;
