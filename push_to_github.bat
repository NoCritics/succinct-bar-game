@echo off
echo Adding remote origin...
cd C:\Users\vladi\source\repos\succinct_bar_game
git remote add origin https://github.com/NoCritics/ice-cold-beer-sp1.git
echo.
echo Pushing to GitHub...
git push -u origin master
echo.
echo Done! Your code is now on GitHub.
pause
