import './App.css';
import { useState } from "react"

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null);
  const [width, setWidth] = useState(64)

  function handleFileChange(e) {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }
  function handleWidthChange(e) {
    setWidth(e.target.value);
  }
  function handleSubmit() {
    upload(file, width);
  }

  async function upload(file, width) {
    const form = new FormData();
    form.append("image", file)
    form.append("width", width)
    try {
      const res = await fetch('http://localhost:5000/minecraftify', {
        method:"POST",
        body:form
      });
      console.log(res)
      if (!res.ok) throw new Error(await res.text());
        return await res.json(); // or res.blob() if returning an image
    } catch (error) {
      console.error('Error fetching data:', error);
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
            <input type="file" id="image-upload" onChange={handleFileChange} name="profile_pic" accept="image/png, image/jpeg" class="fileInput" />
            
          
            <label for="image-upload" class="file-label">
              <span class="upload-icon">⬆️</span>
              <span class="upload-text">Click to Upload Image</span>
            </label>
          </div>
          <div class="block-number">
            <label for="width-selection" class="block-label"><p>Number of horizontal blocks</p></label>
            <input id="width-selection" type="number" class="block-input" value={width} onChange={handleWidthChange}/>
          </div>
          <div id="submitButton" onClick={handleSubmit}>
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
