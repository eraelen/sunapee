# CMPSCI 326 Web Programming: Project 3
# Team Sunapee

## How to Run
You can run our app using `node app.js`
 
## Project Assignment 03

Here is a list of the files and the main additions we made:
- app.js: added new routes
- entry.js: changed from cookies to sessions
- index.js: incorperated sessions and route handlers/functions for button/link functionality, such as new tweet
- views directory: ejs header inserts logged in user for tweetee session, minor changes in content
- pdf: indicates the possible new features that we would like to add

Some additional notes:
* Navigation Bar : 
  We did not have enough time to finalize the compose new tweet and implement private messaging for this project (through the navbar). At the moment, they are inactive. The compose new tweet functionality is working through the User Home page. The tools icon should also contain a dropdown menu for edit settings, edit profile but clicking on it now simply directs the user to the Edit Settings page with a link to Edit Profile page.
* Overall Functionality:
  Some functionality in the pages are not completely working or functional. Some issues are:
  * searching is only through hashtags and does not take into account users and help topics
  
For testing what is already functional:
* You may use login username: {tim, hazel, caleb}, password: {mit, lezah, belac}
* In registering for a new user, please use a valid and active email. The system does send email!
