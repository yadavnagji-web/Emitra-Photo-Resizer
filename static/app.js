// फोटो, साइन व दस्तावेज़ रीसाइज़र - Client Logic
// 100% Offline • 3-Tab Desktop Suite • Algorithmic Speed • Native Save As Dialog

document.addEventListener("DOMContentLoaded", () => {
  // ================= DOM ELEMENTS: TABS & VIEWS =================
  const tabBtnPhoto = document.getElementById("tabBtnPhoto");
  const tabBtnDoc = document.getElementById("tabBtnDoc");
  const tabBtnPrint = document.getElementById("tabBtnPrint");

  const panelPhoto = document.getElementById("panelPhoto");
  const panelDoc = document.getElementById("panelDoc");
  const panelPrint = document.getElementById("panelPrint");

  const emptyDropZone = document.getElementById("emptyDropZone");
  const activeUnifiedView = document.getElementById("activeUnifiedView");
  const activeDocView = document.getElementById("activeDocView");
  const activePrintView = document.getElementById("activePrintView");

  // ================= DOM ELEMENTS: TAB 1 (PHOTO & SIGN) =================
  const fileBaseName = document.getElementById("fileBaseName");
  const formatSelect = document.getElementById("formatSelect");
  const previewNameTag = document.getElementById("previewNameTag");
  const modeSelect = document.getElementById("modeSelect");
  const photoKbBox = document.getElementById("photoKbBox");
  const signKbBox = document.getElementById("signKbBox");
  const signKbLabel = document.getElementById("signKbLabel");
  const photoTargetKb = document.getElementById("photoTargetKb");
  const signTargetKb = document.getElementById("signTargetKb");

  // Adjustments Toolbar
  const btnRotateLeft = document.getElementById("btnRotateLeft");
  const btnRotateRight = document.getElementById("btnRotateRight");
  const btnToneBright = document.getElementById("btnToneBright");
  const btnToneDark = document.getElementById("btnToneDark");
  const btnToneReset = document.getElementById("btnToneReset");
  const toneIndicator = document.getElementById("toneIndicator");

  const addNameDateCheck = document.getElementById("addNameDateCheck");
  const nameDateFields = document.getElementById("nameDateFields");
  const candidateName = document.getElementById("candidateName");
  const photoDate = document.getElementById("photoDate");

  const btnOpenWhatsApp = document.getElementById("btnOpenWhatsApp");
  const pasteBtn = document.getElementById("pasteBtn");
  const fileInput = document.getElementById("fileInput");
  const btnSaveAs = document.getElementById("btnSaveAs");
  const btnClear = document.getElementById("btnClear");

  // Photo & Sign Canvases & Controls
  const previewTagMeta = document.getElementById("previewTagMeta");
  const btnToolPhoto = document.getElementById("btnToolPhoto");
  const btnToolSign = document.getElementById("btnToolSign");
  const btnAutoReset = document.getElementById("btnAutoReset");
  const cropCanvas = document.getElementById("cropCanvas");
  const cropCtx = cropCanvas.getContext("2d");
  const livePhotoWrapper = document.getElementById("livePhotoWrapper");
  const livePhotoCanvas = document.getElementById("livePhotoCanvas");
  const livePhotoCtx = livePhotoCanvas.getContext("2d");
  const bgActiveBadge = document.getElementById("bgActiveBadge");
  const liveSignWrapper = document.getElementById("liveSignWrapper");
  const liveSignCanvas = document.getElementById("liveSignCanvas");
  const liveSignCtx = liveSignCanvas.getContext("2d");
  const liveFilenameDisplay = document.getElementById("liveFilenameDisplay");

  // ================= DOM ELEMENTS: TAB 2 (DOCUMENTS) =================
  const docModeSelect = document.getElementById("docModeSelect");
  const docBaseName = document.getElementById("docBaseName");
  const docFormatSelect = document.getElementById("docFormatSelect");
  const docTargetKb = document.getElementById("docTargetKb");
  const kbPills = document.querySelectorAll(".kb-pill");
  const btnDocPaste = document.getElementById("btnDocPaste");
  const docFileInput1 = document.getElementById("docFileInput1");
  const docFileInput2 = document.getElementById("docFileInput2");
  const docFileLabel1 = document.getElementById("docFileLabel1");
  const docFileLabel2Wrap = document.getElementById("docFileLabel2Wrap");
  const btnSaveDoc = document.getElementById("btnSaveDoc");
  const btnClearDoc = document.getElementById("btnClearDoc");
  const btnDocRotateLeft = document.getElementById("btnDocRotateLeft");
  const docCanvas = document.getElementById("docCanvas");
  const docCtx = docCanvas.getContext("2d");
  const docMetaPill = document.getElementById("docMetaPill");

  // ================= DOM ELEMENTS: TAB 3 (PRINT SHEET) =================
  const printSheetType = document.getElementById("printSheetType");
  const printBorderCheck = document.getElementById("printBorderCheck");
  const btnPrintNow = document.getElementById("btnPrintNow");
  const btnSavePrintSheet = document.getElementById("btnSavePrintSheet");
  const printSheetCanvas = document.getElementById("printSheetCanvas");
  const printSheetCtx = printSheetCanvas.getContext("2d");
  const printMetaPill = document.getElementById("printMetaPill");

  // ================= DOM ELEMENTS: RECENT CUSTOMERS =================
  const recentChipsContainer = document.getElementById("recentChipsContainer");

  // ================= APPLICATION STATE =================
  let currentTab = "photo"; // 'photo', 'doc', 'print'
  let currentFile = null;
  let currentImage = null;
  let activeTool = "photo"; // 'photo' or 'sign'
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let photoBox = null;
  let signBox = null;
  let isProcessing = false;
  let currentTone = 0; // -30 to +30

  // Document state
  let docFile1 = null;
  let docFile2 = null;
  let docImg1 = null;
  let docImg2 = null;

  // Initialize Indian Date Format (DD/MM/YYYY)
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  photoDate.value = `${dd}/${mm}/${yyyy}`;

  // ================= TAB SWITCHING =================
  function switchTab(tabId) {
    currentTab = tabId;

    tabBtnPhoto.classList.toggle("active", tabId === "photo");
    tabBtnDoc.classList.toggle("active", tabId === "doc");
    tabBtnPrint.classList.toggle("active", tabId === "print");

    panelPhoto.classList.toggle("hidden", tabId !== "photo");
    panelDoc.classList.toggle("hidden", tabId !== "doc");
    panelPrint.classList.toggle("hidden", tabId !== "print");

    if (tabId === "photo") {
      activeDocView.classList.add("hidden");
      activePrintView.classList.add("hidden");
      if (currentImage) {
        emptyDropZone.classList.add("hidden");
        activeUnifiedView.classList.remove("hidden");
        renderCropCanvas();
        updateLiveActualPreview();
      } else {
        emptyDropZone.classList.remove("hidden");
        activeUnifiedView.classList.add("hidden");
      }
    } else if (tabId === "doc") {
      activeUnifiedView.classList.add("hidden");
      activePrintView.classList.add("hidden");
      if (docImg1) {
        emptyDropZone.classList.add("hidden");
        activeDocView.classList.remove("hidden");
        renderDocPreview();
      } else {
        emptyDropZone.classList.remove("hidden");
        activeDocView.classList.add("hidden");
      }
    } else if (tabId === "print") {
      activeUnifiedView.classList.add("hidden");
      activeDocView.classList.add("hidden");
      emptyDropZone.classList.add("hidden");
      activePrintView.classList.remove("hidden");
      renderPrintSheet();
    }
  }

  tabBtnPhoto.addEventListener("click", () => switchTab("photo"));
  tabBtnDoc.addEventListener("click", () => switchTab("doc"));
  tabBtnPrint.addEventListener("click", () => switchTab("print"));

  // ================= TAB 1: FILENAME & LABELS =================
  function getCleanBaseName() {
    let name = (fileBaseName.value || "").trim().toLowerCase();
    name = name.replace(/[^a-z0-9_-]/g, "");
    return name || "ramesh";
  }

  function getFileExtension() {
    return formatSelect.value === "pdf" ? "pdf" : "jpg";
  }

  function updateFilenameDisplay() {
    const base = getCleanBaseName();
    const ext = getFileExtension();
    const mode = modeSelect.value;
    const kb = photoTargetKb.value || 50;
    const signKb = signTargetKb.value || 20;

    const photoName = `${base}.photo.${ext}`;
    const signName = (mode === "thumb") ? `${base}.thumb.${ext}` : `${base}.sig.${ext}`;

    if (mode === "sign" || mode === "thumb") {
      previewNameTag.textContent = signName;
      liveFilenameDisplay.textContent = signName;
      if (previewTagMeta) {
        previewTagMeta.textContent = `${signName} • ${signKb} KB`;
      }
    } else if (mode === "auto") {
      previewNameTag.textContent = `${photoName} + ${signName}`;
      liveFilenameDisplay.textContent = `${photoName} | ${signName}`;
      if (previewTagMeta) {
        previewTagMeta.textContent = `${photoName} (${kb} KB) & ${signName} (${signKb} KB)`;
      }
    } else {
      previewNameTag.textContent = photoName;
      liveFilenameDisplay.textContent = photoName;
      if (previewTagMeta) {
        previewTagMeta.textContent = `${photoName} • ${kb} KB • 3.5 × 4.5 cm`;
      }
    }
  }

  fileBaseName.addEventListener("input", () => {
    updateFilenameDisplay();
    updateLiveActualPreview();
  });
  formatSelect.addEventListener("change", () => {
    updateFilenameDisplay();
    updateLiveActualPreview();
  });
  photoTargetKb.addEventListener("input", () => {
    updateFilenameDisplay();
    updateLiveActualPreview();
  });
  signTargetKb.addEventListener("input", () => {
    updateFilenameDisplay();
    updateLiveActualPreview();
  });

  // Mode Selection Handler
  function handleModeChange() {
    const mode = modeSelect.value;

    if (mode === "photo") {
      photoKbBox.classList.remove("dimmed");
      signKbBox.classList.add("dimmed");
      btnToolPhoto.classList.remove("hidden");
      btnToolSign.classList.add("hidden");
      livePhotoWrapper.classList.remove("hidden");
      liveSignWrapper.classList.add("hidden");
      activeTool = "photo";
      btnToolPhoto.classList.add("active-tool-photo");
      btnToolSign.classList.remove("active-tool-sign");
    } else if (mode === "sign") {
      photoKbBox.classList.add("dimmed");
      signKbBox.classList.remove("dimmed");
      signKbLabel.textContent = "✍️ साइन KB:";
      btnToolPhoto.classList.add("hidden");
      btnToolSign.classList.remove("hidden");
      btnToolSign.textContent = "🔵 साइन बॉक्स";
      livePhotoWrapper.classList.add("hidden");
      liveSignWrapper.classList.remove("hidden");
      activeTool = "sign";
      btnToolSign.classList.add("active-tool-sign");
      btnToolPhoto.classList.remove("active-tool-photo");
    } else if (mode === "thumb") {
      photoKbBox.classList.add("dimmed");
      signKbBox.classList.remove("dimmed");
      signKbLabel.textContent = "👆 अंगूठा KB:";
      btnToolPhoto.classList.add("hidden");
      btnToolSign.classList.remove("hidden");
      btnToolSign.textContent = "🟣 अंगूठा बॉक्स";
      livePhotoWrapper.classList.add("hidden");
      liveSignWrapper.classList.remove("hidden");
      activeTool = "sign";
      btnToolSign.classList.add("active-tool-sign");
      btnToolPhoto.classList.remove("active-tool-photo");
    } else {
      // Both
      photoKbBox.classList.remove("dimmed");
      signKbBox.classList.remove("dimmed");
      signKbLabel.textContent = "✍️ साइन KB:";
      btnToolPhoto.classList.remove("hidden");
      btnToolSign.classList.remove("hidden");
      btnToolSign.textContent = "🔵 साइन बॉक्स";
      livePhotoWrapper.classList.remove("hidden");
      liveSignWrapper.classList.remove("hidden");
      activeTool = "photo";
      btnToolPhoto.classList.add("active-tool-photo");
      btnToolSign.classList.remove("active-tool-sign");
    }

    updateFilenameDisplay();

    if (currentImage) {
      calculateDefaultBoxes(currentImage.naturalWidth, currentImage.naturalHeight);
      renderCropCanvas();
      updateLiveActualPreview();
    }
  }

  modeSelect.addEventListener("change", handleModeChange);
  handleModeChange();

  // Name & Date on Photo
  addNameDateCheck.addEventListener("change", () => {
    nameDateFields.classList.toggle("hidden", !addNameDateCheck.checked);
    updateLiveActualPreview();
  });
  candidateName.addEventListener("input", updateLiveActualPreview);
  photoDate.addEventListener("input", updateLiveActualPreview);

  // Background Color Selector
  document.querySelectorAll("input[name='photoBgColor']").forEach(radio => {
    radio.addEventListener("change", () => {
      updateLiveActualPreview();
    });
  });

  // ================= 90° ROTATION (LEFT & RIGHT) =================
  function rotateCurrentImage(angleDelta) {
    if (!currentImage) {
      alert("कृपया पहले कोई फोटो लोड करें!");
      return;
    }

    const off = document.createElement("canvas");
    off.width = currentImage.naturalHeight;
    off.height = currentImage.naturalWidth;
    const offCtx = off.getContext("2d");

    offCtx.translate(off.width / 2, off.height / 2);
    offCtx.rotate((angleDelta * Math.PI) / 180);
    offCtx.drawImage(currentImage, -currentImage.naturalWidth / 2, -currentImage.naturalHeight / 2);

    const rotatedImg = new Image();
    rotatedImg.onload = () => {
      currentImage = rotatedImg;
      off.toBlob((blob) => {
        currentFile = blob;
        calculateDefaultBoxes(currentImage.naturalWidth, currentImage.naturalHeight);
        renderCropCanvas();
        updateLiveActualPreview();
      }, "image/jpeg", 0.95);
    };
    rotatedImg.src = off.toDataURL("image/jpeg", 0.95);
  }

  btnRotateLeft.addEventListener("click", () => rotateCurrentImage(-90));
  btnRotateRight.addEventListener("click", () => rotateCurrentImage(90));

  // ================= TONE ADJUSTMENT (BRIGHTNESS / CONTRAST) =================
  function updateToneUI() {
    if (toneIndicator) {
      const sign = currentTone > 0 ? "+" : "";
      toneIndicator.textContent = `${sign}${currentTone}%`;
      toneIndicator.style.color = currentTone === 0 ? "#64748b" : (currentTone > 0 ? "#16a34a" : "#dc2626");
    }
    updateLiveActualPreview();
  }

  btnToneBright.addEventListener("click", () => {
    currentTone = Math.min(30, currentTone + 15);
    updateToneUI();
  });

  btnToneDark.addEventListener("click", () => {
    currentTone = Math.max(-30, currentTone - 15);
    updateToneUI();
  });

  if (btnToneReset) {
    btnToneReset.addEventListener("click", () => {
      currentTone = 0;
      updateToneUI();
    });
  }

  // Tool Switching
  btnToolPhoto.addEventListener("click", () => {
    activeTool = "photo";
    btnToolPhoto.classList.add("active-tool-photo");
    btnToolSign.classList.remove("active-tool-sign");
  });

  btnToolSign.addEventListener("click", () => {
    activeTool = "sign";
    btnToolSign.classList.add("active-tool-sign");
    btnToolPhoto.classList.remove("active-tool-photo");
  });

  btnAutoReset.addEventListener("click", () => {
    if (currentImage) {
      currentTone = 0;
      updateToneUI();
      calculateDefaultBoxes(currentImage.naturalWidth, currentImage.naturalHeight);
      renderCropCanvas();
      updateLiveActualPreview();
    }
  });

  // Clear Action
  function clearAll() {
    currentFile = null;
    currentImage = null;
    photoBox = null;
    signBox = null;
    currentTone = 0;
    if (toneIndicator) toneIndicator.textContent = "0%";
    fileInput.value = "";
    emptyDropZone.classList.remove("hidden");
    activeUnifiedView.classList.add("hidden");
  }

  btnClear.addEventListener("click", clearAll);

  // Load Image File (Tab 1)
  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      alert("कृपया एक मान्य इमेज फाइल (JPG, PNG, WEBP) चुनें!");
      return;
    }
    currentFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        emptyDropZone.classList.add("hidden");
        activeUnifiedView.classList.remove("hidden");

        calculateDefaultBoxes(img.naturalWidth, img.naturalHeight);
        renderCropCanvas();
        updateLiveActualPreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Unified WhatsApp Split Launcher
  let waWindow = null;
  async function openOrFocusWhatsAppSplit() {
    const screenW = window.screen.availWidth || window.screen.width;
    const screenH = window.screen.availHeight || window.screen.height;
    const leftPanelW = Math.max(650, Math.min(720, Math.floor(screenW * 0.48)));
    const rightPanelW = screenW - leftPanelW;

    try {
      window.resizeTo(rightPanelW, screenH);
      window.moveTo(leftPanelW, 0);
    } catch (e) {}

    if (waWindow && !waWindow.closed) {
      waWindow.focus();
      return;
    }

    const windowFeatures = `width=${leftPanelW},height=${screenH},left=0,top=0,menubar=no,toolbar=no,status=no,resizable=yes,scrollbars=yes`;
    try {
      const existing = window.open("", "WhatsAppSplitWindow", windowFeatures);
      let isAlreadyLoaded = false;
      if (existing) {
        try {
          if (existing.location.href && existing.location.href !== "about:blank") {
            isAlreadyLoaded = true;
          }
        } catch (crossOriginErr) {
          isAlreadyLoaded = true;
        }

        if (isAlreadyLoaded) {
          existing.focus();
          waWindow = existing;
          return;
        }
        existing.location.href = "https://web.whatsapp.com";
        existing.focus();
        waWindow = existing;
        return;
      }
    } catch (err) {}

    try {
      const chk = await fetch("/api/check-whatsapp");
      const chkData = await chk.json();
      if (chkData && chkData.running) {
        await fetch("/api/open-whatsapp", { method: "POST" });
        return;
      }
    } catch (e) {}

    waWindow = window.open("https://web.whatsapp.com", "WhatsAppSplitWindow", windowFeatures);
    if (waWindow) waWindow.focus();
  }

  btnOpenWhatsApp.addEventListener("click", openOrFocusWhatsAppSplit);

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  });

  // Global Clipboard Paste Event
  async function handlePasteEvent(e) {
    if (currentTab === "doc") {
      handleDocPasteEvent(e);
      return;
    }

    let items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (!items && navigator.clipboard?.read) {
      try {
        const clipItems = await navigator.clipboard.read();
        for (const item of clipItems) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              const blob = await item.getType(type);
              loadFile(blob);
              return;
            }
          }
        }
      } catch (err) {}
    }

    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          loadFile(blob);
          return;
        }
      }
    }
  }

  pasteBtn.addEventListener("click", async () => {
    if (navigator.clipboard?.read) {
      try {
        const clipItems = await navigator.clipboard.read();
        for (const item of clipItems) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              const blob = await item.getType(type);
              loadFile(blob);
              return;
            }
          }
        }
        alert("क्लिपबोर्ड में कोई फोटो नहीं मिली! कृपया WhatsApp से फोटो 'Copy Image' करें।");
      } catch (err) {
        alert("कृपया फोटो पेस्ट करने के लिए Ctrl + V दबाएं!");
      }
    } else {
      alert("कृपया कीबोर्ड से Ctrl + V दबाएं!");
    }
  });

  window.addEventListener("paste", handlePasteEvent);

  // Drag & Drop on Unified Drop Zones
  [emptyDropZone, activeUnifiedView, activeDocView].forEach((zone) => {
    if (!zone) return;
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add("drag-hover");
    });

    zone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove("drag-hover");
    });

    zone.addEventListener("drop", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove("drag-hover");

      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (currentTab === "doc") {
          loadDocFile(file, docModeSelect.value === "id_merge" && docImg1 !== null);
        } else {
          loadFile(file);
        }
        return;
      }

      const html = e.dataTransfer?.getData("text/html");
      if (html) {
        const match = html.match(/src=["'](.*?)["']/);
        if (match && match[1]) {
          try {
            const res = await fetch(match[1]);
            const blob = await res.blob();
            if (blob && (blob.type.startsWith("image/") || blob.type === "application/pdf")) {
              if (currentTab === "doc") {
                loadDocFile(blob, docModeSelect.value === "id_merge" && docImg1 !== null);
              } else {
                loadFile(blob);
              }
              return;
            }
          } catch (err) {}
        }
      }
    });
  });

  // Calculate default crop boxes
  function calculateDefaultBoxes(imgW, imgH) {
    const mode = modeSelect.value;

    if (mode === "sign" || mode === "thumb") {
      photoBox = null;
      signBox = [
        Math.round(imgW * 0.05),
        Math.round(imgH * 0.15),
        Math.round(imgW * 0.9),
        Math.round(imgH * 0.7)
      ];
      return;
    }

    if (mode === "photo") {
      signBox = null;
      const targetAspect = 3.5 / 4.5;
      let pw = imgW * 0.85;
      let ph = pw / targetAspect;
      if (ph > imgH * 0.95) {
        ph = imgH * 0.95;
        pw = ph * targetAspect;
      }
      photoBox = [
        Math.round((imgW - pw) / 2),
        Math.round((imgH - ph) / 2),
        Math.round(pw),
        Math.round(ph)
      ];
      return;
    }

    // Mode: Both Photo & Sign
    if (imgH > imgW * 1.1) {
      const targetAspect = 3.5 / 4.5;
      let ph = imgH * 0.62;
      let pw = ph * targetAspect;
      if (pw > imgW * 0.95) {
        pw = imgW * 0.95;
        ph = pw / targetAspect;
      }
      photoBox = [
        Math.round((imgW - pw) / 2),
        Math.round(imgH * 0.03),
        Math.round(pw),
        Math.round(ph)
      ];
      const sy = Math.round(imgH * 0.68);
      signBox = [
        Math.round(imgW * 0.05),
        sy,
        Math.round(imgW * 0.9),
        Math.round(imgH * 0.28)
      ];
    } else {
      const pw = Math.round(imgW * 0.45);
      const ph = Math.round(pw / (3.5 / 4.5));
      photoBox = [
        Math.round(imgW * 0.05),
        Math.round((imgH - ph) / 2),
        pw,
        ph
      ];
      signBox = [
        Math.round(imgW * 0.52),
        Math.round(imgH * 0.35),
        Math.round(imgW * 0.44),
        Math.round(imgH * 0.5)
      ];
    }
  }

  // Render crop canvas (Left side of unified box)
  function renderCropCanvas() {
    if (!currentImage) return;

    const parentBox = cropCanvas.parentElement;
    const maxW = parentBox ? parentBox.clientWidth - 12 : 550;
    const maxH = parentBox ? parentBox.clientHeight - 12 : 360;

    const scale = Math.min(
      maxW / currentImage.naturalWidth,
      maxH / currentImage.naturalHeight,
      1.0
    );

    const canvasW = Math.max(10, Math.round(currentImage.naturalWidth * scale));
    const canvasH = Math.max(10, Math.round(currentImage.naturalHeight * scale));

    cropCanvas.width = canvasW;
    cropCanvas.height = canvasH;

    cropCtx.drawImage(currentImage, 0, 0, canvasW, canvasH);
    cropCtx.fillStyle = "rgba(0, 0, 0, 0.35)";
    cropCtx.fillRect(0, 0, canvasW, canvasH);

    // Photo Box (Green)
    if (photoBox) {
      const [px, py, pw, ph] = photoBox.map(v => Math.round(v * scale));
      cropCtx.drawImage(currentImage, photoBox[0], photoBox[1], photoBox[2], photoBox[3], px, py, pw, ph);

      cropCtx.strokeStyle = "#22c55e";
      cropCtx.lineWidth = 3;
      cropCtx.strokeRect(px, py, pw, ph);

      cropCtx.fillStyle = "#22c55e";
      cropCtx.font = "bold 12px Inter, sans-serif";
      cropCtx.fillText("👤 फोटो", px + 6, py > 18 ? py - 6 : py + 16);
    }

    // Sign / Thumb Box
    if (signBox && modeSelect.value !== "photo") {
      const isThumb = modeSelect.value === "thumb";
      const boxColor = isThumb ? "#a855f7" : "#3b82f6";
      const boxLabel = isThumb ? "🟣 अंगूठा" : "✍️ साइन";

      const [sx, sy, sw, sh] = signBox.map(v => Math.round(v * scale));
      cropCtx.drawImage(currentImage, signBox[0], signBox[1], signBox[2], signBox[3], sx, sy, sw, sh);

      cropCtx.strokeStyle = boxColor;
      cropCtx.lineWidth = 3;
      cropCtx.strokeRect(sx, sy, sw, sh);

      cropCtx.fillStyle = boxColor;
      cropCtx.font = "bold 12px Inter, sans-serif";
      cropCtx.fillText(boxLabel, sx + 6, sy > 18 ? sy - 6 : sy + 16);
    }
  }

  // Update Live Actual Output Preview (Right side of unified box)
  function updateLiveActualPreview() {
    if (!currentImage) return;

    updateFilenameDisplay();
    const mode = modeSelect.value;
    const bgRadio = document.querySelector("input[name='photoBgColor']:checked");
    const bgColor = bgRadio ? bgRadio.value : "original";

    // 1. Live Passport Photo
    if (photoBox && mode !== "sign" && mode !== "thumb") {
      livePhotoWrapper.classList.remove("hidden");

      const targetW = 280;
      const targetH = Math.round(targetW * (4.5 / 3.5)); // 360px

      livePhotoCanvas.width = targetW;
      livePhotoCanvas.height = targetH;

      // Update background badge
      if (bgActiveBadge) {
        if (bgColor === "white") {
          bgActiveBadge.textContent = "⚪ सफेद बैकग्राउंड मोड";
          bgActiveBadge.classList.remove("hidden");
        } else if (bgColor === "blue") {
          bgActiveBadge.textContent = "🔵 नीला बैकग्राउंड मोड";
          bgActiveBadge.classList.remove("hidden");
        } else {
          bgActiveBadge.classList.add("hidden");
        }
      }

      livePhotoCtx.filter = `brightness(${100 + currentTone}%) contrast(${100 + Math.abs(currentTone) * 0.5}%)`;

      livePhotoCtx.drawImage(
        currentImage,
        photoBox[0], photoBox[1], photoBox[2], photoBox[3],
        0, 0, targetW, targetH
      );

      livePhotoCtx.filter = "none";

      // Candidate Name & Date Banner
      if (addNameDateCheck.checked && (candidateName.value.trim() || photoDate.value.trim())) {
        const bannerH = Math.round(targetH * 0.18);
        const bannerY = targetH - bannerH;

        livePhotoCtx.fillStyle = "#ffffff";
        livePhotoCtx.fillRect(0, bannerY, targetW, bannerH);

        livePhotoCtx.strokeStyle = "#cbd5e1";
        livePhotoCtx.lineWidth = 1;
        livePhotoCtx.beginPath();
        livePhotoCtx.moveTo(0, bannerY);
        livePhotoCtx.lineTo(targetW, bannerY);
        livePhotoCtx.stroke();

        livePhotoCtx.fillStyle = "#000000";
        livePhotoCtx.textAlign = "center";
        livePhotoCtx.font = "bold 13px Inter, sans-serif";

        const name = candidateName.value.trim().toUpperCase();
        const dop = photoDate.value.trim();

        if (name && dop) {
          livePhotoCtx.fillText(name, targetW / 2, bannerY + bannerH * 0.42);
          livePhotoCtx.font = "bold 12px Inter, sans-serif";
          livePhotoCtx.fillText(`DOP: ${dop}`, targetW / 2, bannerY + bannerH * 0.82);
        } else if (name) {
          livePhotoCtx.fillText(name, targetW / 2, bannerY + bannerH * 0.65);
        } else if (dop) {
          livePhotoCtx.fillText(`DOP: ${dop}`, targetW / 2, bannerY + bannerH * 0.65);
        }
      }
    } else {
      livePhotoWrapper.classList.add("hidden");
    }

    // 2. Live Signature / Thumb
    if (signBox && mode !== "photo") {
      liveSignWrapper.classList.remove("hidden");

      const signW = 260;
      const signH = (mode === "thumb") ? 200 : 100;
      liveSignCanvas.width = signW;
      liveSignCanvas.height = signH;

      liveSignCtx.fillStyle = "#ffffff";
      liveSignCtx.fillRect(0, 0, signW, signH);

      liveSignCtx.filter = `contrast(135%) brightness(${100 + currentTone}%)`;
      liveSignCtx.drawImage(
        currentImage,
        signBox[0], signBox[1], signBox[2], signBox[3],
        0, 0, signW, signH
      );
      liveSignCtx.filter = "none";
    } else {
      liveSignWrapper.classList.add("hidden");
    }
  }

  // Interactive mouse dragging on cropCanvas
  function getCanvasCoords(e) {
    const rect = cropCanvas.getBoundingClientRect();
    const scaleX = currentImage.naturalWidth / cropCanvas.width;
    const scaleY = currentImage.naturalHeight / cropCanvas.height;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const canvasX = (clientX - rect.left) * (cropCanvas.width / rect.width);
    const canvasY = (clientY - rect.top) * (cropCanvas.height / rect.height);

    return {
      x: Math.round(canvasX * scaleX),
      y: Math.round(canvasY * scaleY)
    };
  }

  cropCanvas.addEventListener("mousedown", (e) => {
    if (!currentImage) return;
    isDragging = true;
    dragStart = getCanvasCoords(e);
  });

  cropCanvas.addEventListener("mousemove", (e) => {
    if (!isDragging || !currentImage) return;
    const current = getCanvasCoords(e);

    const x = Math.max(0, Math.min(dragStart.x, current.x));
    const y = Math.max(0, Math.min(dragStart.y, current.y));
    const w = Math.min(Math.abs(current.x - dragStart.x), currentImage.naturalWidth - x);
    const h = Math.min(Math.abs(current.y - dragStart.y), currentImage.naturalHeight - y);

    if (w > 15 && h > 15) {
      if (activeTool === "photo") {
        photoBox = [x, y, w, h];
      } else {
        signBox = [x, y, w, h];
      }
      renderCropCanvas();
      updateLiveActualPreview();
    }
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) isDragging = false;
  });

  // Touch support for cropCanvas
  cropCanvas.addEventListener("touchstart", (e) => {
    if (!currentImage) return;
    isDragging = true;
    dragStart = getCanvasCoords(e);
    e.preventDefault();
  });

  cropCanvas.addEventListener("touchmove", (e) => {
    if (!isDragging || !currentImage) return;
    const current = getCanvasCoords(e);

    const x = Math.max(0, Math.min(dragStart.x, current.x));
    const y = Math.max(0, Math.min(dragStart.y, current.y));
    const w = Math.min(Math.abs(current.x - dragStart.x), currentImage.naturalWidth - x);
    const h = Math.min(Math.abs(current.y - dragStart.y), currentImage.naturalHeight - y);

    if (w > 15 && h > 15) {
      if (activeTool === "photo") {
        photoBox = [x, y, w, h];
      } else {
        signBox = [x, y, w, h];
      }
      renderCropCanvas();
      updateLiveActualPreview();
    }
    e.preventDefault();
  });

  window.addEventListener("touchend", () => {
    if (isDragging) isDragging = false;
  });

  // API Call for Photo / Sign
  async function callProcessAPI() {
    const bgRadio = document.querySelector("input[name='photoBgColor']:checked");
    const bgColor = bgRadio ? bgRadio.value : "original";

    const formData = new FormData();
    formData.append("file", currentFile);
    formData.append("mode", modeSelect.value);
    formData.append("add_date_stamp", addNameDateCheck.checked);
    formData.append("candidate_name", candidateName.value.trim());
    formData.append("photo_date", photoDate.value.trim());
    formData.append("photo_target_kb", photoTargetKb.value);
    formData.append("sign_target_kb", signTargetKb.value);
    formData.append("brightness", currentTone);
    formData.append("contrast", Math.round(Math.abs(currentTone) * 0.5));
    formData.append("bg_color", bgColor);

    const customBoxes = {
      photo: photoBox,
      sign: signBox
    };
    formData.append("custom_boxes_json", JSON.stringify(customBoxes));

    const res = await fetch("/api/process", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "प्रोसेसिंग विफल रही");
    }

    return await res.json();
  }

  function triggerDirectDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ================= SAVE AS (Photo & Sign) =================
  async function handleSaveAs() {
    if (!currentImage) {
      alert("कृपया पहले कोई फोटो पेस्ट या सेलेक्ट करें!");
      return;
    }

    if (isProcessing) return;
    isProcessing = true;
    btnSaveAs.disabled = true;
    const originalText = btnSaveAs.innerHTML;
    btnSaveAs.innerHTML = "⏳ प्रोसेस हो रहा है...";

    try {
      const data = await callProcessAPI();
      if (!data) return;

      const base = getCleanBaseName();
      const ext = getFileExtension();
      const fmt = formatSelect.value;
      const isPdf = fmt === "pdf";
      const mimeType = isPdf ? "application/pdf" : "image/jpeg";
      const typeDesc = isPdf ? "PDF Document (*.pdf)" : "JPEG Image (*.jpg)";

      let savedFiles = [];

      // 1. Photo
      if (data.photo) {
        const photoUrl = `${data.photo.download_url}?name=${base}&format=${fmt}`;
        const photoBlob = await (await fetch(photoUrl)).blob();
        const photoName = `${base}.photo.${ext}`;

        if (window.showSaveFilePicker) {
          try {
            const photoHandle = await window.showSaveFilePicker({
              suggestedName: photoName,
              types: [{ description: typeDesc, accept: { [mimeType]: [`.${ext}`] } }]
            });
            const writable = await photoHandle.createWritable();
            await writable.write(photoBlob);
            await writable.close();
            savedFiles.push(photoHandle.name || photoName);
          } catch (pickerErr) {
            if (pickerErr.name === "AbortError") {
              // User cancelled dialog
            } else {
              triggerDirectDownload(photoUrl, photoName);
              savedFiles.push(photoName);
            }
          }
        } else {
          triggerDirectDownload(photoUrl, photoName);
          savedFiles.push(photoName);
        }
      }

      // 2. Sign / Thumb
      if (data.sign && modeSelect.value !== "photo") {
        const isThumb = modeSelect.value === "thumb";
        const tag = isThumb ? "thumb" : "sig";
        const signUrl = `${data.sign.download_url}?name=${base}&format=${fmt}`;
        const signBlob = await (await fetch(signUrl)).blob();
        const signName = `${base}.${tag}.${ext}`;

        if (window.showSaveFilePicker) {
          try {
            const signHandle = await window.showSaveFilePicker({
              suggestedName: signName,
              types: [{ description: typeDesc, accept: { [mimeType]: [`.${ext}`] } }]
            });
            const writable = await signHandle.createWritable();
            await writable.write(signBlob);
            await writable.close();
            savedFiles.push(signHandle.name || signName);
          } catch (pickerErr) {
            if (pickerErr.name === "AbortError") {
              // User cancelled dialog
            } else {
              triggerDirectDownload(signUrl, signName);
              savedFiles.push(signName);
            }
          }
        } else {
          triggerDirectDownload(signUrl, signName);
          savedFiles.push(signName);
        }
      }

      if (savedFiles.length > 0) {
        saveToRecent(base, "photo");
        alert(`✅ फाइल सफलतापूर्वक सेव हो गई:\n\n📄 ${savedFiles.join("\n📄 ")}`);
      }

    } catch (err) {
      alert("त्रुटि: " + err.message);
    } finally {
      isProcessing = false;
      btnSaveAs.disabled = false;
      btnSaveAs.innerHTML = originalText;
    }
  }

  btnSaveAs.addEventListener("click", handleSaveAs);

  // ================= TAB 2: DOCUMENT & MARKSHEET RESIZER =================
  docModeSelect.addEventListener("change", () => {
    const isMerge = docModeSelect.value === "id_merge";
    docFileLabel2Wrap.classList.toggle("hidden", !isMerge);
    docFileLabel1.textContent = isMerge ? "📂 फ्रंट (आगे का) फोटो चुनें" : "📂 दस्तावेज़ / फ्रंट फोटो चुनें";
    if (isMerge && docBaseName.value.includes("marksheet")) {
      docBaseName.value = docBaseName.value.replace("marksheet", "aadhaar");
    }
    renderDocPreview();
  });

  kbPills.forEach(pill => {
    pill.addEventListener("click", () => {
      kbPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      docTargetKb.value = pill.getAttribute("data-kb");
      renderDocPreview();
    });
  });

  docTargetKb.addEventListener("input", () => {
    kbPills.forEach(p => p.classList.toggle("active", p.getAttribute("data-kb") === docTargetKb.value));
    renderDocPreview();
  });

  // Load document file (handles both images and PDFs!)
  async function loadDocFile(file, isSecond = false) {
    if (!file) return;

    // If PDF document uploaded
    if (file.type === "application/pdf" || (file.name && file.name.toLowerCase().endsWith(".pdf"))) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/render-preview", {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error("PDF लोड नहीं हो सका");
        const json = await res.json();

        const img = new Image();
        img.onload = () => {
          if (isSecond) {
            docFile2 = file;
            docImg2 = img;
          } else {
            docFile1 = file;
            docImg1 = img;
          }
          emptyDropZone.classList.add("hidden");
          activeDocView.classList.remove("hidden");
          renderDocPreview();
        };
        img.src = json.data_url;
        return;
      } catch (pdfErr) {
        alert("PDF लोड करने में त्रुटि: " + pdfErr.message);
        return;
      }
    }

    // If standard image (JPG, PNG, WEBP)
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (isSecond) {
          docFile2 = file;
          docImg2 = img;
        } else {
          docFile1 = file;
          docImg1 = img;
        }
        emptyDropZone.classList.add("hidden");
        activeDocView.classList.remove("hidden");
        renderDocPreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  docFileInput1.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      loadDocFile(e.target.files[0], false);
    }
  });

  docFileInput2.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      loadDocFile(e.target.files[0], true);
    }
  });

  // Paste into document
  async function handleDocPasteEvent(e) {
    let items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (!items && navigator.clipboard?.read) {
      try {
        const clipItems = await navigator.clipboard.read();
        for (const item of clipItems) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              const blob = await item.getType(type);
              loadDocFile(blob, docModeSelect.value === "id_merge" && docImg1 !== null);
              return;
            }
          }
        }
      } catch (err) {}
    }
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          loadDocFile(blob, docModeSelect.value === "id_merge" && docImg1 !== null);
          return;
        }
      }
    }
  }

  btnDocPaste.addEventListener("click", async () => {
    if (navigator.clipboard?.read) {
      try {
        const clipItems = await navigator.clipboard.read();
        for (const item of clipItems) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              const blob = await item.getType(type);
              loadDocFile(blob, docModeSelect.value === "id_merge" && docImg1 !== null);
              return;
            }
          }
        }
        alert("क्लिपबोर्ड में कोई फोटो नहीं मिली! कृपया WhatsApp से डॉक्यूमेंट 'Copy Image' करें।");
      } catch (err) {
        alert("कृपया कीबोर्ड से Ctrl + V दबाएं!");
      }
    } else {
      alert("कृपया कीबोर्ड से Ctrl + V दबाएं!");
    }
  });

  // Document 90° Rotation
  btnDocRotateLeft.addEventListener("click", () => {
    if (!docImg1) return;
    const off = document.createElement("canvas");
    off.width = docImg1.naturalHeight;
    off.height = docImg1.naturalWidth;
    const offCtx = off.getContext("2d");
    offCtx.translate(off.width / 2, off.height / 2);
    offCtx.rotate((-90 * Math.PI) / 180);
    offCtx.drawImage(docImg1, -docImg1.naturalWidth / 2, -docImg1.naturalHeight / 2);

    const rotatedImg = new Image();
    rotatedImg.onload = () => {
      docImg1 = rotatedImg;
      off.toBlob((blob) => {
        docFile1 = blob;
        renderDocPreview();
      }, "image/jpeg", 0.95);
    };
    rotatedImg.src = off.toDataURL("image/jpeg", 0.95);
  });

  // Render Document Preview
  function renderDocPreview() {
    if (!docImg1) return;

    const isMerge = docModeSelect.value === "id_merge";
    const targetKbVal = docTargetKb.value || 150;
    const fmt = docFormatSelect.value.toUpperCase();

    if (isMerge && docImg2) {
      // 2 Cards merged vertically
      const canvasW = 900;
      const canvasH = 1250;
      docCanvas.width = canvasW;
      docCanvas.height = canvasH;

      docCtx.fillStyle = "#ffffff";
      docCtx.fillRect(0, 0, canvasW, canvasH);

      const cardW = 750;
      const cardH = 480;
      const x = (canvasW - cardW) / 2;

      // Front
      docCtx.fillStyle = "#f8fafc";
      docCtx.fillRect(x, 70, cardW, cardH);
      docCtx.drawImage(docImg1, x, 70, cardW, cardH);
      docCtx.strokeStyle = "#94a3b8";
      docCtx.lineWidth = 2;
      docCtx.strokeRect(x, 70, cardW, cardH);

      docCtx.fillStyle = "#1e293b";
      docCtx.font = "bold 16px Inter, sans-serif";
      docCtx.fillText("FRONT SIDE (मुख्य पृष्ठ)", x + 10, 55);

      // Back
      docCtx.fillStyle = "#f8fafc";
      docCtx.fillRect(x, 650, cardW, cardH);
      docCtx.drawImage(docImg2, x, 650, cardW, cardH);
      docCtx.strokeStyle = "#94a3b8";
      docCtx.lineWidth = 2;
      docCtx.strokeRect(x, 650, cardW, cardH);

      docCtx.fillStyle = "#1e293b";
      docCtx.font = "bold 16px Inter, sans-serif";
      docCtx.fillText("BACK SIDE (पिछला पृष्ठ)", x + 10, 635);

      docMetaPill.textContent = `${targetKbVal} KB • आधार (Front+Back) • ${fmt}`;
    } else {
      // Single Document
      const scale = Math.min(800 / docImg1.naturalWidth, 1100 / docImg1.naturalHeight, 1.0);
      const w = Math.max(50, Math.round(docImg1.naturalWidth * scale));
      const h = Math.max(50, Math.round(docImg1.naturalHeight * scale));

      docCanvas.width = w;
      docCanvas.height = h;

      docCtx.fillStyle = "#ffffff";
      docCtx.fillRect(0, 0, w, h);
      docCtx.drawImage(docImg1, 0, 0, w, h);

      docMetaPill.textContent = `${targetKbVal} KB • सिंगल A4 • ${fmt}`;
    }
  }

  // Clear Document Tab
  btnClearDoc.addEventListener("click", () => {
    docFile1 = null;
    docFile2 = null;
    docImg1 = null;
    docImg2 = null;
    docFileInput1.value = "";
    docFileInput2.value = "";
    activeDocView.classList.add("hidden");
    emptyDropZone.classList.remove("hidden");
  });

  // Save Document (Save As)
  async function handleSaveDoc() {
    if (!docFile1) {
      alert("कृपया पहले कोई दस्तावेज़ या मार्कशीट चुनें!");
      return;
    }

    if (isProcessing) return;
    isProcessing = true;
    btnSaveDoc.disabled = true;
    const originalText = btnSaveDoc.innerHTML;
    btnSaveDoc.innerHTML = "⏳ कंप्रेस हो रहा है...";

    try {
      const formData = new FormData();
      formData.append("file1", docFile1);
      if (docModeSelect.value === "id_merge" && docFile2) {
        formData.append("file2", docFile2);
      }
      formData.append("doc_mode", docModeSelect.value);
      formData.append("target_kb", docTargetKb.value);
      formData.append("doc_format", docFormatSelect.value);
      formData.append("doc_name", (docBaseName.value || "marksheet").trim());

      const res = await fetch("/api/process-document", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "दस्तावेज़ प्रोसेसिंग विफल रही");
      }

      const data = await res.json();
      const base = (docBaseName.value || "marksheet").trim().replace(/[^a-z0-9_-]/g, "");
      const ext = data.format === "pdf" ? "pdf" : "jpg";
      const docFilename = `${base}.${ext}`;
      const isPdf = ext === "pdf";
      const mimeType = isPdf ? "application/pdf" : "image/jpeg";
      const typeDesc = isPdf ? "PDF Document (*.pdf)" : "JPEG Image (*.jpg)";

      const docBlob = await (await fetch(data.download_url)).blob();

      if (window.showSaveFilePicker) {
        try {
          const docHandle = await window.showSaveFilePicker({
            suggestedName: docFilename,
            types: [{ description: typeDesc, accept: { [mimeType]: [`.${ext}`] } }]
          });
          const writable = await docHandle.createWritable();
          await writable.write(docBlob);
          await writable.close();
          saveToRecent(base, "doc");
          alert(`✅ दस्तावेज़ (${data.size_kb} KB) सेव हो गया:\n\n📄 ${docHandle.name || docFilename}`);
        } catch (pickerErr) {
          if (pickerErr.name === "AbortError") return;
          triggerDirectDownload(data.download_url, docFilename);
          saveToRecent(base, "doc");
          alert(`✅ दस्तावेज़ (${data.size_kb} KB) डाउनलोड हो गया:\n\n📄 ${docFilename}`);
        }
      } else {
        triggerDirectDownload(data.download_url, docFilename);
        saveToRecent(base, "doc");
        alert(`✅ दस्तावेज़ (${data.size_kb} KB) डाउनलोड हो गया:\n\n📄 ${docFilename}`);
      }

    } catch (err) {
      alert("त्रुटि: " + err.message);
    } finally {
      isProcessing = false;
      btnSaveDoc.disabled = false;
      btnSaveDoc.innerHTML = originalText;
    }
  }

  btnSaveDoc.addEventListener("click", handleSaveDoc);

  // ================= TAB 3: PASSPORT PHOTO PRINT SHEET (300 DPI) =================
  function renderPrintSheet() {
    const layout = printSheetType.value;
    const drawBorder = printBorderCheck.checked;

    let sheetW, sheetH, cols, rows;

    if (layout === "4x6_6") {
      sheetW = 1200; // 4" at 300 DPI
      sheetH = 1800; // 6" at 300 DPI
      cols = 2;
      rows = 3;
      printMetaPill.textContent = "6 फोटो • 4×6 इंच शीट (300 DPI)";
    } else if (layout === "4x6_8") {
      sheetW = 1800;
      sheetH = 1200;
      cols = 4;
      rows = 2;
      printMetaPill.textContent = "8 फोटो • 4×6 इंच शीट (300 DPI)";
    } else if (layout === "a4_12") {
      sheetW = 2480;
      sheetH = 3508;
      cols = 3;
      rows = 4;
      printMetaPill.textContent = "12 फोटो • A4 शीट (300 DPI)";
    } else {
      sheetW = 2480;
      sheetH = 3508;
      cols = 4;
      rows = 6;
      printMetaPill.textContent = "24 फोटो • A4 शीट (300 DPI)";
    }

    printSheetCanvas.width = sheetW;
    printSheetCanvas.height = sheetH;

    printSheetCtx.fillStyle = "#ffffff";
    printSheetCtx.fillRect(0, 0, sheetW, sheetH);

    const photoW = Math.round(sheetW / cols * 0.82);
    const photoH = Math.round(photoW * (4.5 / 3.5));

    const totalGridW = cols * photoW;
    const totalGridH = rows * photoH;
    const gapX = Math.round((sheetW - totalGridW) / (cols + 1));
    const gapY = Math.round((sheetH - totalGridH) / (rows + 1));

    const hasPhoto = Boolean(currentImage && livePhotoCanvas && livePhotoCanvas.width > 0);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gapX + c * (photoW + gapX);
        const y = gapY + r * (photoH + gapY);

        if (hasPhoto) {
          printSheetCtx.drawImage(livePhotoCanvas, x, y, photoW, photoH);
        } else {
          // Placeholder card
          printSheetCtx.fillStyle = "#f1f5f9";
          printSheetCtx.fillRect(x, y, photoW, photoH);
          printSheetCtx.fillStyle = "#64748b";
          printSheetCtx.font = "bold 26px Inter, sans-serif";
          printSheetCtx.textAlign = "center";
          printSheetCtx.fillText("पासपोर्ट फोटो", x + photoW / 2, y + photoH / 2);
        }

        if (drawBorder) {
          printSheetCtx.strokeStyle = "#000000";
          printSheetCtx.lineWidth = 2.5;
          printSheetCtx.strokeRect(x, y, photoW, photoH);
        }
      }
    }

    if (!hasPhoto) {
      printMetaPill.textContent += " • (पहले टैब में फोटो लोड करें)";
    }
  }

  printSheetType.addEventListener("change", renderPrintSheet);
  printBorderCheck.addEventListener("change", renderPrintSheet);

  btnPrintNow.addEventListener("click", () => {
    if (!currentImage) {
      alert("कृपया पहले 'फोटो & साइन' टैब में जाकर फोटो लोड करें!");
      return;
    }
    window.print();
  });

  btnSavePrintSheet.addEventListener("click", () => {
    if (!currentImage) {
      alert("कृपया पहले 'फोटो & साइन' टैब में जाकर फोटो लोड करें!");
      return;
    }

    const base = getCleanBaseName();
    const filename = `${base}.sheet.jpg`;
    const dataUrl = printSheetCanvas.toDataURL("image/jpeg", 0.95);
    triggerDirectDownload(dataUrl, filename);
  });

  // ================= RECENT CUSTOMERS STRIP =================
  function loadRecentChips() {
    try {
      const stored = localStorage.getItem("emitra_recent_customers");
      if (!stored) return;
      const list = JSON.parse(stored);
      if (!Array.isArray(list) || list.length === 0) return;

      recentChipsContainer.innerHTML = "";
      list.forEach(item => {
        const chip = document.createElement("span");
        chip.className = "recent-chip";
        chip.textContent = `${item.type === "doc" ? "📄" : "👤"} ${item.name}`;
        chip.title = `क्लिक करके नाम लोड करें: ${item.name}`;
        chip.addEventListener("click", () => {
          if (item.type === "doc") {
            switchTab("doc");
            docBaseName.value = item.name;
          } else {
            switchTab("photo");
            fileBaseName.value = item.name;
            updateFilenameDisplay();
          }
        });
        recentChipsContainer.appendChild(chip);
      });
    } catch (e) {}
  }

  function saveToRecent(name, type) {
    try {
      let list = [];
      const stored = localStorage.getItem("emitra_recent_customers");
      if (stored) list = JSON.parse(stored);
      list = list.filter(item => item.name !== name);
      list.unshift({ name, type, time: Date.now() });
      if (list.length > 5) list = list.slice(0, 5);
      localStorage.setItem("emitra_recent_customers", JSON.stringify(list));
      loadRecentChips();
    } catch (e) {}
  }

  loadRecentChips();

  // ================= KEYBOARD SHORTCUTS =================
  window.addEventListener("keydown", (e) => {
    // Ctrl + S: Save As
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      if (currentTab === "doc") {
        handleSaveDoc();
      } else {
        handleSaveAs();
      }
    }

    // Delete or Esc: Clear
    if (e.key === "Delete" || e.key === "Escape") {
      if (document.activeElement && ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        return;
      }
      if (currentTab === "doc") {
        btnClearDoc.click();
      } else {
        clearAll();
      }
    }
  });

  // Resize handler
  window.addEventListener("resize", () => {
    if (currentTab === "photo" && currentImage) {
      renderCropCanvas();
      updateLiveActualPreview();
    } else if (currentTab === "doc" && docImg1) {
      renderDocPreview();
    } else if (currentTab === "print") {
      renderPrintSheet();
    }
  });
});
