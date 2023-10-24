# 添加一个 i18n 代码学习仓库下拉安装依赖脚本

$FILE_DIR_PATH = Get-Location;

$FILE_DIR_PATH = Split-Path -Parent $FILE_DIR_PATH.ToString() ;

$FILE_DIR_PATH = "$FILE_DIR_PATH/study";

Set-Location $FILE_DIR_PATH

git clone https://github.com/lokalise/i18n-ally

$FILE_DIR_PATH = "$FILE_DIR_PATH/i18n-ally"

Set-Location $FILE_DIR_PATH

yarn

Remove-Item -Path ./i18n-ally/.git -Recurse -Force
