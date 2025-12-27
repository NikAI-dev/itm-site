import './App.css';
import { useState, useEffect, useRef } from "react"

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [width, setWidth] = useState(64);
  const [resultUrl, setResult] = useState(null);

  const fileInputRef = useRef(null);

  function openFilePicker() {
    fileInputRef.current.click();
  }
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
    form.append("image", file);
    console.log(width)
    form.append("width", width);

    try {
      const res = await fetch('http://localhost:5000/minecraftify', {
        method:"POST",
        body:form
      });
      console.log(res)
      if (!res.ok) throw new Error(await res.text());
         // or res.blob() if returning an image

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  /*function download() { // auto-download
    const a = document.createElement("a"); //makes invisible link
    a.href = resultUrl; //assings it to the image
    a.download = "minecraft.png"; //says that it'll be called this when downloaded
    a.click(); //simulates a click so the file downloads itself
  }*/
  

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

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
            <input ref={fileInputRef} type="file" id="image-upload" onChange={handleFileChange} name="profile_pic" accept="image/png, image/jpeg" class="fileInput" />
            
          
            <label for="image-upload" class="file-label">
              {preview == null ? (
                <span class="upload-text">Click to Upload Image</span>
              ) : (
                <div className='imageBox'>
                  <img className='image' src={preview} alt='Preview'/>
                </div>
                
              )
              }
            </label>
            <div className='submitButton' onClick={openFilePicker}>
              Upload Image
            </div>
          </div>  
          <div class="block-number">
            <label for="width-selection" class="block-label"><p>Number of horizontal blocks</p></label>
            <input id="width-selection" type="number" class="block-input" value={width} onChange={handleWidthChange}/>
          </div>
          <div className="submitButton" onClick={handleSubmit}>
            Convert
          </div>
        </form>
        {resultUrl && 
        (
          <div>
            <div className="imageBox">
              <img className="image" src={resultUrl} alt="Result" />
            </div>
            <a href={resultUrl} download="minecraft.png" className='dwn-link-btn'>
              <div className="submitButton">
                Download
              </div>
            </a>
          </div>
        )}
      </div>
      <div className="footer">
        <p><a>Github</a></p>
      </div>
    </div>
  );
}

export default App;
