Set WshShell = CreateObject("WScript.Shell")

' Beri jeda singkat 800ms agar jendela browser muncul
WScript.Sleep 800

Dim found
found = False

' Coba aktifkan jendela aplikasi OPTIMUS dengan cepat (setiap 300ms)
For i = 1 To 20
    If WshShell.AppActivate("UOBK RSUD AL-MULK") Then
        found = True
        Exit For
    ElseIf WshShell.AppActivate("Sistem Pelaporan Mutu") Then
        found = True
        Exit For
    ElseIf WshShell.AppActivate("OPTIMUS") Then
        found = True
        Exit For
    ElseIf WshShell.AppActivate("localhost:3002") Then
        found = True
        Exit For
    ElseIf WshShell.AppActivate("Edge") Then
        found = True
        Exit For
    ElseIf WshShell.AppActivate("Chrome") Then
        found = True
        Exit For
    End If
    WScript.Sleep 300
Next

If found Then
    WScript.Sleep 200
    WshShell.SendKeys "{F11}"
End If
