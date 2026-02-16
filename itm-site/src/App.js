import "./App.css";
import { useState, useEffect, useRef } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [width, setWidth] = useState(64);
  const [resultUrl, setResultUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [language, setLanguage] = useState("English");


  const fileInputRef = useRef(null);

  const TEXT = {
    English: {
      title: "MinecraftIMG",
      upload: "Upload Image",
      chooseImage: "Choose an image",
      convert: "Convert",
      blocksLabel: "Number of horizontal blocks",
      help: "Help",
      helpText:
        "Upload an image, choose the number of blocks, and download the Minecraft-style result.",
      download: "Download"
    },
    French: {
      title: "MinecraftIMG",
      upload: "Téléverser une image",
      chooseImage: "Choisir une image",
      convert: "Convertir",
      blocksLabel: "Nombre de blocs horizontaux",
      help: "Aide",
      helpText:
        "Téléversez une image, choisissez le nombre de blocs, puis téléchargez le résultat.",
      download: "Télécharger"
    },
    Russian: {
      title: "MinecraftIMG",
      upload: "Загрузить изображение",
      chooseImage: "Выбрать картинку",
      convert: "Преобразовать",
      blocksLabel: "Количество блоков по горизонтали",
      help: "Помощь",
      helpText:
        "Загрузите изображение, выберите количество блоков и скачайте результат.",
      download: "Закачать"
    },
  };
  const t = TEXT[language];

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setErrorMsg("");
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));

    // allow re-selecting the same file later
    e.target.value = "";
  }

  function handleWidthChange(e) {
    // keep it numeric
    const next = Number(e.target.value);
    setWidth(Number.isFinite(next) ? next : 64);
  }

  async function upload(selectedFile, blockWidth) {
    if (!selectedFile) return;

    const form = new FormData();
    form.append("image", selectedFile);
    form.append("width", String(blockWidth));

    setIsLoading(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/minecraftify`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: await res.text() }));
        throw new Error(errorData.error || "Unknown error");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error("Error fetching data:", err);
      setErrorMsg(err.message || "Conversion failed. Is the Flask server running?");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault(); // stop form reload
    upload(file, width);
  }

  // cleanup blob urls
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  return (
    <div className="App">
      <header className="navbar">
        <div className="titlebox">
          <h3 className="brand">{t.title}</h3>
        </div>

        <div className="infobox">
          <details className="helpDropdown">
            <summary className="linkButton">{t.help}</summary>
            <div className="dropdownPanel">
              {/* TODO: replace this with your real help text later */}
              <p className="dropdownText">
                {t.helpText}
                {/*Choose an image by either clicking on either the <strong>Choose an image</strong> box or the 
                <strong> Upload Image</strong> button.<br/> Then choose the desired <strong>width in blocks </strong>
                of the result image.<br/> Finally, click on <strong>Convert</strong> and wait for the result.<br/>
                <span style={{weight:"bold", color:"red"}}> It is normal if the result isn't instant. We will tell you if an error happens.</span>
                */}
              </p>
            </div>
          </details>

          <div className="language-box">
            <select
              className="languageSelect"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Select language"
            >
              <option value="English">English</option>
              <option value="French">Français</option>
              <option value="Russian">Русский</option>
            </select>
          </div>
        </div>

      </header>

      <main className="mainContent">
        <form className="mainForm" onSubmit={handleSubmit}>
          <section className="upload-container">
            <input
              ref={fileInputRef}
              type="file"
              id="image-upload"
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
              className="fileInput"
            />

            <label htmlFor="image-upload" className="file-label">
              {!previewUrl ? (
                <>
                  <span className="upload-icon">⬆️</span>
                  <span className="upload-text">{t.chooseImage}</span>
                  <span className="upload-subtext">PNG, JPG, JPEG</span>
                </>
              ) : (
                <div className="imageBox">
                  <img className="image" src={previewUrl} alt="Preview" />
                </div>
              )}
            </label>

            <button
              type="button"
              className="btn btnSecondary"
              id="upload-btn"
              onClick={openFilePicker}
              disabled={isLoading}
            >
              {t.upload}
            </button>
          </section>

          <div className="block-number">
            <label htmlFor="width-selection" className="block-label">
              {t.blocksLabel}
            </label>
            <input
              id="width-selection"
              type="number"
              className="block-input"
              value={width}
              onChange={handleWidthChange}
              min={1}
              max={512}
            />
          </div>

          <button
            type="submit"
            className="btn btnPrimary"
            disabled={!file || isLoading}
            title={!file ? "Select an image first" : ""}
          >
            {isLoading ? "Converting..." : t.convert}
          </button>

          {errorMsg && <div className="errorBox">{errorMsg}</div>}
        </form>

        {resultUrl && (
          <section className="outputContainer">
            <div className="imageBox">
              <img className="image" src={resultUrl} alt="Result" />
            </div>

            <a href={resultUrl} download="minecraft.png" className="dwn-link-btn">
              <button type="button" className="btn btnPrimary" id="download-btn">
                {t.download}
              </button>
            </a>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          <a className="footerLink" href="#" onClick={(e) => e.preventDefault()}>
            Github
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
