import logo from './logo.svg';
import './App.css';

function App() {
  const [message, setMessage] = useState("");

  const handleSubmit = async() => {
    try {
      const response = await fetch('http://localhost:5000/run-function');
      const data = await response.json();
      console.log(data);
      setMessage(data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error connecting to backend');
    }
  };
  
  return (
    <div className="App">
      <div className="navbar">
        <div className="titlebox">
          <h3>MinecraftIMG</h3>
        </div>
        <div className="infobox">
          <h4 className="help-text">Help</h4>
          <div className="language-box">
            <h3 className="language-text">English</h3>
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
          <div class="block-number">
            <label for="width-selection" class="block-label"><p>Number of horizontal blocks</p></label>
            <input id="width-selection" type="number" class="block-input"/>
          </div>
          <div id="submitButton" onclick="handleSubmit()">
            Convert
          </div>
        </form>
      </div>
      <div className="footer">
        <p><a>Github</a></p>
      </div>
    </div>
  );
}

export default App;
