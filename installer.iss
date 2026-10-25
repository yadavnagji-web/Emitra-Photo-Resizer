; Inno Setup Script for "फोटो & साइन रीसाइज़र (E-Mitra Desktop Suite)"
; Generates a professional Windows Setup Wizard with Control Panel uninstaller, Desktop & Start Menu shortcuts, and custom branding icon.

#define MyAppName "फोटो & साइन रीसाइज़र"
#define MyAppEnglishName "E-Mitra Photo Resizer"
#define MyAppVersion "2.0"
#define MyAppPublisher "E-Mitra Desktop Tools"
#define MyAppExeName "EmitraPhotoResizer.exe"

[Setup]
AppId={{9F82A31B-4E7C-4D21-B881-A6B413E78D90}
AppName={#MyAppName} ({#MyAppEnglishName})
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL=http://127.0.0.1:8000
AppSupportURL=http://127.0.0.1:8000
AppUpdatesURL=http://127.0.0.1:8000
DefaultDirName={autopf}\Emitra Photo Resizer
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=.
OutputBaseFilename=Setup_Emitra_Photo_Resizer_v2.0
SetupIconFile=app_icon.ico
UninstallDisplayIcon={app}\app_icon.ico
UninstallDisplayName={#MyAppName} - E-Mitra Photo & Signature Resizer v{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
WizardResizable=no
PrivilegesRequiredOverridesAllowed=commandline dialog
ArchitecturesInstallIn64BitMode=x64compatible
DisableProgramGroupPage=auto

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "डेस्कटॉप पर शॉर्टकट बनाएं (Create Desktop Shortcut)"; GroupDescription: "अतिरिक्त विकल्प (Additional shortcuts):"; Flags: unchecked

[Files]
; Standalone compiled binaries and assets
Source: "dist\EmitraPhotoResizer\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "app_icon.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "app_icon.png"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Start Menu Shortcuts
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app_icon.ico"; Comment: "फास्ट फोटो व साइन रीसाइज़र टूल"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"; IconFilename: "{app}\app_icon.ico"
; Desktop Shortcut
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app_icon.ico"; Tasks: desktopicon; Comment: "फास्ट फोटो व साइन रीसाइज़र टूल"

[Run]
; Option to launch app immediately after installation
Filename: "{app}\{#MyAppExeName}"; Description: "टूल अभी शुरू करें (Launch {#MyAppName} Now)"; Flags: postinstall nowait skipifsilent

[Messages]
WelcomeLabel1=फोटो & साइन रीसाइज़र सेटअप विज़ार्ड में आपका स्वागत है
WelcomeLabel2=यह विज़ार्ड आपके कंप्यूटर पर [name] को इंस्टॉल करेगा।%n%nविशेष रूप से साइबर कैफे व ई-मित्र ऑपरेटरों के लिए बनाया गया अल्ट्रा-फास्ट और 100%% ऑफलाइन टूल।%n%nजारी रखने के लिए 'Next' पर क्लिक करें।
FinishedHeadingLabel=इंस्टॉलेशन सफलतापूर्वक पूरा हुआ!
FinishedLabel=[name] आपके कंप्यूटर पर सफलतापूर्वक इंस्टॉल हो चुका है। अब आप इसे डेस्कटॉप आइकॉन या स्टार्ट मेन्यू से कभी भी शुरू कर सकते हैं।
