# slack-jarvis
Slack Bot that gives us summaries of stuff, keeps track of things we vote on, etc

## Quick start
1. Put your Slack Bots API token in `secret.txt` in the root directory
2. Install, and run the bot
	```
	npm install
	npm start
	```

## Commands
- `..ping`  
  Tests if the bot is responsive

- `..startLatex`  
  Starts responding to LaTeX syntax for conversion

- `..endLatex`  
  Ends responding to LaTeX syntax for conversion

  e.g.
  ```
  ..startLatex
  $\frac{1}{2} = 0.5$
  ```
  ![readme_example_latex](https://github.com/gin/slack-jarvis/blob/master/readme_example_latex.png)
