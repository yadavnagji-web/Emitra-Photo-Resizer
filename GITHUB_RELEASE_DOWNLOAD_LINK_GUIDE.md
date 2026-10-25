# 🚀 GitHub पर Downloadable Link बनाने की पूरी गाइड (2 मिनट में)

आपके पास पहले से तैयार इंस्टॉलर मौजूद है:
📁 **`Setup_Emitra_Photo_Resizer_v2.0.exe`** (लगभग 70.5 MB)

GitHub पर किसी भी सॉफ्टवेयर का डायरेक्ट डाउनलोड लिंक बनाने का सबसे सही, सुरक्षित और प्रोफेशनल तरीका **"GitHub Releases"** होता है। इससे:
1. यूजर को सीधा 1-क्लिक हाई-स्पीड डाउनलोड लिंक मिलता है (बिना किसी विज्ञापन या कैप्चा के)।
2. GitHub आपको लाइव डाउनलोड काउंटर (कितने लोगों ने डाउनलोड किया) भी दिखाता है।
3. आपकी रिपॉजिटरी का साइज भारी नहीं होता।

---

## तरीका 1: ब्राउज़र से 2 मिनट में अपलोड करें (सबसे आसान - बिना किसी कमांड के)

### स्टेप 1: GitHub पर रिपॉजिटरी बनाएं
1. [github.com](https://github.com) खोलें और अपने अकाउंट में लॉगिन करें।
2. ऊपर दाएँ कोने में **`+`** (प्लस) आइकन पर क्लिक करके **"New repository"** चुनें।
3. **Repository name** में लिखें: `Emitra-Photo-Resizer`
4. इसे **Public** रखें और **"Create repository"** पर क्लिक करें।

### स्टेप 2: नया Release (रिलीज़) बनाएं
1. रिपॉजिटरी बनने के बाद, दाएँ हाथ (Right Sidebar) पर देखें, वहाँ **"Releases"** लिखा होगा।
2. **"Create a new release"** (या "Draft a new release") पर क्लिक करें।
3. **Choose a tag:** पर क्लिक करें और टाइप करें `v2.0` और नीचे **"Create new tag: v2.0 on publish"** पर क्लिक करें।
4. **Release title:** में लिखें: `E-Mitra Photo Resizer v2.0 - Official Windows Setup`
5. **Attach binaries by dropping them here:** वाले डिब्बे में अपने डेस्कटॉप फ़ोल्डर से **`Setup_Emitra_Photo_Resizer_v2.0.exe`** फाइल को खींचकर (Drag & Drop) छोड़ दें। (70 MB अपलोड होने में 15-30 सेकंड लगेंगे)।
6. नीचे हरे रंग के बटन **"Publish release"** पर क्लिक कर दें।

---

## 🎉 आपका डायरेक्ट डाउनलोड लिंक क्या होगा?

अपलोड होते ही आपका डायरेक्ट डाउनलोड लिंक तैयार हो जाएगा! 

### 1. डायरेक्ट डाउनलोड लिंक (Direct One-Click Download):
```text
https://github.com/<YOUR_GITHUB_USERNAME>/Emitra-Photo-Resizer/releases/download/v2.0/Setup_Emitra_Photo_Resizer_v2.0.exe
```

### 2. ऑटो-अपडेटिंग लेटेस्ट डाउनलोड लिंक (Always Latest Version):
```text
https://github.com/<YOUR_GITHUB_USERNAME>/Emitra-Photo-Resizer/releases/latest/download/Setup_Emitra_Photo_Resizer_v2.0.exe
```

> **महत्वपूर्ण:** `<YOUR_GITHUB_USERNAME>` की जगह अपना असली GitHub यूजरनेम लिख लें (उदा. यदि आपका यूजरनेम `rahulsharma` है तो लिंक बनेगा:  
> `https://github.com/rahulsharma/Emitra-Photo-Resizer/releases/latest/download/Setup_Emitra_Photo_Resizer_v2.0.exe`)

---

## ब्लॉग पर लगाने के लिए रेडी-टू-पेस्ट डाउनलोड बटन (HTML):

अपने वर्डप्रेस (WordPress), ब्लॉगर (Blogger) या किसी भी वेबसाइट के HTML ब्लॉक में यह कोड पेस्ट कर दें:

```html
<div style="text-align: center; margin: 35px 0;">
  <a href="https://github.com/YOUR_GITHUB_USERNAME/Emitra-Photo-Resizer/releases/latest/download/Setup_Emitra_Photo_Resizer_v2.0.exe" 
     target="_blank" 
     rel="noopener noreferrer"
     style="background: linear-gradient(135deg, #16a34a, #15803d); color: #ffffff; padding: 16px 36px; font-size: 18px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 15px rgba(22,163,74,0.35); display: inline-flex; align-items: center; gap: 10px;">
    <span>⚡ डाउनलोड करें (Windows Setup v2.0)</span>
  </a>
  <div style="font-size: 13px; color: #64748b; margin-top: 10px; font-weight: 500;">
    📦 साइज़: 70 MB • 🛡️ 100% सेफ व ऑफ़लाइन • विंडोज़ 10/11
  </div>
</div>
```

---

## तरीका 2: यदि आप Git टर्मिनल से सोर्स कोड भी पुश करना चाहते हैं:

यदि आप इस पूरे प्रोजेक्ट का सोर्स कोड भी GitHub पर डालना चाहते हैं, तो PowerShell में बस ये 4 कमांड चलाएं:

```powershell
# 1. गिट इनिशियलाइज़ करें
git init

# 2. फाइलें जोड़ें और कमिट करें
git add .
git commit -m "Release v2.0: E-Mitra Photo & Document Resizer"

# 3. मेन ब्रांच सेट करें और अपना गिटहब लिंक जोड़ें
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/Emitra-Photo-Resizer.git

# 4. गिटहब पर पुश करें
git push -u origin main
```
(इसके बाद आप ब्राउज़र में जाकर ऊपर बताए अनुसार Releases में जाकर `.exe` फाइल अटैच कर सकते हैं)।
