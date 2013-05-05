# CMPSCI 326 Web Programming: Project 5
# Team Sunapee

## How to Run
You can run our app using `node app.js`
In your browser (preferably Chrome), go to localhost:3000
 
## Project Assignment 05

Here is a list of the files and the main additions we made:
* We added lib/sql.js and lib/initEntry.js to handle most of the database functions.
* Database tables were created using sql/userinfo.sql.
* Our composing tweet and follow/unfollow user functionalities are still in AJAX.
* Our chat functionality uses Websockets and could count as our new feature.
* Note that our "trending hashtags" is a simple fetch of saved hashtags in the database.

## Our Working Features
###USER
* Register and create a new account. In registering for a new user, please use a valid and active email. The system does send email! Granted, you have internet access!
* Logging in to a registered account. Login checks such as incorrect username and password have been implemented.
* Editing profile. Existing and logged in users can edit some profile information including profile image and background. Please use Chrome for this.
* Editing permission settings.
* Follow/Unfollow users.

###MESSAGING
* Composing new tweet.
* Replying to tweet.
* Deleting tweet owned by logged-in user.
* Chat.
* Use of mentions and hashtags.

For testing what is already functional:
* You may use login username: {tim, hazel, caleb, cheerfuldonkey, thepooh}, password: {mit, lezah, belac, eeyore, winnie}
* In registering for a new user, please use a valid and active email. The system does send email! Granted, you have internet access!
