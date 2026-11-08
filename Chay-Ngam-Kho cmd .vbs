Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 1. Chay ngam Backend SQLite o che do an
WshShell.CurrentDirectory = currentDir & "\server"
WshShell.Run "cmd /c node server.js", 0, False
WScript.Sleep 2000

' 2. Chay ngam Frontend Vite o che do an
WshShell.CurrentDirectory = currentDir & "\V2"
WshShell.Run "cmd /c npm run dev", 0, False
WScript.Sleep 3000

' 3. Tu dong bat trinh duyet vao trang web kho
WshShell.Run "http://localhost:3000/"