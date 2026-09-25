$p = Start-Process cmd -ArgumentList '/c','C:\Users\Del\Desktop\.freebuff\start-frontend.bat' -RedirectStandardOutput 'C:\Users\Del\Desktop\.freebuff\.freebuff\preview-f3bacfb4-c082-49a6-b970-613f45003533.log' -RedirectStandardError 'C:\Users\Del\Desktop\.freebuff\.freebuff\preview-f3bacfb4-c082-49a6-b970-613f45003533.log.err' -WindowStyle Hidden -PassThru
Write-Output "Frontend PID: $($p.Id)"
