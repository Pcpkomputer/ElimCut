import { useState, useRef } from 'react'
import logoUrl from '../../../resources/icon.png'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [keywords, setKeywords] = useState<string[]>(['Knocked', 'Eliminated'])
  const [inputValue, setInputValue] = useState("")
  const [outputDir, setOutputDir] = useState("")
  const [padBefore, setPadBefore] = useState<string>("1.5")
  const [padAfter, setPadAfter] = useState<string>("1.5")
  const [isProcessing, setIsProcessing] = useState(false)
  const [videoToPlay, setVideoToPlay] = useState<string | null>(null)
  const [files, setFiles] = useState<any[]>([])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    // Show processing or wait cursor if needed, but for now we'll process sequentially
    const newFiles = [...files]

    for (const file of selectedFiles) {
      if (!file.name.toLowerCase().endsWith('.mp4')) continue

      const filePath = window.api.getFilePath(file as File) || (file as any).path

      if (!filePath) continue

      try {
        const info = await window.api.extractVideoInfo(filePath)
        newFiles.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          path: filePath,
          duration: info.duration,
          resolution: info.resolution,
          size: info.size,
          thumbnail: info.thumbnail,
          status: 'idle'
        })
      } catch (err) {
        console.error("Failed to extract info for", file.name, err)
      }
    }

    setFiles(newFiles)
    e.target.value = ''
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !keywords.includes(trimmed)) {
        setKeywords([...keywords, trimmed]);
        setInputValue("");
      }
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      setKeywords(keywords.slice(0, -1));
    }
  }

  const removeKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter(kw => kw !== kwToRemove));
  }

  const startProcessing = async () => {
    if (keywords.length === 0) {
      alert("Please add at least one keyword!")
      return
    }
    if (!outputDir) {
      alert("Please select an output folder first!")
      return
    }

    setIsModalOpen(false)
    setIsProcessing(true)

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i]

      setFiles(currentFiles => currentFiles.map((f, index) =>
        index === i ? { ...f, status: 'processing' } : f
      ))

      try {
        await window.api.processVideo(currentFile.path, outputDir, keywords, parseFloat(padBefore) || 0, parseFloat(padAfter) || 0)

        setFiles(currentFiles => currentFiles.map((f, index) =>
          index === i ? { ...f, status: 'done' } : f
        ))
      } catch (err: any) {
        console.error("Error processing video:", err)
        setFiles(currentFiles => currentFiles.map((f, index) =>
          index === i ? { ...f, status: 'error' } : f
        ))
        alert(`Error processing ${currentFile.name}:\n${err.message || err}`)
      }
    }

    setIsProcessing(false)
  }

  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="flex w-screen h-screen overflow-hidden">
        {/* SideNavBar Component */}
        <aside className="bg-surface-container text-primary font-label-md text-label-md docked left-0 h-full w-64 border-r border-outline-variant flex flex-col py-stack-lg transition-all duration-200 ease-in-out">
          <div style={{ marginBottom: 25 }} className="px-gutter mb-stack-lg">
            <div className="flex items-center gap-stack-md">
              <img src={logoUrl} alt="ElimCut Logo" className="w-10 h-10 object-contain rounded drop-shadow-md" />
              <div>
                <h2 className="font-headline-sm text-headline-sm font-black bg-gradient-to-r from-[#297ECB] to-[#B347C7] text-transparent bg-clip-text drop-shadow-sm">
                  ElimCut
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">
                  v1.0.0
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-grow">
            <ul className="space-y-1">
              {/* Import Active */}
              <li>
                <a
                  className="flex items-center gap-stack-md px-gutter py-3 text-primary border-r-2 border-primary bg-surface-container-highest transition-all duration-200 ease-in-out"
                  href="#"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    file_upload
                  </span>
                  <span>Import</span>
                </a>
              </li>
              {/* Other Tabs */}



            </ul>
          </nav>
        </aside>
        {/* Main Content Area */}
        <main className="flex-grow flex flex-col overflow-hidden bg-surface-dim">

          {/* Scrollable Content */}
          <div style={{ alignItems: "center", display: "flex", flexDirection: "column" }} className="flex-grow overflow-y-auto space-y-stack-lg">
            {/* Section: Drag and Drop */}
            <section style={{ width: "100%", paddingLeft: 50, paddingRight: 50, marginTop: 50, marginBottom: 50 }}>
              <div
                style={{}}
                className="group relative flex flex-col items-center justify-center w-full h-[420px] border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low transition-all duration-300 hover:border-primary/50 hover:bg-surface-container cursor-pointer overflow-hidden"
                id="dropZone"
              >
                {/* Background Pattern/Effect */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                  <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern
                        height={40}
                        id="grid"
                        patternUnits="userSpaceOnUse"
                        width={40}
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1}
                        />
                      </pattern>
                    </defs>
                    <rect fill="url(#grid)" height="100%" width="100%" />
                  </svg>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 mb-stack-lg rounded-full bg-surface-container-highest flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-transform">
                    <span
                      className="material-symbols-outlined text-primary text-4xl"
                      style={{ fontVariationSettings: '"opsz" 48' }}
                    >
                      cloud_upload
                    </span>
                  </div>
                  <h2 style={{ marginTop: 15, marginBottom: 15 }} className="font-headline-lg text-headline-lg text-on-surface mb-stack-sm">
                    Import your footage
                  </h2>
                  <p style={{ marginBottom: 20 }} className="text-on-surface-variant text-body-lg max-w-md">
                    Drag and drop video files here, or{" "}
                    <span className="text-primary font-medium hover:underline">
                      browse files
                    </span>{" "}
                    on your computer.
                  </p>
                  <div className="mt-stack-lg flex gap-stack-md">
                    <span className="px-3 py-1 rounded bg-surface-variant text-on-surface-variant text-label-md border border-outline-variant/30">
                      .MP4
                    </span>
                  </div>
                </div>
                {/* Hidden input */}
                <input
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                  id="fileInput"
                  multiple={true}
                  accept=".mp4,video/mp4"
                  type="file"
                  onChange={handleFileSelect}
                />
              </div>
            </section>
            {/* Section: Queue */}
            <section className="mx-auto" style={{ width: "100%", paddingLeft: 50, paddingRight: 50 }}>
              <div style={{ marginBottom: 30 }} className="flex items-center justify-between mb-stack-md">
                <div className="flex items-center gap-stack-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Queued Videos
                  </h3>
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black px-2 py-0.5 rounded-full">
                    {files.length} FILES
                  </span>
                </div>
                <button onClick={() => setFiles([])} style={{ cursor: "pointer" }} className="text-label-md text-on-surface-variant hover:text-error transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    delete_sweep
                  </span>
                  Clear All
                </button>
              </div>
              {/* Queue List */}
              <div style={{ marginBottom: 50 }} className="bg-surface-container rounded-lg border border-outline-variant divide-y divide-outline-variant/30 overflow-hidden min-h-[100px] flex flex-col justify-center">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-60">
                    <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                    <p className="text-on-surface-variant text-body-md">No videos queued. Please import some footage.</p>
                  </div>
                ) : (
                  files.map(file => (
                    <div key={file.id} className="flex items-center gap-gutter p-gutter hover:bg-surface-container-high transition-colors group">
                      <div className="relative w-32 h-18 rounded overflow-hidden flex-shrink-0 bg-surface-container-lowest">
                        <img
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                          alt={file.name}
                          src={file.thumbnail}
                        />
                        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono-sm text-white">
                          {file.duration}
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-body-lg text-on-surface truncate">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-stack-lg mt-1">
                          <span className="text-label-md text-on-surface-variant uppercase flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              hd
                            </span>{" "}
                            {file.resolution}
                          </span>
                          <span className="text-label-md text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              straighten
                            </span>{" "}
                            {file.size}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-stack-md pr-2">
                        {file.status === 'processing' ? (
                          <div className="flex items-center gap-2 text-primary pr-4">
                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <span className="font-label-md text-label-md">Processing</span>
                          </div>
                        ) : file.status === 'done' ? (
                          <div className="flex items-center gap-2 text-primary pr-4">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="font-label-md text-label-md">Done</span>
                          </div>
                        ) : (
                          <>
                            <button disabled={isProcessing} onClick={() => setVideoToPlay(file.path)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface-variant transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                              <span className="material-symbols-outlined">play_circle</span>
                            </button>
                            <button disabled={isProcessing} onClick={() => setFiles(files.filter(f => f.id !== file.id))} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
          {/* Bottom Action Bar (Contextual) */}
          <footer className="h-20 bg-surface-container border-t border-outline-variant px-container-padding flex items-center justify-end z-20">
            <div className="flex items-center gap-stack-md">
              <button
                onClick={() => {
                  if (files.length === 0) {
                    alert("Please import at least one video first.")
                    return
                  }
                  setIsModalOpen(true)
                }}
                disabled={files.length === 0 || isProcessing}
                className="px-8 h-11 rounded bg-primary font-label-md text-label-md text-on-primary font-bold hover:bg-primary-container transition-all shadow-lg shadow-primary/10 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                Proceed to Configure
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* OCR Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container rounded-xl border border-outline-variant w-[500px] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-gutter py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">OCR Configuration</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-gutter space-y-stack-md flex-grow">
              <p style={{ marginBottom: 10 }} className="text-body-md text-on-surface-variant">
                Configure the keywords required for OCR to automatically cut the footage.
              </p>

              <div className="space-y-2">
                <label className="text-label-md font-bold text-on-surface">Custom Keywords</label>
                <div style={{ marginTop: 5, marginBottom: 10 }} className="flex flex-wrap gap-2 p-2 bg-surface-container-lowest border border-outline-variant rounded focus-within:border-primary transition-colors min-h-[50px] items-center">
                  {keywords.map(kw => (
                    <span key={kw} className="flex items-center gap-1 px-3 py-1 bg-primary-container text-on-primary-container rounded text-body-md">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="hover:text-error transition-colors flex items-center justify-center cursor-pointer">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={keywords.length === 0 ? "Type and press Enter..." : ""}
                    className="flex-grow bg-transparent text-on-surface focus:outline-none min-w-[120px] p-1"
                  />
                </div>
                <p style={{ marginBottom: 15 }} className="text-[10px] text-on-surface-variant">Press Enter or comma to add a keyword.</p>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-label-md font-bold text-on-surface">Output Folder</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={outputDir}
                    onChange={(e) => setOutputDir(e.target.value)}
                    placeholder="Select or enter folder path..."
                    className="flex-grow bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={async () => {
                      const dir = await window.api.selectDirectory()
                      if (dir) setOutputDir(dir)
                    }}
                    className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded border border-outline-variant hover:bg-surface-container-high transition-colors text-label-md font-bold cursor-pointer"
                  >
                    Browse
                  </button>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <label className="text-label-md font-bold text-on-surface">Clip Padding (Seconds)</label>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1 w-1/2">
                    <span className="text-body-sm text-on-surface-variant">Before Elimination</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={padBefore}
                      onChange={(e) => setPadBefore(e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-1/2">
                    <span className="text-body-sm text-on-surface-variant">After Elimination</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={padAfter}
                      onChange={(e) => setPadAfter(e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 13 }} className="mt-6 p-3 bg-primary-container/30 rounded border border-primary/20 flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">info</span>
                <p className="text-body-md text-on-surface-variant">
                  If <strong className="text-primary">Knocked</strong> and <strong className="text-primary">Eliminated</strong> keywords are selected, the tool will automatically cut all eliminated scenes from the footage.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-gutter py-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-stack-md">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 h-10 rounded border border-outline-variant font-label-md text-label-md text-on-surface hover:bg-surface-variant transition-colors active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={startProcessing}
                disabled={keywords.length === 0 || !outputDir}
                className="px-6 h-10 rounded bg-primary font-label-md text-label-md text-on-primary font-bold hover:bg-primary-container transition-all shadow-lg shadow-primary/10 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                Process Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {videoToPlay && (
        <VideoPlayerModal
          videoPath={videoToPlay}
          onClose={() => setVideoToPlay(null)}
        />
      )}


    </>
  )
}

function VideoPlayerModal({ videoPath, onClose }: { videoPath: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
      <div className="bg-surface-container rounded-xl border border-outline-variant shadow-2xl flex flex-col overflow-hidden max-w-5xl w-full">
        {/* Header */}
        <div className="px-gutter py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
          <h3 className="font-headline-sm text-headline-sm text-on-surface truncate pr-4">
            Video Preview
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface-variant transition-colors cursor-pointer flex-shrink-0"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="bg-black flex items-center justify-center aspect-video relative">
          <video
            src={`file://${encodeURI(videoPath)}`}
            controls
            autoPlay
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}

export default App
