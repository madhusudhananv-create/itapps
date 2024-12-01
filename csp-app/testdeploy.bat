echo %CD%
start /separate /wait cmd /c "ng build --c=test" 
echo %CD%
del \\10.0.100.222\csp\CSPDEV\*.* /q
copy dist-test \\10.0.100.222\csp\CSPDEV