[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Output "---------------------------------------------------"

$author = 'fireMan-34'
Write-Output "作者: $author"
Write-Output "$author 提交代码"

$NowTime = Get-Date -Format "yy-MM-dd:hh-mm-ss"

Write-Output "现在时间: $NowTime"

Write-Output "---------------------------------------------------"


npm install

git add package-lock.json